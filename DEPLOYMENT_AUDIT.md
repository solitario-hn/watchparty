# Deployment audit — 2026-10-03

## Outcome

Prepared for a **single-instance deployment** with a configured public origin and HTTPS reverse proxy. Nothing has been published to a hosting provider.

## Fixed

| Finding | Change |
| --- | --- |
| Frontend hardcoded to `localhost:3000` | Same-origin connection by default, Vite development proxy, optional `VITE_SOCKET_URL` for separate hosting. |
| Reconnected clients lose room membership | Join again on every connection and restore the server's current playback snapshot. |
| Subtitles leaked to other rooms | Broadcast only to the uploading user's room. |
| Arbitrary socket payloads could corrupt room state | Validate membership, room IDs, names, URLs, times, rates, message lengths and subtitle size; allow only specific playback fields. |
| Name updates omitted the sender and other members | Broadcast the complete membership list to every room participant. |
| Switching rooms left stale membership | Notify the previous room and clean up on leave/disconnect. |
| Playing rooms could rewind on speed/pause changes | Advance the playback clock using the previous speed before applying changes. |
| Subtitle text persisted when replacing video | Clear previous subtitles when the media URL changes. |
| Room IDs had only four hexadecimal characters | Generate new room IDs from 128 random bits. Existing valid room links remain supported. |
| No abuse bounds or room cleanup | Add connection, membership, room, event and payload limits; expire abandoned rooms after a reconnect grace period. |
| WebSocket origins unrestricted | Check exact allowed origins on handshakes, including WebSockets; configurable HTTP CORS. Origin-less clients are supported. This is not authentication. |
| React lint failures and subtitle blob lifecycle problems | Clean imports and use the existing text subtitle overlay directly, avoiding duplicate native tracks and object URLs. |
| Broken small-screen logo and cramped sidebar | Correct logo sizing, stack chat on small screens, expose the sidebar toggle and label primary controls; clear the copy-link timer on unmount. |
| Client errors were console-only | Show connection, validation and playback errors; guard sends until room join succeeds. Start muted for autoplay compatibility. |
| Chat memory grew indefinitely and keys collided | Keep the latest 500 messages and use server-generated UUIDs. |
| Backend startup fixed to port 3000 | Validate configurable `PORT`, `HOST`, `CLIENT_ORIGIN`; require explicit origins in production. |
| Missing production entrypoint and SPA serving | Add start/check scripts, `/healthz`, frontend static serving, room deep-link fallback and cache policy. |
| HTTP shutdown stalled on upgraded connections | Close Socket.IO and remaining TCP connections; cover active-WebSocket shutdown with a regression test. |
| Tailwind packages were installed locally but undeclared | Declare both build dependencies and update lockfiles. |
| Published dependency advisories | Update compatible versions and explicitly override vulnerable transitive packages; both complete audits are clean. |
| No reproducible delivery or CI | Add Docker multi-stage build, non-root runtime, health check, Compose, environment examples, Vercel frontend configuration, CI checks/audits/container smoke test and deployment instructions. |

The dependency work includes the patched [Engine.IO protocol-mismatch denial-of-service fix](https://github.com/advisories/GHSA-2gc4-cqfq-p2gv), [Browserslist memory-limit fix](https://github.com/advisories/GHSA-c83g-rgw3-j3cx), [brace-expansion resource-limit fix](https://github.com/advisories/GHSA-mh99-v99m-4gvg), and [qs array-limit fix](https://github.com/advisories/GHSA-x5fp-wj9c-mxmx). The lockfiles retain the exact verified versions.

## Validation

- `bun run check`: frontend lint/build, backend TypeScript and **17 tests pass** (3 playback/URL tests, 13 HTTP/socket integration tests, 1 production-startup test).
- Integration coverage: SPA/health/404/header behavior, origin rejection, polling fallback, active WebSocket shutdown, membership/renames/disconnects, room switching, subtitle isolation, playback clock/speed/pause, reconnect restoration, room expiry, malformed payload rejection, event limits and room capacity.
- `bun audit` in both project directories: **zero known vulnerabilities reported** at audit time.
- Frontend frozen-lockfile install succeeds.
- Built frontend and backend start together on localhost.

## Remaining deployment requirements and limits

1. Set the actual public `CLIENT_ORIGIN` and configure your hosting service's HTTPS and WebSocket forwarding. If hosting the frontend separately, set `VITE_SOCKET_URL` at build time and configure static SPA fallback.
2. Use one backend replica. Room data is in memory and resets on restart. Shared room storage and a distributed Socket.IO adapter are required for multiple replicas.
3. Guest rooms allow every invited participant to control playback. They have no accounts, host moderation or authenticated privacy. Do not treat CORS or the invite URL as identity verification.
4. Internet-facing deployments should enforce upstream per-IP/connection limits. Per-socket event limits do not stop distributed connection floods.
5. Browser visual/media playback verification could not run: no browser surface was available in this session. Verify real video playback, autoplay, seeking, subtitles, fullscreen, reconnects and mobile layout on target browsers before launch. Media support also depends on the third-party source and its browser access policy.
6. Docker daemon is not running locally, so the image build and container smoke test have not been executed here. CI is configured to run both when pushed.
7. Vite still reports large lazy-loaded media chunks and a guarded CommonJS `exports` reference inside the upstream DASH bundle. The build succeeds; verify DASH media in the browser if you plan to support it.

8. Both frontend and backend can be hosted on Vercel using its [WebSocket beta](https://vercel.com/docs/functions/websockets), but that backend architecture has not been implemented here. The included `vercel.json` deploys the frontend only. The current backend needs a single persistent server; all-Vercel hosting needs external shared room state and a Socket.IO adapter/coordination, a Function export and WebSocket-only client configuration.

See [README.md](README.md) for concrete startup and deployment commands.
