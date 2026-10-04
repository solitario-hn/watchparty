FROM oven/bun:1.3.14 AS frontend
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY index.html vite.config.js ./
COPY public ./public
COPY src ./src
ARG VITE_SOCKET_URL=
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
RUN bun run build

FROM oven/bun:1.3.14-slim AS runtime
WORKDIR /app/backend
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
COPY backend/package.json backend/bun.lock ./
RUN bun install --frozen-lockfile --production
COPY --chown=bun:bun backend/src ./src
COPY --from=frontend --chown=bun:bun /app/dist /app/dist
USER bun
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD bun -e 'fetch("http://127.0.0.1:"+(process.env.PORT||3000)+"/healthz").then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))'
CMD ["bun", "src/index.ts"]
