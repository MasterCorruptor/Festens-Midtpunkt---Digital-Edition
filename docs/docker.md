# Docker and execution

## Current Dockerfile behavior

The root file is named `dockerfile` and contains a single-stage image definition:

1. Start from `node:24-alpine`.
2. Set `/app` as the work directory.
3. Copy `server/package*.json` to `/app/server/`.
4. Run `npm install` in `/app/server`.
5. Copy the repository into `/app`.
6. Document container port `3000` with `EXPOSE`.
7. Start `node server/server.js`.

The application server serves both static files and the API from the same process and port.

## Current Docker Compose behavior

`docker-compose.yml` defines one service named `festens-midtpunkt`:

- builds from the repository root;
- assigns container name `festens_midtpunkt`;
- uses restart policy `unless-stopped`;
- maps host `30050` to container `3000`;
- bind-mounts host `./server/data` at `/app/server/data`.

After `docker compose up --build`, the UI is available at `http://localhost:30050` on the Docker host.

## Persistent storage

The bind mount makes both official and custom runtime deck directories come from the host repository's `server/data`. Custom-deck API writes therefore persist in `server/data/decks/custom` across container replacement, as long as the same host directory is retained.

This is a bind mount, not a Docker-managed named volume. Host permissions and the contents of `./server/data` directly determine what the container sees. The mount also replaces the image's copied `/app/server/data` tree at runtime.

## Ports

| Execution mode | Browser address | Process port |
| --- | --- | --- |
| Direct Node execution | `http://localhost:3000` | `3000` |
| Docker Compose | `http://localhost:30050` | `3000` in container |
| Bare `docker run` | Depends on explicit `-p` mapping | `3000` in container |

The port is hard-coded in `server/server.js`; there is no environment-variable override.

## Local development

From `server/`, dependencies are described by `package.json` and the application starts with `npm start`, which runs `node server.js`. Because static serving resolves relative to `server.js`, the parent repository assets are served correctly regardless of the shell's working directory.

The repository contains `server/node_modules` in the current workspace, while `.gitignore` excludes it. `server/package-lock.json` also exists in the workspace but is ignored by `.gitignore`.

## Container execution

The image installs production and development dependencies together with `npm install` (there are currently only runtime dependencies) and copies the entire build context. No `.dockerignore` is present, so local ignored content such as `server/node_modules` and Git/workspace files may be sent into the build context and copied in the final `COPY . .` step.

## Known issues

- Dependency installation uses `npm install` rather than a lockfile-enforcing `npm ci` workflow, and the lockfile is ignored by Git. Reproducibility therefore depends on what files are actually present in the build context and package version resolution.
- There is no `.dockerignore`, increasing build context size and risking inclusion of development-only files.
- The server port cannot be configured through the environment.
- There is no health check.
- The bind mount persists official and custom data together; deployment-time host contents replace the image defaults.
- The container runs with the base image's default user unless the image defines otherwise; this Dockerfile does not select a non-root user.
- Filesystem write errors are not converted into predictable API responses.

## Suggested improvements

Proposals, not current behavior:

- Track a lockfile and use deterministic dependency installation.
- Add a `.dockerignore` appropriate to the existing repository.
- Make the listening port configurable while retaining `3000` as the default.
- Add a health check and verify the service with an API request.
- Review whether only custom data should be mounted for persistence, while preserving official-deck availability.
- Run as an explicitly selected unprivileged user after confirming bind-mount permissions.
