import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { io as connect, type Socket } from "socket.io-client";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createWatchpartyServer } from "../src/server";

const origin = "http://localhost:5173";
let instance: ReturnType<typeof createWatchpartyServer>;
let url: string;
let clients: Socket[];
let staticDir: string;
function event(socket: Socket, name: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      socket.off(name, handler);
      reject(new Error(`Timed out: ${name}`));
    }, 2000);
    const handler = (data: any) => {
      clearTimeout(timeout);
      resolve(data);
    };
    socket.once(name, handler);
  });
}
async function client(room?: string, name = "Alice", transport = "websocket") {
  const socket = connect(url, {
    transports: [transport],
    autoConnect: false,
    forceNew: true,
    extraHeaders: { Origin: origin },
  });
  clients.push(socket);
  const connected = event(socket, "connect");
  socket.connect();
  await connected;
  if (room)
    expect(
      await send(socket, "joined_room", { roomId: room, userName: name }),
    ).toEqual({ ok: true });
  return socket;
}
const send = (socket: Socket, name: string, data: unknown): Promise<any> =>
  socket.timeout(2000).emitWithAck(name, data);

beforeEach(async () => {
  clients = [];
  staticDir = mkdtempSync(join(tmpdir(), "watchparty-test-"));
  writeFileSync(
    join(staticDir, "index.html"),
    "<!doctype html><title>Watchparty</title>",
  );
  instance = createWatchpartyServer({
    origins: [origin],
    staticDir,
    roomTtlMs: 10,
  });
  await new Promise<void>((resolve, reject) =>
    instance.server.once("error", reject).listen(0, "127.0.0.1", resolve),
  );
  url = `http://127.0.0.1:${(instance.server.address() as { port: number }).port}`;
});
afterEach(async () => {
  clients.forEach((socket) => socket.disconnect());
  await instance.close();
  rmSync(staticDir, { recursive: true, force: true });
});

describe("production HTTP", () => {
  test("health, SPA deep links, 404s, headers", async () => {
    const health = await fetch(`${url}/healthz`);
    expect(await health.json()).toEqual({ status: "ok" });
    expect(health.headers.get("x-powered-by")).toBeNull();
    expect(health.headers.get("x-content-type-options")).toBe("nosniff");
    const room = await fetch(`${url}/abcd`);
    expect(await room.text()).toContain("Watchparty");
    expect(room.headers.get("cache-control")).toBe("no-cache");
    expect((await fetch(`${url}/missing.js`)).status).toBe(404);
    expect((await fetch(`${url}/nested/abcd`)).status).toBe(404);
  });
  test("rejects a disallowed WebSocket origin", async () => {
    const socket = connect(url, {
      transports: ["websocket"],
      extraHeaders: { Origin: "https://evil.example" },
      autoConnect: false,
      reconnection: false,
    });
    clients.push(socket);
    const rejected = event(socket, "connect_error");
    socket.connect();
    expect(await rejected).toBeInstanceOf(Error);
    expect(socket.connected).toBe(false);
  });
  test("supports polling fallback", async () => {
    expect((await client("abcd", "Alice", "polling")).connected).toBe(true);
  });
});

describe("room behavior", () => {
  test("shutdown closes active WebSocket connections", async () => {
    const alice = await client("abcd");
    const disconnected = event(alice, "disconnect");
    await instance.close();
    await disconnected;
    expect(instance.server.listening).toBe(false);
  });
  test("membership and renames reach all participants including sender", async () => {
    const alice = await client("abcd");
    const joined = event(alice, "room_members");
    const bob = await client("abcd", "Bob");
    expect(await joined).toHaveLength(2);
    const updateA = event(alice, "room_members"),
      updateB = event(bob, "room_members");
    expect(await send(bob, "change_userName", "Bobby")).toEqual({ ok: true });
    for (const users of [await updateA, await updateB])
      expect(users.map((u: any) => u.userName).sort()).toEqual([
        "Alice",
        "Bobby",
      ]);
    const left = event(alice, "room_members");
    bob.disconnect();
    expect(await left).toHaveLength(1);
  });
  test("switching rooms updates previous membership and isolates chat and subtitles", async () => {
    const alice = await client("abcd");
    const bob = await client("abcd", "Bob");
    const carol = await client("efgh", "Carol");
    const members = event(alice, "room_members");
    await send(bob, "joined_room", { roomId: "efgh", userName: "Bob" });
    expect((await members).map((u: any) => u.userName)).toEqual(["Alice"]);
    const received = event(carol, "chat_message");
    await send(bob, "chat_message", "Hello Carol");
    const message = await received;
    expect(message).toMatchObject({
      userName: "Bob",
      message: "Hello Carol",
      roomId: "efgh",
    });
    expect(message.keyId).toBeString();
    expect(Number.isFinite(Date.parse(message.timestamp))).toBe(true);
    let leaked = false;
    alice.on("room_subtitle", () => {
      leaked = true;
    });
    const subtitle = event(carol, "room_subtitle");
    await send(bob, "room_subtitle", "WEBVTT\n\n00:00.000 --> 00:01.000\nHi");
    expect(await subtitle).toContain("WEBVTT");
    await Bun.sleep(30);
    expect(leaked).toBe(false);
  });
  test("late joins, speed changes and pauses preserve elapsed playback time", async () => {
    const alice = await client("abcd");
    await send(alice, "room_state", {
      videoUrl: "https://example.com/video.mp4",
      currentTime: 10,
      playing: true,
    });
    instance.rooms.get("abcd")!.updatedAt = Date.now() - 5000;
    await send(alice, "room_state", { playbackRate: 2 });
    expect(instance.rooms.get("abcd")!.currentTime).toBeGreaterThanOrEqual(15);
    instance.rooms.get("abcd")!.updatedAt = Date.now() - 3000;
    const bob = await client();
    const state = event(bob, "room_state");
    await send(bob, "joined_room", { roomId: "abcd", userName: "Bob" });
    expect((await state).currentTime).toBeGreaterThanOrEqual(21);
    await send(alice, "room_state", { playing: false });
    expect(instance.rooms.get("abcd")!.currentTime).toBeGreaterThanOrEqual(21);
    expect(instance.rooms.get("abcd")!.playing).toBe(false);
  });
  test("new video clears prior subtitles, reconnect restores the room", async () => {
    const alice = await client("abcd");
    await send(alice, "room_subtitle", "WEBVTT");
    await send(alice, "room_state", {
      videoUrl: "https://example.com/video.mp4",
      currentTime: 42,
    });
    expect(instance.rooms.get("abcd")!.subtitle).toBe("");
    alice.disconnect();
    await Bun.sleep(5);
    const connected = event(alice, "connect");
    alice.connect();
    await connected;
    const restored = event(alice, "room_state");
    await send(alice, "joined_room", { roomId: "abcd", userName: "Alice" });
    expect((await restored).currentTime).toBe(42);
  });
  test("empty rooms expire without deleting occupied rooms", async () => {
    const alice = await client("abcd");
    const bob = await client("efgh", "Bob");
    await send(alice, "leave_room", null);
    await Bun.sleep(20);
    await send(bob, "joined_room", { roomId: "ijkl", userName: "Bob" });
    expect(instance.rooms.has("abcd")).toBe(false);
    expect(instance.rooms.has("efgh")).toBe(true);
    expect(instance.rooms.has("ijkl")).toBe(true);
  });
});

describe("payload and abuse protection", () => {
  test("unjoined clients cannot chat, mutate rooms or upload subtitles", async () => {
    const socket = await client();
    for (const [name, data] of [
      ["chat_message", "Hi"],
      ["room_state", { playing: true }],
      ["room_subtitle", "WEBVTT"],
      ["change_userName", "Alice"],
    ]) {
      expect((await send(socket, name as string, data)).ok).toBe(false);
    }
    expect(instance.rooms.size).toBe(0);
  });
  test("rejects malformed joins, reserved names and updates without corrupting state", async () => {
    const socket = await client();
    for (const data of [
      null,
      {},
      { roomId: "abc", userName: "Alice" },
      { roomId: "abcd", userName: "system" },
    ])
      expect((await send(socket, "joined_room", data)).ok).toBe(false);
    await send(socket, "joined_room", { roomId: "abcd", userName: "Alice" });
    for (const data of [
      null,
      [],
      {},
      { roomId: "efgh" },
      { subtitle: "bad" },
      { videoUrl: "javascript:alert(1)" },
      { videoUrl: "https://user:pass@example.com" },
      { currentTime: -1 },
      { currentTime: Infinity },
      { playing: "yes" },
      { playbackRate: 0 },
      { playbackRate: 5 },
    ])
      expect((await send(socket, "room_state", data)).ok).toBe(false);
    expect(instance.rooms.get("abcd")).toMatchObject({
      roomId: "abcd",
      currentTime: 0,
      playing: false,
      playbackRate: 1,
      videoUrl: "",
    });
    expect((await send(socket, "chat_message", "x".repeat(2001))).ok).toBe(
      false,
    );
    expect((await send(socket, "room_subtitle", "x".repeat(256001))).ok).toBe(
      false,
    );
    expect((await send(socket, "change_userName", " ")).ok).toBe(false);
  });
  test("limits event floods", async () => {
    const socket = await client("abcd");
    let result;
    for (let i = 0; i < 121; i++)
      result = await send(socket, "room_state", { playing: false });
    expect(result).toMatchObject({
      ok: false,
      error: "Too many requests. Please wait a few seconds.",
    });
  });
  test("room capacity rejection keeps the previous membership", async () => {
    await instance.close();
    instance = createWatchpartyServer({
      origins: [origin],
      maxMembers: 1,
      maxRooms: 2,
    });
    await new Promise<void>((resolve, reject) =>
      instance.server.once("error", reject).listen(0, "127.0.0.1", resolve),
    );
    url = `http://127.0.0.1:${(instance.server.address() as { port: number }).port}`;
    await client("abcd");
    const bob = await client("efgh", "Bob");
    expect(
      (await send(bob, "joined_room", { roomId: "abcd", userName: "Bob" })).ok,
    ).toBe(false);
    expect(instance.io.sockets.sockets.get(bob.id!)!.data.roomId).toBe("efgh");
    expect(
      (await send(bob, "joined_room", { roomId: "ijkl", userName: "Bob" })).ok,
    ).toBe(false);
  });
});
