# ADR-0002: Database, ORM, and Data Access Policy

## Status

Accepted

---

## Context

Mini Improvement Box v1 needs to store proposal data, optional submitter information, proposal statuses, status change history, timestamps, and concurrency metadata.

The application is a limited internal trial, so the data layer should be small and simple. At the same time, it must support:

- input validation
- administrator-only access to proposal data
- safe handling of optional personal information
- status changes with history records
- transactional consistency between status update and status change history creation
- backup and retention operations

This decision is needed before basic design because it affects schema design, migration approach, data access boundaries, test strategy, and operational backup procedures.

---

## Decision

Use the following data stack for Mini Improvement Box v1:

- SQLite as the database
- Prisma as the ORM
- a server-side Data Access Layer for proposal creation, administrator reads, status changes, and status change history creation

UI components must not directly access the database.

This is a human-approved decision for v1.

---

## Alternatives Considered

- SQLite + Drizzle
- PostgreSQL + Prisma
- JSON or flat file storage

---

## Reasons

- SQLite fits the limited internal trial scope and has low operational overhead.
- Prisma provides TypeScript-friendly data access and supports SQLite.
- A server-side Data Access Layer makes authorization, DTO shaping, validation, and transaction handling easier to review.
- Status changes and status change history can be implemented in one transaction.
- JSON or flat file storage is not suitable because v1 requires status history, concurrency control, queryability, and backup discipline.

Trade-offs:

- SQLite is less suitable for a larger production deployment than PostgreSQL.
- Prisma with SQLite does not enforce enum values at the database level in the same way as databases with native enum support.
- Status validation must be enforced in application logic, and database constraints should be considered where practical.
- A future production release may require migration to PostgreSQL or another managed database.

---

## Consequences

Positive:

- Low setup and operational burden for limited internal trial.
- Type-safe data access patterns.
- Centralized data access and authorization review points.
- Clear path to transactionally create status change history.

Negative:

- Production scalability and operational resilience are limited compared with managed PostgreSQL.
- Care is required for backup, file permissions, and concurrent write behavior.
- Migration may be needed before public or production operation.

---

## Related Requirements

- `docs/requirements/requirements-v1.md`
- Requirement sections:
  - `6. Functional Requirements`
  - `7. Non-Functional Requirements`
  - `8.3 Database, ORM, and Data Access Options`
  - `9. Data Requirements`
  - `13. Human Decisions Required`

---

## Notes

The basic design must define:

- database file location
- backup target and access control
- Prisma schema ownership
- Data Access Layer responsibilities
- DTO shape for administrator list and detail screens
- transaction boundary for status changes and history creation
- status validation rules

Re-evaluate this decision if v1 becomes production-facing or expected concurrent write volume increases.
