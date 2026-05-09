# ADR-0008: Docker Compose Development and Trial Verification Environment

## Status

Accepted

---

## Context

Mini Improvement Box v1 is a small web application for a limited internal trial.

The accepted stack uses Next.js, TypeScript, React, Node.js, SQLite, Prisma, and Better Auth. This stack can run directly on a developer machine, but local host differences can affect:

- Node.js and package manager versions
- Prisma and SQLite behavior
- environment variable setup
- database file paths
- backup and restore procedure verification
- AI-assisted implementation reproducibility

The v1 design also requires daily backups, backup encryption for the trial environment, restore procedure verification, and post-retention deletion. Those procedures depend on where the SQLite database file and backup files are stored.

This decision is needed before implementation planning because it affects project foundation setup, developer workflow, environment documentation, database file placement, backup/restore procedures, and trial-readiness verification.

---

## Decision

Use Docker Compose as the standard development and trial verification environment for Mini Improvement Box v1.

The Docker-based environment must follow these rules:

- Provide a Docker Compose setup for the application runtime.
- Run the application on the accepted Next.js/Node.js stack.
- Keep the SQLite database file in an explicit persistent volume or host bind mount.
- Keep backup files in an explicit persistent volume or host bind mount outside the application public directory.
- Do not rely on files stored only inside an ephemeral container for the database or backups.
- Document required environment variables with safe placeholders only.
- Do not commit secrets, credentials, real administrator passwords, database files, or backup files.
- Treat Docker Compose as a standard development and trial verification environment, not as production release approval.

This is a human-approved decision for v1.

---

## Alternatives Considered

- Direct host Node.js execution as the standard environment
- Docker Compose as optional local convenience only
- Full production container platform design such as Kubernetes or managed container hosting

---

## Reasons

- Docker Compose reduces local environment differences across developers and AI-assisted agents.
- A standard containerized setup makes Step 1 project foundation easier to verify consistently.
- SQLite database and backup paths can be defined explicitly and verified in a trial-like environment.
- Backup, restore, and post-retention deletion procedures can be tested against the same path model used during trial verification.
- Docker Compose is lighter than a full production container platform and fits the limited internal trial scope.

Trade-offs:

- The project must maintain Dockerfile and Compose configuration.
- SQLite file persistence requires careful volume or bind-mount design.
- File permissions and path behavior must be verified on the target host environment, especially on Windows.
- Docker Compose does not remove the need for human manual verification, residual risk acceptance, or release decisions.

---

## Consequences

Positive:

- More reproducible local setup.
- Clearer developer onboarding path.
- More reliable AI-assisted build, test, and review workflow.
- More concrete backup and restore verification.

Negative:

- Slightly higher setup complexity than direct host Node.js execution.
- Operational documentation must explain volumes, bind mounts, database path, backup path, and cleanup.
- Trial verification must confirm that persistent data is not lost when containers are recreated.

---

## Related Requirements

- `docs/requirements/requirements-v1.md`
- `docs/design/basic-design-v1.md`
- `docs/design/roadmap-v1.md`
- ADR-0001: Application Runtime and Web Framework
- ADR-0002: Database, ORM, and Data Access Policy
- ADR-0006: Retention, Deletion, and Backup Policy

---

## Notes

Human approval:

- The Docker Compose development and trial verification environment design was approved by the human project owner on 2026-05-09.

Re-evaluate this decision if:

- production release becomes a near-term target
- the project moves from SQLite to a managed database
- the trial environment cannot support Docker Compose safely
- file permission or backup encryption requirements cannot be met with the selected host and volume layout

This ADR does not approve production deployment, production release, or residual operational risk.
