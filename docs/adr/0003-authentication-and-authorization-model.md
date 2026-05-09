# ADR-0003: Authentication and Authorization Model

## Status

Accepted

---

## Context

Mini Improvement Box v1 allows general users to submit proposals without authentication.

Administrator features are security-sensitive because administrators can:

- view proposal list and detail data
- view optional submitter information if provided
- view proposal body content that may contain personal or confidential information
- change proposal status
- create status change history records

Human-decided requirements already state:

- general users can submit proposals without authentication
- administrator features require authentication
- v1 uses a single `admin` role
- general users and unauthenticated users cannot access administrator screens or administrator operations
- v1 does not use an existing internal IdP

This decision is needed before basic design because it affects login flow, session handling, admin registration, role checks, authorization test cases, and audit considerations.

---

## Decision

Use Better Auth email/password for administrator authentication.

Use a single `admin` role for administrator authorization.

The application must enforce server-side admin role checks for every administrator operation.

Authorization must be enforced on the server side or another trusted boundary. UI hiding is not sufficient.

This is a human-approved decision for v1.

---

## Alternatives Considered

- Existing IdP OAuth/OIDC + admin allowlist
- Auth.js / NextAuth.js
- Basic authentication
- Custom authentication from scratch

---

## Reasons

- An existing internal IdP is not used for v1.
- Better Auth email/password provides application-managed administrator authentication for the limited internal trial.
- Server-side authorization centralizes the security boundary and supports repeatable permission tests.
- Better Auth is preferred over custom authentication because it avoids designing authentication primitives from scratch.
- Basic authentication and custom authentication provide weaker accountability and higher risk for future production migration.

Trade-offs:

- Application-managed credentials increase security and operational responsibilities.
- Better Auth email/password requires password handling, initial admin setup, password reset policy, and account disabling or rotation procedures.
- Because an external IdP is not used, application-specific login success and failure logging should be considered during basic design.

---

## Consequences

Positive:

- Clear separation between unauthenticated proposal submission and administrator-only operations.
- Simple v1 role model.
- Reduced risk of exposing administrator operations to general users.
- Easier authorization test planning.

Negative:

- Admin onboarding, disabling, and rotation procedures must be defined.
- Application-managed credentials increase security and operational responsibilities.
- The basic design must define account lifecycle and password reset behavior.

---

## Related Requirements

- `docs/requirements/requirements-v1.md`
- Requirement sections:
  - `4. Intended Users`
  - `6.2 Administrator Proposal List`
  - `6.3 Administrator Proposal Details`
  - `6.4 Proposal Status Changes`
  - `7.1 Security`
  - `8.2 Administrator Authentication Options`
  - `10. Permission Requirements`
  - `13. Human Decisions Required`

---

## Notes

The basic design must define:

- Better Auth email/password setup
- administrator account management process
- admin disable and rotation process
- password reset or recovery process
- server-side authorization enforcement point
- unauthenticated and unauthorized error behavior
- whether login success and failure require application-specific audit logs

Re-evaluate this decision before production release or if multiple administrator roles are introduced.
