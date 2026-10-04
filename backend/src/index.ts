import "dotenv/config";
import { fileURLToPath } from "node:url";
import { createWatchpartyServer } from "./server";

const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535)
  throw new Error("PORT must be between 1 and 65535.");
const origins = (
  process.env.CLIENT_ORIGIN ??
  (process.env.NODE_ENV === "production"
    ? ""
    : `http://localhost:5173,http://127.0.0.1:5173,http://localhost:${port},http://127.0.0.1:${port}`)
)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
if (
  !origins.length ||
  origins.some((origin) => {
    try {
      const url = new URL(origin);
      return (
        !["http:", "https:"].includes(url.protocol) || url.origin !== origin
      );
    } catch {
      return true;
    }
  })
)
  throw new Error(
    "CLIENT_ORIGIN must list exact frontend origins, e.g. https://watchparty.example.com (no trailing slash).",
  );
const instance = createWatchpartyServer({
  origins,
  staticDir: fileURLToPath(new URL("../../dist/", import.meta.url)),
});
instance.server.listen(port, process.env.HOST ?? "0.0.0.0", () =>
  console.log(`Watchparty listening on port ${port}`),
);
let stopping = false;
const shutdown = () => {
  if (stopping) return;
  stopping = true;
  const deadline = setTimeout(() => process.exit(1), 10_000);
  deadline.unref();
  instance
    .close()
    .then(() => {
      clearTimeout(deadline);
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
};
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
