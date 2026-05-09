# ADR-0004: Concurrent Status Update Handling

## Status

Accepted

---

## Context

Mini Improvement Box v1 allows administrators to change proposal status to any valid status.

Even in a limited internal trial, two administrators may open the same proposal and attempt to change its status. Without concurrency control, one administrator's change may silently overwrite another administrator's change.

The requirements draft states that:

- invalid status values must be rejected
- status change history is required
- status change history is treated as the audit record for status changes
- status update and status change history creation must be consistent
- stale updates must return safe errors if optimistic locking is approved

This decision is needed before basic design because it affects schema fields, update APIs, transaction handling, UI behavior, and test cases.

---

## Decision

Use optimistic locking for proposal status changes.

The proposal record includes a `version` field.

Status change requests include the version that was read by the administrator screen. The update succeeds only when both proposal ID and version match. On successful update:

- the proposal status is changed
- the proposal version is incremented
- a status change history record is created
- the status update and history creation run in the same transaction

If the proposal version does not match, the application returns a safe conflict error and does not create a status change history record for a successful status change.

This is a human-approved decision for v1.

---

## Alternatives Considered

- Last write wins
- Database lock centered design
- Re-fetch before every update without optimistic locking
- Use `updated_at` instead of a dedicated `version` field

---

## Reasons

- Optimistic locking prevents silent overwrites while keeping implementation complexity reasonable for a limited internal trial.
- A dedicated `version` field is clearer and less error-prone than relying on timestamp precision.
- Transactional status update and history creation preserves auditability.
- Safe conflict errors protect internal database details from users.

Trade-offs:

- Requires an additional `version` field.
- UI must include the read version in status change requests.
- Administrators may need to retry a status change after a conflict.
- Basic design must define conflict message wording and latest-state reload behavior.

---

## Consequences

Positive:

- Prevents silent overwrites.
- Improves audit reliability.
- Provides concrete test cases for stale update behavior.
- Keeps concurrency handling reviewable.

Negative:

- Slightly more schema and API complexity.
- Requires conflict handling in the administrator UI.
- Conflict scenarios must be manually verified and tested.

---

## Related Requirements

- `docs/requirements/requirements-v1.md`
- Requirement sections:
  - `6.4 Proposal Status Changes`
  - `6.5 Concurrent Status Update Handling`
  - `9. Data Requirements`
  - `11. Proposed Acceptance Criteria`
  - `12. Proposed Test Perspectives`
  - `13. Human Decisions Required`

---

## Notes

The basic design must define:

- exact `version` field type and initial value
- update query conditions
- transaction boundary
- conflict response status and user-facing message
- whether the UI reloads the latest proposal state automatically after conflict
- status change history behavior for failed attempts

Re-evaluate this decision if production-level concurrent editing or workflow approval rules are introduced.
