# Watchparty backend

See [the root README](../README.md) for deployment, environment configuration and operational limits.

```sh
bun install --frozen-lockfile
cp .env.example .env
bun run dev
bun run typecheck
bun run test
```

Production: `bun run start`. Required production environment: `CLIENT_ORIGIN` (the exact public frontend origin). Optional: `PORT` and `HOST`. The server serves `../dist` when a frontend build is present and exposes `GET /healthz`.

Socket events: `joined_room`, `leave_room`, `change_userName`, `chat_message`, `room_state`, `room_subtitle`. Mutations require membership. Acknowledgements return `{ ok: true }` or `{ ok: false, error }`. Validation/rate-limit errors also emit `room_error`. All room broadcasts are scoped to members of that room. No database or authentication is configured.
