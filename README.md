# Watchparty

React/Vite frontend and Bun/Express/Socket.IO backend for shared video playback, room chat and subtitles.

## Development

Use Bun 1.3.14 or newer. Install both dependency sets:

```sh
bun install --frozen-lockfile
bun install --cwd backend --frozen-lockfile
cp backend/.env.example backend/.env
```

Run `bun run --cwd backend dev` in one terminal and `bun run dev` in another. Open http://localhost:5173. Vite proxies Socket.IO to port 3000. Share the generated room URL to invite others. Everyone with the URL can change playback; these are guest rooms without accounts or host-only controls.

## Verify before deployment

```sh
bun run check
bun audit
bun audit --cwd backend
```

Checks include frontend lint/build, backend TypeScript, playback utility tests and real HTTP/Socket.IO integration tests. Tests bind temporary localhost ports.

## Deploy frontend and backend together

The backend serves the built frontend and supports direct room links. One public origin avoids cross-origin configuration and keeps WebSockets and polling on the same service.

```sh
bun run build
NODE_ENV=production CLIENT_ORIGIN=https://watchparty.example.com bun run start
```

Set `CLIENT_ORIGIN` to the actual public frontend origin (scheme + hostname + optional port, no path or trailing slash). `PORT` defaults to 3000; `HOST` defaults to `0.0.0.0`. Runtime variables can also go in `backend/.env`. No application secrets are currently required.

For Docker:

```sh
docker build -t watchparty .
docker run --rm -p 127.0.0.1:3000:3000 -e CLIENT_ORIGIN=https://watchparty.example.com watchparty
```

Or set `CLIENT_ORIGIN` in the root `.env` and run `docker compose up --build -d`. Put a TLS reverse proxy in front of port 3000. It must forward `/socket.io/` including WebSocket upgrades and retain HTTP polling support. Use a proxy read timeout above 60 seconds. `GET /healthz` is the liveness endpoint. The process closes sockets on SIGTERM/SIGINT, and the container runs as a non-root user.

Example Nginx server block (place inside your existing TLS server configuration):

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 75s;
}
```

## Deploy separately

Set `VITE_SOCKET_URL=https://api.example.com` before `bun run build`. This is public build-time configuration, so rebuild to change it. Host `dist/` on your static provider and configure SPA fallback to `index.html` for room paths. Run the backend as a long-lived service with `CLIENT_ORIGIN=https://frontend.example.com`. This backend entrypoint assumes a long-lived service. Vercel now supports WebSockets in beta, but deploying the backend there requires a Function entrypoint, WebSocket-only Socket.IO transport and external shared room state/coordination; the current in-memory server is not configured for that deployment.

## Frontend on Vercel

Import the repository with the project root set to `.`. The included `vercel.json` selects Vite, installs from the lockfile, builds `dist/` and handles room deep links. Set `VITE_SOCKET_URL` to your backend's public HTTPS origin in Vercel's environment settings before building. Set the backend's `CLIENT_ORIGIN` to your Vercel production origin. Preview deployments have different origins and need their own explicit allowlist entries or a separate preview backend.

The frontend Vercel configuration does **not** deploy the backend. [Vercel's WebSocket beta supports Socket.IO](https://vercel.com/docs/functions/websockets), but connections may reach different Function instances and close at the Function duration limit. An all-Vercel deployment needs shared external room storage/coordination and a compatible Function entrypoint instead of this process's single-instance in-memory rooms.

## Operational limits

- Deploy **one backend instance**. Room state lives in memory, resets on restart, and is retained for 60 seconds after the last user leaves to allow brief reconnects. Horizontal scaling needs shared state plus a Socket.IO adapter and an appropriate routing strategy.
- Default limits: 500 rooms, 50 members per room, 1000 concurrent connections, 120 events per connection per 10 seconds, 5 subtitle uploads per 10 seconds, 2000-character messages and 256 KB subtitles. Use upstream connection/IP limits for public internet exposure; per-socket limits do not prevent attacks spread across many sockets.
- Room IDs are unguessable random invite links, not authenticated access controls. Treat the URL as an invitation and do not use rooms for sensitive content.
- Video sources must allow browser playback, CORS where needed, and a supported format. HTTPS pages require browser-compatible secure media URLs. The backend synchronizes URLs and player state; it does not proxy or transcode video.
- Local Stremio URLs refer to each participant's own computer. Each participant needs the corresponding local service/media. Hosted HTTPS pages may be unable to access local HTTP streams due to browser policies.

Audit findings and validation are tracked in [DEPLOYMENT_AUDIT.md](DEPLOYMENT_AUDIT.md).
