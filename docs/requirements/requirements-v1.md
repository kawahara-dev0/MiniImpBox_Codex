# Mini Improvement Box v1 Requirements

## 1. Document Information

- Document type: Requirements
- Target: Mini Improvement Box v1
- Status: Conditionally approved as implementation planning input
- Created date: 2026-05-08
- Last updated: 2026-05-09
- Author: AI-assisted
- Premise: This document reflects human conditional approval recorded on 2026-05-08 for use as an input to v1 roadmap and implementation request creation. This approval scope does not include release approval, residual risk acceptance, or final completion judgment; those remain human responsibilities.

## 2. Purpose

Mini Improvement Box v1 is a small web application where general users can submit improvement proposals, and administrator users can view proposals and change proposal statuses.

The purpose of v1 is to provide the minimum functionality needed to receive and manage improvement proposals during a limited internal trial.

## 3. Operation Premise

Human-decided requirements:

- v1 is intended for a limited internal trial.
- Public release and production operation are outside the direct scope of v1.
- v1 requirements must be reviewed again before any production release or broader user rollout.
- Docker Compose is the standard development and trial verification environment for v1. This does not approve production release or production operation.

## 4. Intended Users

| User Type | Description | Main Operations |
|---|---|---|
| General user | An unauthenticated user who submits improvement proposals | Submit proposals |
| Administrator user | An authenticated user with the single `admin` role | View proposal list, view proposal details, change proposal status |

Human-decided requirements:

- General users do not need to authenticate to submit proposals.
- v1 primarily supports anonymous submission.
- Administrator features require authentication.
- v1 uses a single administrator role: `admin`.
- General users and unauthenticated users cannot access administrator screens or administrator operations.

## 5. v1 Scope

### 5.1 Included Features

- General users can submit improvement proposals without authentication.
- General users can optionally provide submitter information.
- Administrator users can view a list of submitted improvement proposals.
- Administrator users can view improvement proposal details.
- Administrator users can change improvement proposal statuses.
- Status change history is recorded and treated as the audit record for status changes.
- The application returns safe errors for invalid input, missing input, nonexistent proposals, unauthorized access, and update conflicts.
- Administrator features are not available to general users or unauthenticated users.

### 5.2 Excluded From v1

- Comments, replies, or discussions on proposals.
- File attachments.
- Image uploads.
- Email notifications.
- External chat integrations.
- AI-based proposal classification, summarization, or response generation.
- Multi-organization or multi-tenant support.
- Editing or deleting submitted proposals by general users.
- Proposal deletion through application screens or APIs.
- Physical deletion or logical deletion as an application feature.
- Advanced search, tagging, analytics, or dashboards.
- Public API exposure.
- Public release or production operation.

## 6. Functional Requirements

### 6.1 Improvement Proposal Submission

General users can submit improvement proposals without authentication.

Human-decided requirements:

- Anonymous submission is the default operation model.
- Submitter information is collected only as optional input.
- A proposal can be submitted even when submitter information is blank.
- Optional submitter information fields are `submitter_name` and `submitter_contact`.
- New submissions have the initial status `new`.

Fields:

| Field | Required | Description |
|---|---:|---|
| Title | Yes | Short proposal heading |
| Body | Yes | Detailed improvement proposal content |
| Submitter display name | No | Optional submitter information field: `submitter_name` |
| Contact information | No | Optional submitter information field: `submitter_contact`; v1 limits this field to email format |

Approved input constraints:

| Field | Constraint |
|---|---|
| Title | 1 to 100 characters |
| Body | 1 to 2000 characters |
| Submitter display name | 0 to 100 characters |
| Contact information | 0 to 254 characters; email format when provided |

On successful submission:

- The proposal is saved with status `new`.
- The submitter sees a screen or message indicating that the submission was completed.
- Internal IDs and administrative information are not unnecessarily shown to the submitter.

On failed submission:

- Missing input and length violations are shown with safe messages that the user can act on.
- Internal system errors, stack traces, and database error details are not shown.

### 6.2 Administrator Proposal List

Administrator users can view a list of submitted improvement proposals.

Proposed list fields:

- Proposal ID
- Title
- Status
- Created date and time
- Last updated date and time
- Submitter display name or anonymous display

Basic list requirements:

- Non-administrator users cannot view the list.
- The default order should show recent proposals first, based on created date or updated date.
- v1 should include pagination or a maximum result limit to avoid unbounded full-list rendering.

### 6.3 Administrator Proposal Details

Administrator users can view improvement proposal details.

Proposed detail fields:

- Proposal ID
- Title
- Body
- Status
- Created date and time
- Last updated date and time
- Submitter display name or anonymous display
- Contact information if provided

Notes:

- Proposal content may include personal information or confidential information, so it must not be shown to non-administrator users.
- Full proposal body content must not be written to logs or error notifications.

### 6.4 Proposal Status Changes

Administrator users can change proposal statuses.

Human-decided requirements:

- v1 statuses are `new`, `reviewing`, `planned`, `done`, and `declined`.
- New submissions use the initial status `new`.
- v1 uses a simple state transition model where an administrator can change a proposal to any valid status.
- Invalid status values are rejected.
- Status change history is required in v1.
- Status change history is treated as the audit record for status changes.

Statuses:

| Status | Meaning |
|---|---|
| new | Newly submitted |
| reviewing | Under review |
| planned | Planned for action |
| done | Completed |
| declined | Not planned for action |

Status change requirements:

- Non-administrator users cannot change statuses.
- The application rejects nonexistent status values.
- The application returns a safe error when the target proposal does not exist.
- Status update and status change history creation must be handled consistently.
- Concurrent update handling uses optimistic locking with a proposal `version` field.

### 6.5 Concurrent Status Update Handling

Human-approved requirements:

- Use optimistic locking for status changes.
- Add a `version` field to proposals and include the read version in the status change request.
- Update the proposal only when both proposal ID and version match.
- Increment the version when the status update succeeds.
- Create the status change history record in the same transaction as the status update.
- If zero rows are updated because the version no longer matches, return this safe conflict error to the administrator: `この提案は他の管理者により更新されています。最新の内容を確認してから再度操作してください。`
- On conflict, fetch the latest proposal state and reflect it on the screen.
- Do not automatically retry the status change after conflict.
- Do not expose SQL errors, stack traces, internal lock details, or internal implementation details to users.

Rejected or less-preferred alternatives:

| Alternative | Reason It Is Not Preferred |
|---|---|
| Last write wins | Allows silent overwrites and can hide another administrator's update |
| Database lock centered design | More complex than necessary for a limited internal trial |
| Re-fetch before every update only | Reduces stale UI risk but does not fully prevent final-moment conflicts |

Related ADR:

- ADR-0004 accepts optimistic locking with a proposal `version` field.

## 7. Non-Functional Requirements

### 7.1 Security

- Administrator features require authentication.
- Administrator features must be authorized at the server side or another trusted boundary.
- UI hiding alone must not be used as administrator access control.
- Proposal content is external input and must be validated before storage.
- Proposal content must not be trusted and rendered as HTML.
- Internal error details must not be shown to users.
- Secrets, authentication information, submitter personal information, and full proposal body content must not be logged.

### 7.2 Personal and Confidential Information

Human-decided requirements:

- Submitter information is optional.
- Anonymous submission is the default operation model.

Human-approved requirements and accepted ADR decisions:

- Collect only the minimum optional submitter fields: `submitter_name` and `submitter_contact`.
- Do not require submitter information for proposal submission.
- Explain on the submission screen that anonymous submission is the default, but any voluntarily entered submitter information can be viewed by administrators.
- Limit `submitter_contact` to email format in v1.
- Do not display submitter information outside administrator screens.
- Do not write submitter information or full proposal body content to logs, errors, notifications, test data, or sample data.
- Treat backups and exports as containing personal and confidential information.
- Apply the same retention policy to submitter information as to the proposal body.

Remaining non-blocking design item:

- Exact screen wording that explains anonymity and optional submitter information may be refined during UI design, but must preserve the approved meaning.

### 7.3 Auditability

Human-decided requirements:

- Status change history is required in v1.
- Status change history is treated as the audit record for status changes.

Required status change history fields:

| Field | Description |
|---|---|
| id | History ID |
| proposal_id | Target proposal ID |
| old_status | Previous status |
| new_status | New status |
| changed_by | Administrator who made the change |
| changed_at | Change date and time |
| result | Change result |

Human-approved requirements and accepted ADR decisions:

- Do not require application-specific administrator proposal view history in v1 unless the trial is expected to handle highly sensitive proposal content.
- Require application-specific administrator login success and failure logs because Better Auth email/password is used.
- Administrator login logs must not record passwords, session information, proposal body content, or submitter information.

### 7.4 Availability and Performance

- v1 assumes small-scale limited internal trial usage.
- Expected concurrent users and expected proposal volume remain planning assumptions for basic design.
- Proposal lists should use pagination or result limits to prepare for data growth.

### 7.5 Retention, Deletion, and Backup

Human-decided requirements:

- v1 does not provide proposal deletion through screens or APIs.
- Physical deletion and logical deletion as application features are outside the v1 scope.

Human-approved requirements and accepted ADR decisions:

- Retain proposal data until 90 days after the trial ends.
- After the retention period, perform an approved operational deletion outside the v1 application, such as deleting the database file or deleting/exporting target records through an approved administrative procedure.
- Use daily backups during the trial.
- Keep 14 backup generations.
- Store backups outside the application public directory, in local or managed storage whose permissions are limited to administrators and operators.
- Treat backup encryption as required for the trial environment.
- When Docker Compose is used, keep the SQLite database file and backup files in explicit persistent volumes or host bind mounts. Do not rely on files stored only inside an ephemeral container.
- Define the trial end date as the date when a human records the end of the trial.
- Record trial end date, decision maker, and reason in an operations record such as `docs/operations/trial-operation-record.md`.
- At trial end date plus 90 days, delete the database file and target backups through an approved post-retention deletion procedure.
- Create a restore procedure before trial start and manually verify the restore procedure at least once.
- Revisit retention, deletion request handling, backup, and restore procedures before any production release.

Reason for the 90-day post-trial retention recommendation:

- It provides time for post-trial review, requirement refinement, incident investigation, and design improvement.
- It is more practical than immediate deletion or a 30-day period when stakeholder review may be delayed.
- It limits personal and confidential information exposure better than 180-day or indefinite retention.
- v1 is not a production service, so indefinite retention is not justified.

Alternatives:

| Alternative | Benefit | Drawback | Evaluation |
|---|---|---|---|
| Delete at trial end | Minimizes retention risk | Weakens post-trial review and incident investigation | Suitable only for strict data minimization |
| Retain for 30 days after trial | Lower retention risk than 90 days | May be too short for review and follow-up | Acceptable if privacy risk is prioritized |
| Retain for 90 days after trial | Balances review needs and retention risk | Requires explicit deletion operation | Recommended |
| Retain for 180 days after trial | More time for analysis | Long retention for an internal trial | Requires stronger justification |
| Retain indefinitely | Operationally simple | High personal and confidential information risk | Not recommended |

Remaining release-blocking verification:

- Human verification of backup, restore, retention, and post-retention deletion procedures before trial release.

## 8. Architecture and Technology Recommendations

Technology choices in this section have been accepted for v1 through Accepted ADRs. Revisit these decisions before production release or if v1 scope expands materially.

### 8.1 Technology Stack Options

| Option | Summary | Benefits | Drawbacks | Evaluation |
|---|---|---|---|---|
| Next.js App Router + TypeScript + React | Full-stack React framework stack | Keeps UI, administrator screens, server-side authorization, and data operations in one small project; strong documentation; suitable for small web apps | Requires following Next.js-specific conventions | Recommended |
| SvelteKit + TypeScript | Svelte-based full-stack framework | Lightweight UI development and good small-app ergonomics | Higher learning cost if the team is React-oriented | Acceptable alternative |
| Hono + React/Vite | Lightweight API framework plus SPA | Clear API boundary and lightweight server | Requires assembling routing, auth, rendering, and frontend conventions separately | Acceptable but more design work |
| Express + React/Vite | Traditional Node.js API plus SPA | Familiar, flexible, large ecosystem | More wiring for type safety and app structure; heavier split for v1 | Lower preference |

Accepted v1 technology decision:

- Use `Next.js App Router + TypeScript + React`.

Related ADR:

- ADR-0001: Application Runtime and Web Framework.

### 8.2 Administrator Authentication Options

| Option | Summary | Benefits | Risks or Drawbacks | Evaluation |
|---|---|---|---|---|
| Existing IdP OAuth/OIDC + admin allowlist | Login through an existing internal identity provider and allow only approved admin identities | Avoids storing passwords in the application; fits internal trial use; administrator access can be controlled by allowlist | Requires an available IdP; configuration errors can affect access control | Recommended if an internal IdP exists |
| Better Auth email/password | Application-managed administrator authentication | TypeScript-oriented; supports email/password and session management | Requires password handling, initial admin setup, reset policy, and lockout considerations | Recommended fallback if no IdP exists |
| Auth.js / NextAuth.js | Authentication library commonly used with Next.js | Supports OAuth providers and session strategies | Current positioning should be confirmed because NextAuth.js points to Better Auth | Viable for OAuth-based Next.js auth |
| Basic authentication | Simple username/password protection | Small implementation footprint | Weak individual accountability, rotation, and auditability; poor fit for future production | Not recommended except for short-lived local-only testing |

Accepted v1 authentication and authorization decision:

- Use Better Auth email/password.
- Do not provide normal UI-based self-registration.
- Create one initial `admin` account by seed or an administrative script.
- Use a database-level administrator enabled/disabled flag or Better Auth-side disable procedure for administrator disabling.
- Do not create an administrator disabling UI in v1.
- For administrator rotation, add the new administrator and then disable the old administrator by operational procedure.
- Do not create a rotation UI in v1.
- For password reset or recovery, use an administrator operational procedure.
- Do not create public self-service password reset in v1.
- Administrator authorization must be enforced server-side and centralized where practical.

Related ADR:

- ADR-0003: Authentication and Authorization Model.

### 8.3 Database, ORM, and Data Access Options

| Option | Benefits | Drawbacks | Evaluation |
|---|---|---|---|
| SQLite + Prisma | Fits small limited internal trial use; Prisma supports SQLite; type-safe data access; simple local deployment | SQLite enum values are not enforced at the database level by Prisma, so application validation is required | Recommended |
| SQLite + Drizzle | Lightweight and SQL-oriented; good control over schema and queries | More hand-written query and schema decisions than Prisma | Acceptable alternative |
| PostgreSQL + Prisma | Stronger production path, constraints, and concurrent access model | More operational overhead than needed for a limited internal trial | Consider if production path is near-term |
| JSON or flat file storage | Very small initial setup | Weak consistency, concurrency, queryability, auditability, and backup discipline | Not recommended |

Accepted v1 database and data access decision:

- Use `SQLite + Prisma + server-side Data Access Layer`.

Recommended data access policy:

- UI components must not access the database directly.
- Proposal creation, administrator proposal retrieval, status changes, and status history creation must go through server-side functions or a Data Access Layer.
- Status update and status change history creation must run in the same transaction.
- Administrator-facing data should be returned through DTOs that include only necessary fields.
- Status values must be validated in application logic.
- Database constraints should be considered where practical, especially for required fields and referential integrity.

Related ADR:

- ADR-0002: Database, ORM, and Data Access Policy.

### 8.4 Development and Trial Verification Environment

Accepted v1 environment decision:

- Use Docker Compose as the standard development and trial verification environment.
- The application runs on the accepted Next.js/Node.js stack inside the Compose-managed environment.
- The SQLite database file must be stored in an explicit persistent volume or host bind mount.
- Backup files must be stored in an explicit persistent volume or host bind mount outside the application public directory.
- Database files and backup files must not be stored only inside an ephemeral container.
- Required environment variables must be documented with safe placeholders only.
- Secrets, real administrator passwords, database files, and backup files must not be committed.

This environment decision supports implementation reproducibility and trial verification. It does not approve production deployment or release readiness.

Related ADR:

- ADR-0008: Docker Compose Development and Trial Verification Environment.

## 9. Data Requirements

### 9.1 Improvement Proposal

| Field | Description | Notes |
|---|---|---|
| id | Proposal ID | System-generated |
| title | Title | Required |
| body | Body | Required; may include personal or confidential information |
| status | Status | Required; must be one of the approved v1 statuses |
| submitter_name | Optional submitter display name | Approved optional field; 0 to 100 characters; personal information if collected |
| submitter_contact | Optional contact email | Approved optional field; 0 to 254 characters; email format when provided; personal information if collected |
| version | Optimistic locking version | Approved by ADR-0004 |
| created_at | Created date and time | Required |
| updated_at | Updated date and time | Required |

### 9.2 Status Change History

| Field | Description | Notes |
|---|---|---|
| id | History ID | System-generated |
| proposal_id | Target proposal ID | Required |
| old_status | Previous status | Required |
| new_status | New status | Required |
| changed_by | Administrator who made the change | Required |
| changed_at | Change date and time | Required |
| result | Change result | Required |

## 10. Permission Requirements

| Operation | General User | Administrator User |
|---|---:|---:|
| Submit proposal | Allowed without authentication | May be allowed |
| View proposal list | Not allowed | Allowed |
| View proposal details | Not allowed | Allowed |
| Change status | Not allowed | Allowed |
| View status change history | Not allowed | Allowed |
| Delete proposal through screen/API | Not allowed | Out of scope for v1 |

## 11. Proposed Acceptance Criteria

- A general user can submit an improvement proposal without authentication.
- A general user can submit a proposal without submitter information.
- A general user can optionally provide submitter display name and contact information.
- New proposals are saved with status `new`.
- If required fields are missing, the proposal is not saved and a safe error message is shown.
- Input exceeding length limits is not saved.
- An administrator user can view the list of submitted proposals.
- An administrator user can view proposal details.
- An administrator user can change a proposal status to a valid value.
- A successful status change creates a status change history record.
- General users and unauthenticated users cannot use administrator proposal list, detail, status history, or status change features.
- Invalid status values are rejected.
- A stale status update is rejected with the approved safe conflict error, and the latest proposal state is fetched and reflected on the screen without automatic retry.
- User-facing errors do not contain internal implementation details.
- The application does not provide proposal deletion screens or APIs in v1.

## 12. Proposed Test Perspectives

Implementation must follow `docs/ai-development/policies/TEST_POLICY.md` and should consider at least the following:

- Successful unauthenticated proposal submission.
- Proposal submission without optional submitter information.
- Proposal submission with optional submitter information.
- Proposal submission with missing required input.
- Proposal submission with input exceeding length limits.
- Safe display when the proposal body includes HTML-like strings.
- Administrator proposal list viewing.
- Administrator proposal detail viewing.
- Administrator status changes.
- Status change history creation after successful status change.
- Rejection of invalid statuses.
- Rejection of administrator feature access by unauthenticated users.
- Rejection of administrator feature access by general users.
- Safe error when accessing a nonexistent proposal ID.
- Safe conflict error for stale status update using the approved optimistic locking policy.
- Confirmation that proposal deletion screens and APIs do not exist in v1.

When implementation changes feature behavior, proposal and administrator feature test case CSV files must be created or updated under `docs/tests/`.

## 13. Human Decisions Required

### 13.1 Already Decided By Humans

- v1 is a limited internal trial.
- Public release and production operation are outside the direct v1 scope.
- General users can submit proposals without authentication.
- Anonymous submission is the default operation model.
- Submitter information, if collected, is optional and must not be required for submission.
- Administrator features require authentication.
- v1 uses a single `admin` role.
- General users and unauthenticated users cannot access administrator screens or administrator operations.
- v1 statuses are `new`, `reviewing`, `planned`, `done`, and `declined`.
- New proposals use initial status `new`.
- Administrators can change a proposal to any valid status.
- Invalid status values are rejected.
- Status change history is required and treated as the audit record for status changes.
- v1 does not provide proposal deletion through screens or APIs.
- Physical deletion and logical deletion as application features are outside the v1 scope.
- Conditional approval: this requirements specification is approved as a v1 implementation input after Accepted ADR reflection in this document.
- Use `Next.js App Router + TypeScript + React`.
- Use Better Auth email/password.
- Use `SQLite + Prisma + server-side Data Access Layer`.
- Use `submitter_name` and `submitter_contact` as optional submitter information fields.
- Use optimistic locking with a proposal `version` field for status changes.
- Do not require administrator proposal view history in v1.
- Require application-specific administrator login success and failure logs in v1.
- Retain proposal data until 90 days after trial end.
- Use daily backups during the trial and keep 14 backup generations.
- Treat backup encryption as required for the trial environment.
- Create one initial `admin` account by seed or administrative script.
- Do not provide normal UI-based administrator self-registration.
- Do not provide administrator disabling, rotation, or public self-service password reset UI in v1.
- Use Docker Compose as the standard development and trial verification environment for v1.

### 13.2 Phase-Blocking

No unresolved phase-blocking requirement decisions remain after the 2026-05-08 human decisions are reflected.

Before implementation starts, a development roadmap and implementation requests should be created or reviewed according to the project workflow.

### 13.3 Non-Blocking

The following items can be adjusted in parallel with implementation, but should be resolved before release:

- Screen wording.
- Default sort order for the administrator proposal list.
- Additional fields shown in the list.
- Submission completion message wording.
- Localized display labels for statuses.

### 13.4 Release-Blocking

The following items require human verification or human decision before release. Requirements and basic design have already been conditionally approved for v1 roadmap and implementation request creation; the items below are release-stage verification and risk-acceptance gates, not prerequisites for using these documents as implementation planning input.

- Confirmation that implemented behavior still matches the conditionally approved requirements and basic design.
- Human acceptance of any requirement or basic-design changes introduced after implementation planning starts.
- Acceptance of security, personal information, and confidential information risks.
- Manual verification of administrator permissions.
- Manual verification of the main flow from proposal submission to administrator status change.
- Manual verification of status change history creation.
- Manual verification that the Docker Compose environment uses documented persistent database and backup paths.
- Confirmation of operation procedures, backup, retention, post-retention deletion, and incident response.

## 14. Assumptions

- v1 is designed as a small web application for a limited internal trial.
- v1 focuses on receiving and managing improvement proposals.
- External API integrations, AI features, and file attachments are excluded.
- Proposal body content is treated as untrusted external input.
- Optional submitter information is treated as personal information when provided.
- Administrator operations are treated as security-sensitive operations.
- This requirements specification has conditional human approval as a v1 implementation input after Accepted ADR reflection.

## 15. Risks

| Risk | Description | Proposed Response |
|---|---|---|
| Personal information input | Proposal body or optional submitter information may include personal information | Minimize collected fields, restrict visibility, suppress sensitive logs |
| Misunderstood anonymity | Users may believe submissions are fully anonymous even if voluntarily entered information or operational metadata remains | Clearly define the scope of anonymity on the submission screen |
| Authorization failure | If general users can access administrator features, proposal data may be leaked | Require server-side authorization and permission tests |
| Insufficient auditability | Status change history may be insufficient if proposal content is highly sensitive | Require status change history; decide whether proposal view and login logs are required |
| Silent overwrite | Concurrent administrator updates may overwrite each other | Use optimistic locking and safe conflict errors |
| Data growth | List performance and manageability may degrade | Define pagination, result limits, and retention period |
| XSS | Proposal body may include scripts or HTML | Define escaping or sanitization policy |
| Backup exposure | Backups may contain proposal body and optional personal information | Restrict backup access and use encryption where practical |
| Container persistence misconfiguration | SQLite database or backups could be lost if stored only inside an ephemeral container | Require explicit persistent volume or host bind mount design and verify backup/restore before trial release |
| Unclear operation | Incident handling, backup, retention, and deletion request handling may be unclear | Define and manually verify operation procedures before trial release |

## 16. ADR Notes

Accepted ADRs under `docs/adr/` have been reflected in this document:

- ADR-0001: Application Runtime and Web Framework
- ADR-0002: Database, ORM, and Data Access Policy
- ADR-0003: Authentication and Authorization Model
- ADR-0004: Concurrent Status Update Handling
- ADR-0005: Optional Submitter Information and Personal Data Handling
- ADR-0006: Retention, Deletion, and Backup Policy
- ADR-0007: Audit Log Policy
- ADR-0008: Docker Compose Development and Trial Verification Environment

No ADR conflict is identified in this requirements document.

## 17. Official Information References

Official information was checked on 2026-05-08.

| Topic | Source | Notes Checked |
|---|---|---|
| Next.js | https://nextjs.org/docs | Next.js is documented as a React framework for building full-stack web applications |
| Next.js App Router | https://nextjs.org/docs/app | App Router is a file-system based router using React features such as Server Components, Suspense, and Server Functions |
| Next.js release | https://nextjs.org/blog/next-16-2 | Next.js 16.2 was published on 2026-03-18 |
| React version | https://react.dev/versions | Latest React documentation version was React 19.2 at the time of checking |
| Next.js authentication guide | https://nextjs.org/docs/app/guides/authentication | Authentication libraries, centralized Data Access Layer authorization, and DTOs are recommended patterns |
| Better Auth | https://better-auth.com/docs/introduction | Better Auth is a TypeScript authentication and authorization framework |
| NextAuth.js | https://next-auth.js.org/ | NextAuth.js states that it is now part of Better Auth |
| SQLite | https://www.sqlite.org/ | SQLite is positioned as small, fast, self-contained, and reliable; latest release was 3.53.1 on 2026-05-05 |
| SQLite release history | https://www.sqlite.org/changes.html | SQLite 3.53.1 release date was confirmed as 2026-05-05 |
| Prisma SQLite connector | https://docs.prisma.io/docs/orm/core-concepts/supported-databases/sqlite | Prisma supports SQLite and notes SQLite enum enforcement limitations |
| Prisma supported databases | https://docs.prisma.io/docs/v6/orm/reference/supported-databases | Prisma supported database options were checked |
| Hono | https://hono.dev/docs/ | Hono is a small, fast web framework built on Web Standards |
| Express | https://expressjs.com/ | Express is a minimal and flexible Node.js web application framework |

## 18. Recommended Next Steps

1. Review the revised basic design using `docs/ai-development/checklists/BASIC_DESIGN_CHECKLIST.md`.
2. Create or review a development roadmap for the v1 implementation units.
3. Split implementation requests into small implementation units.
4. For each implementation unit, identify the required feature-based test case CSV files that must be created or updated under `docs/tests/`.
5. Before trial release, manually verify administrator permissions, main proposal flow, status history, logging safety, backup, restore, retention, post-retention deletion, and incident response procedures.
