# Luma's production image: the built app (dist/) and the bundled server
# (dist-server/), on Node 22, run as an unprivileged user. Used by Cloud Run
# (docs/deployment.md#cloud-run) and by the release workflow.
#
#   docker build --build-arg BUILD_ID=v6.1.0 -t luma .
#   docker run -p 8080:8080 -e DATABASE_URL=postgresql://… luma               serve
#   docker run -e DATABASE_URL=postgresql://… luma node dist-server/index.js maintenance

# ---------------------------------------------------------------- build
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
# All dependencies: Vite needs its optional native parts (Rollup's binary).
# better-sqlite3 is optional too: if it cannot be built here, npm goes on.
RUN npm ci --no-audit --no-fund
COPY . .
# The release passes its tag: /version.json then names the build being deployed.
ARG BUILD_ID=""
ENV BUILD_ID=$BUILD_ID
RUN npx vite build && npm run build:server

# ---------------------------------------------------------------- runtime
FROM node:22-slim
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
# Production dependencies only, and no SQLite: in a container, DATABASE_URL is required.
RUN npm ci --omit=dev --omit=optional --no-audit --no-fund && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-server ./dist-server
USER node
# Cloud Run sets PORT (8080); the server reads it.
ENV PORT=8080
EXPOSE 8080
CMD ["node", "dist-server/index.js"]
