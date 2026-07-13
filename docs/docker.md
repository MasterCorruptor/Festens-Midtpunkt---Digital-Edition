# Docker and execution

## Current Dockerfile behavior

The root file is named `dockerfile` and contains a single-stage image definition:

1. Start from `node:24-alpine`.
2. Set `/app` as the work directory.
3. Copy `server/package*.json` to `/app/server/`.
4. Run `npm ci --omit=dev` in `/app/server`, requiring the tracked lockfile to match `package.json`.
5. Copy the repository into `/app`.
6. Document container port `3000` with `EXPOSE`.
7. Define a health check that requests `/api/decks` on the configured internal port.
8. Start `node server/server.js`.

The application server serves both static files and the API from the same process and port.

## Current Docker Compose behavior

`docker-compose.yml` defines one service named `festens-midtpunkt`:

- builds from the repository root;
- assigns container name `festens_midtpunkt`;
- uses restart policy `unless-stopped`;
- sets the internal `PORT` environment variable to `3000`;
- maps host `27015` to container `3000`;
- bind-mounts host `./server/data` at `/app/server/data`.

After `docker compose up --build`, the UI is available at `http://localhost:27015` on the Docker host. From another machine, use `http://<server-ip>:27015`, provided the host firewall and network routing allow inbound access to that port.

## Persistent storage

The bind mount makes both official and custom runtime deck directories come from the host repository's `server/data`. Custom-deck API writes therefore persist in `server/data/decks/custom` across container replacement, as long as the same host directory is retained.

This is a bind mount, not a Docker-managed named volume. Host permissions and the contents of `./server/data` directly determine what the container sees. The mount also replaces the image's copied `/app/server/data` tree at runtime.

## Ports

| Execution mode | Browser address | Process port |
| --- | --- | --- |
| Direct Node execution | `http://localhost:3000` | `3000` |
| Docker Compose | `http://localhost:27015` on the host or `http://<server-ip>:27015` remotely | `3000` in container |
| Bare `docker run` | Depends on explicit `-p` mapping | `3000` in container |

The server reads the `PORT` environment variable and accepts integer ports from `1` through `65535`. Missing or invalid values fall back to `3000`. Compose explicitly retains `3000` inside the container.

## Local development

From `server/`, dependencies are described by `package.json` and the application starts with `npm start`, which runs `node server.js`. Because static serving resolves relative to `server.js`, the parent repository assets are served correctly regardless of the shell's working directory.

The repository contains `server/node_modules` in the current workspace, while `.gitignore` and `.dockerignore` exclude it. The tracked `server/package-lock.json` is used by both local package management and the container build.

## Container execution

The image installs only production dependencies with `npm ci --omit=dev`. `.dockerignore` excludes Git/Codex metadata, dependency directories, environment files, npm debug logs, and custom-deck JSON files from the image build context. The runtime bind mount remains responsible for custom-deck persistence.

## Known issues

- The bind mount persists official and custom data together; deployment-time host contents replace the image defaults.
- The container runs with the base image's default user unless the image defines otherwise; this Dockerfile does not select a non-root user.
- Filesystem write errors are not converted into predictable API responses.

## Suggested improvements

Proposals, not current behavior:

- Review whether only custom data should be mounted for persistence, while preserving official-deck availability.
- Run as an explicitly selected unprivileged user after confirming bind-mount permissions.

## Verified Docker Desktop baseline

The Compose configuration has been built and started successfully with Docker Desktop using the Linux container engine. The original baseline verified frontend and API access, loading all three official decks, creating a temporary custom deck in the bind-mounted host directory, retaining it across a Compose service restart, and deleting it cleanly afterward. The combined v0.8.0 regression was subsequently completed with host port `27015`. This confirms the current behavior; it does not resolve the known deployment issues above.
