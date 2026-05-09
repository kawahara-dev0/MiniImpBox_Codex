# ADR-0001: Application Runtime and Web Framework

## Status

Accepted

---

## Context

Mini Improvement Box v1 is a small web application for a limited internal trial.

The application must support:

- unauthenticated proposal submission by general users
- authenticated administrator screens
- administrator-only proposal list and detail views
- administrator-only status changes
- server-side authorization checks
- safe input validation and output handling
- a small implementation surface suitable for review before basic design

The requirements draft recommends a compact stack that can keep UI, administrator screens, server-side logic, and data access in one project.

This decision is needed before basic design because it affects project structure, routing, authentication integration, server-side authorization boundaries, testing strategy, and later implementation requests.

---

## Decision

Use the following application stack for Mini Improvement Box v1:

- Next.js App Router
- TypeScript
- React
- Node.js runtime supported by the selected Next.js version

This is a human-approved decision for v1.

---

## Alternatives Considered

- SvelteKit + TypeScript
- Hono + React/Vite
- Express + React/Vite

---

## Reasons

- Next.js App Router can keep the small v1 application in one project while supporting UI routes and server-side behavior.
- TypeScript supports clearer contracts for proposal data, status values, authorization checks, and DTOs.
- React is broadly documented and compatible with the recommended Next.js stack.
- A single full-stack project reduces setup and coordination overhead for a limited internal trial.
- The stack fits the requirement to keep the first implementation small and reviewable.

Trade-offs:

- The project must follow Next.js-specific routing and server/client component conventions.
- Future migration to another framework would require restructuring routes, server actions, and data access boundaries.
- Basic design must explicitly define where server-side authorization and data access are performed.

---

## Consequences

Positive:

- Small application surface for v1.
- Consistent TypeScript usage across UI and server-side code.
- Good fit for server-side authorization and DTO-based data shaping.
- Easier to split implementation into proposal submission, admin list/detail, status change, and audit-history units.

Negative:

- Developers must understand Next.js App Router conventions.
- Some framework decisions become coupled to Next.js.
- ADR review is required before implementation because the framework selection affects architecture.

---

## Related Requirements

- `docs/requirements/requirements-v1.md`
- Requirement sections:
  - `3. Operation Premise`
  - `5. v1 Scope`
  - `7. Non-Functional Requirements`
  - `8. Architecture and Technology Recommendations`
  - `13. Human Decisions Required`

---

## Notes

Re-evaluate this decision if:

- v1 scope expands beyond a limited internal trial
- production release becomes a near-term target
- the team has stronger operational constraints that favor another framework
- the selected authentication method is poorly supported by the Next.js stack
