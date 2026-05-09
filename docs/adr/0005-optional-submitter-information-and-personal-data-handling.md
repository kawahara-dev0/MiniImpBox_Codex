# ADR-0005: Optional Submitter Information and Personal Data Handling

## Status

Accepted

---

## Context

Mini Improvement Box v1 primarily supports anonymous, unauthenticated proposal submission.

Human-decided requirements state:

- general users can submit proposals without authentication
- anonymous submission is the default operation model
- submitter information, if collected, is optional and must not be required for submission

This ADR accepts `submitter_name` and `submitter_contact` as the optional submitter information fields for v1.

Proposal body content may also contain personal, workplace, or confidential business information even when submitter information is blank.

This decision is needed before basic design because it affects form fields, validation, administrator display, data schema, privacy wording, logs, backups, retention, and test cases.

---

## Decision

Use the following optional submitter information fields:

- `submitter_name`
- `submitter_contact`

Both fields are optional. A proposal can be submitted without either field.

Treat optional submitter information as personal information when provided.

Do not display optional submitter information outside administrator screens.

Do not write optional submitter information or full proposal body content to logs, error messages, notifications, sample data, or test fixtures.

Use the same retention and backup policy for optional submitter information as for proposal body content.

This is a human-approved decision for v1.

---

## Alternatives Considered

- Do not collect any submitter information in v1
- Collect only `submitter_name`
- Collect only `submitter_contact`
- Require submitter information
- Allow free-form contact information

---

## Reasons

- Optional fields preserve the anonymous-by-default requirement.
- `submitter_name` and `submitter_contact` are the minimum practical fields when follow-up may be useful.
- Making both fields optional avoids blocking proposal submission.
- Treating provided data as personal information reduces privacy and logging risks.
- Avoiding free-form contact input reduces unexpected sensitive data and validation ambiguity.

Trade-offs:

- Collecting contact information increases personal data handling responsibility.
- Users may misunderstand the scope of anonymity if screen wording is unclear.
- Administrators may see optional personal information and need handling rules.
- If follow-up is not needed during the trial, collecting contact information may be unnecessary.

---

## Consequences

Positive:

- Maintains low-friction proposal submission.
- Supports optional follow-up when the submitter chooses to provide information.
- Makes privacy handling explicit before basic design.

Negative:

- Adds personal information handling requirements.
- Requires careful UI wording.
- Requires access restrictions, log suppression, backup protection, and retention handling.

---

## Related Requirements

- `docs/requirements/requirements-v1.md`
- Requirement sections:
  - `4. Intended Users`
  - `6.1 Improvement Proposal Submission`
  - `7.2 Personal and Confidential Information`
  - `9. Data Requirements`
  - `13. Human Decisions Required`
  - `15. Risks`

---

## Notes

The basic design must define:

- exact form labels and help text explaining anonymity
- validation rules for `submitter_name`
- validation rules for `submitter_contact`
- whether `submitter_contact` is limited to email format
- administrator display behavior
- log suppression rules
- test data rules using only fake personal information

Re-evaluate this decision if stakeholders decide that no follow-up contact is needed during v1.
