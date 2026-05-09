# ADR-0007: Audit Log Policy

## Status

Accepted

---

## Context

Mini Improvement Box v1 includes administrator operations that are security-sensitive:

- viewing proposal list
- viewing proposal details
- changing proposal status

Human-decided requirements state:

- status change history is required in v1
- status change history is treated as the audit record for status changes
- Better Auth email/password is used for administrator authentication

This decision is needed before basic design because audit scope affects schema, logging, retention, tests, privacy risk, and operational review.

---

## Decision

For v1:

- require status change history
- treat status change history as the audit record for status changes
- do not require administrator proposal view history
- require application-specific administrator login success and failure logs because Better Auth email/password is used
- record the following fields in administrator login logs:
  - event type
  - admin identifier
  - timestamp
  - result
  - reason category
  - request id
- do not record the following in administrator login logs:
  - passwords
  - session information
  - proposal body content
  - submitter information

This is a human-approved decision for v1.

---

## Alternatives Considered

- Status change history only
- Status change history plus administrator proposal view history
- Status change history plus application-specific administrator login audit logs
- Full application audit log for all administrator reads and writes

---

## Reasons

- Status changes modify business state and must be traceable.
- Proposal view logging may create a large volume of sensitive metadata for a limited internal trial, so it is not required in v1.
- Better Auth email/password means administrator credentials are managed by the application, so application-specific login success and failure logs are required.
- Login logs need enough operational detail to investigate authentication events without recording secrets or proposal content.
- Keeping v1 audit scope focused reduces implementation and retention complexity.
- The policy can be expanded before production release or if trial data sensitivity is high.

Trade-offs:

- Without proposal view history, v1 may not trace which administrator viewed a specific proposal.
- Application-specific login logs introduce additional records that must be protected and retained according to the audit data policy.
- If the trial handles highly sensitive content, proposal view history may need to be reconsidered.

---

## Consequences

Positive:

- Status-changing operations are auditable.
- Administrator login success and failure events are auditable inside the application.
- Audit scope remains focused and reviewable for v1.
- Lower risk of storing excessive sensitive audit metadata.

Negative:

- Proposal read access tracing is limited because administrator proposal view history is not required.
- Login logs must be designed to avoid recording passwords, session information, proposal body content, or submitter information.
- Audit records increase retention and access-control responsibilities.

---

## Related Requirements

- `docs/requirements/requirements-v1.md`
- Requirement sections:
  - `6.4 Proposal Status Changes`
  - `7.3 Auditability`
  - `9.2 Status Change History`
  - `12. Proposed Test Perspectives`
  - `13. Human Decisions Required`
  - `15. Risks`

---

## Notes

The basic design must define:

- exact status change history schema
- whether failed status change attempts are recorded
- exact administrator login log schema
- administrator login success and failure event types
- administrator login failure reason categories
- request id generation and propagation
- relationship between application logs, Better Auth behavior, hosting logs, and status change history
- retention handling for audit records and backups

Re-evaluate this decision if:

- proposal content is classified as highly sensitive
- administrator proposal view history becomes necessary for incident investigation or compliance
- production release becomes planned
- administrator roles become more granular
- external compliance requirements are introduced
