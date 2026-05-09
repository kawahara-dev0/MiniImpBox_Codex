# Mini Improvement Box

Mini Improvement Box v1 is a limited internal trial application for collecting and managing improvement proposals.

## Development Commands

```powershell
npm install
npm run typecheck
npm run lint
npm test
npm run build
```

## Docker Compose Startup

Docker Compose is the standard development and trial verification environment.

```powershell
docker compose up --build
```

The application listens on `http://localhost:3000`.

## Environment Variables

Copy `.env.example` to `.env` for local host execution. Keep real secrets out of Git.

| Variable | Purpose | Safe placeholder |
|---|---|---|
| `DATABASE_URL` | Host-local SQLite URL for Prisma | `file:../data/sqlite/app.db` |
| `BACKUP_DIR` | Backup output directory | `/data/backups` |
| `BETTER_AUTH_URL` | Local application URL | `http://localhost:3000` |
| `BETTER_AUTH_SECRET` | Better Auth secret | `replace-with-a-local-secret-that-is-not-committed` |

## Persistent Paths

Docker Compose uses host bind mounts so database and backup files are not stored only inside an ephemeral container:

| Host path | Container path | Purpose |
|---|---|---|
| `./data/sqlite` | `/data/sqlite` | SQLite database files |
| `./data/backups` | `/data/backups` | Backup files |

Inside Docker Compose, `DATABASE_URL` is set to `file:/data/sqlite/app.db`.

The `data/` directory is ignored by Git. Do not commit database files, backups, real credentials, or generated secrets.

## Current Scope

This foundation step intentionally does not implement proposal submission, administrator login behavior, administrator screens, business schema, backup scripts, or operational deletion procedures. Those are handled by later approved roadmap steps.
