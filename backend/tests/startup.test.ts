import { expect, test } from "bun:test";
import { fileURLToPath } from "node:url";

const entry = fileURLToPath(new URL("../src/index.ts", import.meta.url));
const cwd = fileURLToPath(new URL("../../", import.meta.url));

test("production startup rejects missing origins and invalid ports", async () => {
  for (const env of [{ CLIENT_ORIGIN: "", PORT: "3000" }, { CLIENT_ORIGIN: "https://example.com", PORT: "0" }, { CLIENT_ORIGIN: "https://example.com/", PORT: "3000" }]) {
    const child = Bun.spawn([process.execPath, entry], { cwd, env: { NODE_ENV: "production", ...env }, stdout: "pipe", stderr: "pipe" });
    expect(await child.exited).not.toBe(0);
    expect(await new Response(child.stderr).text()).toMatch(/CLIENT_ORIGIN|PORT/);
  }
});
