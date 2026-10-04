import express from "express";
import cors from "cors";
import http from "node:http";
import type { Socket as NetSocket } from "node:net";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { Server, type Socket } from "socket.io";
import type { RoomState } from "./types";

export interface ServerOptions {
  origins: string[];
  staticDir?: string;
  maxRooms?: number;
  maxMembers?: number;
  maxConnections?: number;
  roomTtlMs?: number;
}

const record = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);
const validName = (value: unknown): value is string =>
  typeof value === "string" &&
  value.trim().length > 0 &&
  value.trim().length <= 40 &&
  value.trim().toLowerCase() !== "system" &&
  !/[\u0000-\u001f\u007f]/.test(value);
export function validVideoUrl(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 4096) return false;
  if (value === "") return true;
  try {
    const url = new URL(value);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

export function createWatchpartyServer(options: ServerOptions) {
  const app = express();
  app.disable("x-powered-by");
  app.use((_req, res, next) => {
    res.set({
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "X-Frame-Options": "DENY",
    });
    next();
  });
  app.use(cors({ origin: options.origins, methods: ["GET", "POST"] }));
  const server = http.createServer(app);
  const connections = new Set<NetSocket>();
  server.on("connection", (connection) => {
    connections.add(connection);
    connection.once("close", () => connections.delete(connection));
  });
  const io = new Server(server, {
    cors: { origin: options.origins, methods: ["GET", "POST"] },
    maxHttpBufferSize: 300_000,
    // CORS alone does not restrict WebSocket handshakes.
    allowRequest: (req, callback) =>
      callback(
        null,
        !req.headers.origin || options.origins.includes(req.headers.origin),
      ),
  });
  const rooms = new Map<string, RoomState>();
  const emptySince = new Map<string, number>();
  const maxRooms = options.maxRooms ?? 500;
  const maxMembers = options.maxMembers ?? 50;
  const maxConnections = options.maxConnections ?? 1000;
  const ttl = options.roomTtlMs ?? 60_000;
  const memberSockets = (roomId: string) =>
    [...(io.sockets.adapter.rooms.get(`party:${roomId}`) ?? [])]
      .map((id) => io.sockets.sockets.get(id))
      .filter((s): s is Socket => Boolean(s));
  const emitMembers = (roomId: string) => {
    io.to(`party:${roomId}`).emit(
      "room_members",
      memberSockets(roomId).map((s) => ({
        socketId: s.id,
        userName: s.data.userName,
      })),
    );
    if (!memberSockets(roomId).length) emptySince.set(roomId, Date.now());
  };
  const chat = (roomId: string, userName: string, message: string) =>
    io.to(`party:${roomId}`).emit("chat_message", {
      keyId: randomUUID(),
      roomId,
      userName,
      message,
      timestamp: new Date().toISOString(),
    });
  const snapshot = (room: RoomState) => ({
    ...room,
    currentTime:
      room.currentTime +
      (room.playing
        ? ((Date.now() - room.updatedAt) / 1000) * room.playbackRate
        : 0),
    updatedAt: Date.now(),
  });
  const prune = () => {
    for (const [roomId, since] of emptySince) {
      if (Date.now() - since >= ttl) {
        rooms.delete(roomId);
        emptySince.delete(roomId);
      }
    }
  };
  const cleanup = setInterval(prune, Math.max(1000, Math.min(ttl, 30_000)));
  cleanup.unref();

  io.use((_socket, next) => {
    if (io.engine.clientsCount > maxConnections)
      next(new Error("Server is full. Try again later."));
    else next();
  });
  io.on("connection", (socket) => {
    let windowStart = Date.now();
    let events = 0;
    let subtitleUploads = 0;
    const fail = (message: string, ack?: unknown) => {
      socket.emit("room_error", message);
      if (typeof ack === "function") ack({ ok: false, error: message });
    };
    const allow = (ack?: unknown, subtitle = false) => {
      if (Date.now() - windowStart >= 10_000) {
        windowStart = Date.now();
        events = 0;
        subtitleUploads = 0;
      }
      if (++events > 120 || (subtitle && ++subtitleUploads > 5)) {
        fail("Too many requests. Please wait a few seconds.", ack);
        return false;
      }
      return true;
    };
    const joined = (ack?: unknown) => {
      const room = rooms.get(socket.data.roomId);
      if (!room) fail("Join a room first.", ack);
      return room;
    };
    const ok = (ack?: unknown) => {
      if (typeof ack === "function") ack({ ok: true });
    };
    const leave = () => {
      const roomId = socket.data.roomId;
      if (!roomId) return;
      socket.leave(`party:${roomId}`);
      emitMembers(roomId);
      chat(roomId, "system", `${socket.data.userName} left the party.`);
      delete socket.data.roomId;
    };

    socket.on("joined_room", (data: unknown, ack?: unknown) => {
      if (!allow(ack)) return;
      if (
        !record(data) ||
        typeof data.roomId !== "string" ||
        !/^[A-Za-z0-9_-]{4,64}$/.test(data.roomId) ||
        !validName(data.userName)
      ) {
        fail("Use a valid room ID and a name of 1–40 characters.", ack);
        return;
      }
      const { roomId } = data;
      if (socket.data.roomId === roomId) {
        socket.emit("room_state", snapshot(rooms.get(roomId)!));
        emitMembers(roomId);
        ok(ack);
        return;
      }
      prune();
      if (
        (!rooms.has(roomId) && rooms.size >= maxRooms) ||
        memberSockets(roomId).length >= maxMembers
      ) {
        fail("This room or server is full. Try again later.", ack);
        return;
      }
      leave();
      let room = rooms.get(roomId);
      if (!room) {
        room = {
          roomId,
          videoUrl: "",
          playing: false,
          currentTime: 0,
          playbackRate: 1,
          updatedAt: Date.now(),
          subtitle: "",
        };
        rooms.set(roomId, room);
      }
      emptySince.delete(roomId);
      socket.data.roomId = roomId;
      socket.data.userName = data.userName.trim();
      socket.join(`party:${roomId}`);
      emitMembers(roomId);
      socket.emit("room_state", snapshot(room));
      chat(roomId, "system", `${socket.data.userName} joined the party.`);
      ok(ack);
    });
    socket.on("leave_room", (_data: unknown, ack?: unknown) => {
      if (!allow(ack)) return;
      leave();
      ok(ack);
    });
    socket.on("change_userName", (data: unknown, ack?: unknown) => {
      if (!allow(ack) || !joined(ack)) return;
      if (!validName(data)) {
        fail("Choose a name of 1–40 characters; system is reserved.", ack);
        return;
      }
      socket.data.userName = data.trim();
      emitMembers(socket.data.roomId);
      ok(ack);
    });
    socket.on("chat_message", (data: unknown, ack?: unknown) => {
      if (!allow(ack) || !joined(ack)) return;
      if (typeof data !== "string" || !data.trim() || data.length > 2000) {
        fail("Messages must contain 1–2000 characters.", ack);
        return;
      }
      chat(socket.data.roomId, socket.data.userName, data.trim());
      ok(ack);
    });
    socket.on("room_state", (data: unknown, ack?: unknown) => {
      if (!allow(ack)) return;
      const room = joined(ack);
      if (!room) return;
      if (
        !record(data) ||
        !Object.keys(data).length ||
        Object.keys(data).some(
          (k) =>
            !["videoUrl", "playing", "currentTime", "playbackRate"].includes(k),
        ) ||
        ("videoUrl" in data && !validVideoUrl(data.videoUrl)) ||
        ("playing" in data && typeof data.playing !== "boolean") ||
        ("currentTime" in data &&
          (typeof data.currentTime !== "number" ||
            !Number.isFinite(data.currentTime) ||
            data.currentTime < 0 ||
            data.currentTime > 31_536_000)) ||
        ("playbackRate" in data &&
          (typeof data.playbackRate !== "number" ||
            !Number.isFinite(data.playbackRate) ||
            data.playbackRate < 0.25 ||
            data.playbackRate > 4))
      ) {
        fail("Invalid playback update.", ack);
        return;
      }
      // Advance using the previous rate before changing play/pause or speed.
      const current = snapshot(room);
      const changed = "videoUrl" in data && data.videoUrl !== room.videoUrl;
      Object.assign(
        room,
        current,
        changed ? { currentTime: 0, playing: false, subtitle: "" } : {},
        data,
        { updatedAt: Date.now() },
      );
      if (!room.videoUrl) room.playing = false;
      io.to(`party:${room.roomId}`).emit("room_state", room);
      ok(ack);
    });
    socket.on("room_subtitle", (data: unknown, ack?: unknown) => {
      if (!allow(ack, true)) return;
      const room = joined(ack);
      if (!room) return;
      if (
        typeof data !== "string" ||
        Buffer.byteLength(data, "utf8") > 256_000
      ) {
        fail("Subtitles must be text under 256 KB.", ack);
        return;
      }
      room.subtitle = data;
      io.to(`party:${room.roomId}`).emit("room_subtitle", data);
      ok(ack);
    });
    socket.on("disconnect", leave);
  });
  app.get("/healthz", (_req, res) => res.json({ status: "ok" }));
  if (
    options.staticDir &&
    existsSync(path.join(options.staticDir, "index.html"))
  ) {
    app.use(
      express.static(options.staticDir, {
        setHeaders: (res, file) => {
          res.setHeader(
            "Cache-Control",
            file.includes(`${path.sep}assets${path.sep}`)
              ? "public, max-age=31536000, immutable"
              : "no-cache",
          );
        },
      }),
    );
    app.get(["/", "/:roomId"], (req, res, next) => {
      if (
        req.params.roomId &&
        (typeof req.params.roomId !== "string" ||
          !/^[A-Za-z0-9_-]{4,64}$/.test(req.params.roomId))
      ) {
        next();
        return;
      }
      res.setHeader("Cache-Control", "no-cache");
      res.sendFile(path.join(options.staticDir!, "index.html"));
    });
  }
  app.use((_req, res) => res.status(404).json({ error: "Not found" }));
  const close = () =>
    new Promise<void>((resolve, reject) => {
      clearInterval(cleanup);
      const closing = io.close((error) => {
        rooms.clear();
        emptySince.clear();
        if (error && (error as NodeJS.ErrnoException).code !== "ERR_SERVER_NOT_RUNNING") reject(error);
        else resolve();
      });
      // Close upgraded and keep-alive TCP connections too; HTTP close alone can hang.
      void closing.then(() => {}, reject);
      for (const connection of connections) connection.destroy();
    });
  return { app, server, io, rooms, close };
}
