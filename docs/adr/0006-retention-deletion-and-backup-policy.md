# ADR-0006: Retention, Deletion, and Backup Policy

## Status

Accepted

---

## Context

Mini Improvement Box v1 is a limited internal trial and not a public or production service.

Proposal data may include:

- proposal body content
- optional submitter name
- optional submitter contact information
- administrator status changes
- status change history

Human-decided requirements state:

- v1 does not provide proposal deletion through screens or APIs
- physical deletion and logical deletion as application features are outside v1 scope

However, retention and backup policy must be decided before basic design because proposal and backup data may contain personal or confidential information.

---

## Decision

Use the following retention, deletion, and backup policy for v1:

- retain proposal data until 90 days after the trial ends
- perform post-retention deletion as an approved operational procedure outside the v1 application
- do not provide proposal deletion screens or APIs in v1
- use daily backups during the trial
- keep 7 to 14 backup generations
- store backups in a location accessible only to authorized administrators
- use backup encryption where practical
- revisit retention, deletion request handling, backup, and restore procedures before any production release

This is a human-approved decision for v1.

---

## Alternatives Considered

- Delete at trial end
- Retain for 30 days after trial
- Retain for 90 days after trial
- Retain for 180 days after trial
- Retain indefinitely

---

## Reasons

- 90 days after trial end gives enough time for post-trial review, requirement refinement, incident investigation, and basic design improvements.
- 90 days is more practical than immediate deletion or 30 days when stakeholder review may be delayed.
- 90 days limits personal and confidential information exposure better than 180 days or indefinite retention.
- Because v1 is not production, indefinite retention is not justified.
- Keeping deletion outside the v1 application preserves the v1 scope and avoids implementing deletion workflows before policy is mature.

Trade-offs:

- Operational deletion must be planned and performed manually or through an approved administrative procedure.
- Backups must be included in retention planning.
- If stakeholders need longer post-trial analysis, the 90-day period may need extension and risk approval.

---

## Consequences

Positive:

- Clear limited retention for trial data.
- Avoids adding deletion features to v1.
- Reduces indefinite storage risk.
- Provides enough time for post-trial review.

Negative:

- Requires operational discipline for deletion after retention expires.
- Requires backup access control and deletion planning.
- Does not provide user-facing deletion request handling in v1.

---

## Related Requirements

- `docs/requirements/requirements-v1.md`
- Requirement sections:
  - `3. Operation Premise`
  - `5. v1 Scope`
  - `7.5 Retention, Deletion, and Backup`
  - `13. Human Decisions Required`
  - `15. Risks`

---

## Notes

The basic design must define:

- trial end date definition
- exact retention end calculation
- backup frequency
- backup generation count
- backup storage location
- backup access control
- backup encryption decision
- post-retention deletion procedure
- restore procedure for trial operation

Re-evaluate this decision before production release or if data sensitivity is higher than expected.
