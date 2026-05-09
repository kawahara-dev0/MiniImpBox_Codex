# Mini Improvement Box v1 Basic Design

## 1. Document Information

- Document type: Basic design
- Target: Mini Improvement Box v1
- Status: Conditionally approved as implementation planning input
- Created date: 2026-05-08
- Last updated: 2026-05-09
- Author: AI-assisted Designer
- Workflow: `docs/ai-development/workflows/DESIGN_WORKFLOW.md`

This document is conditionally approved for use as an input to v1 roadmap and implementation request creation after the 2026-05-08 human decisions were reflected and Design Reviewer recheck passed. This approval scope does not include release approval, residual risk acceptance, or final completion judgment; those remain human responsibilities.

## 2. Source Documents Checked

- `AGENTS.md`
- `docs/ai-development/policies/AI_RULES.md`
- `docs/ai-development/policies/AI_DEVELOPMENT_POLICY.md`
- `docs/ai-development/policies/REVIEW_POLICY.md`
- `docs/ai-development/policies/SECURITY_POLICY.md`
- `docs/ai-development/policies/TEST_POLICY.md`
- `docs/ai-development/checklists/BASIC_DESIGN_CHECKLIST.md`
- `docs/ai-development/agents/DESIGNER.md`
- `docs/ai-development/agents/DESIGN_REVIEWER.md`
- `docs/requirements/requirements-v1.md`
- Accepted ADRs under `docs/adr/`

## 3. Human-Approved Decisions Used

The following decisions are treated as human-approved because they are stated as human-decided requirements or accepted ADRs.

- v1 is a limited internal trial.
- Public release and production operation are outside the direct v1 scope.
- General users can submit proposals without authentication.
- Anonymous submission is the default operation model.
- Administrator features require authentication.
- v1 uses a single `admin` role.
- General users and unauthenticated users cannot access administrator screens or administrator operations.
- v1 statuses are `new`, `reviewing`, `planned`, `done`, and `declined`.
- New proposals use initial status `new`.
- Administrators can change a proposal to any valid status.
- Status change history is required and is the audit record for status changes.
- v1 does not provide proposal deletion screens or APIs.
- Physical deletion and logical deletion as application features are out of scope for v1.
- Application stack: Next.js App Router, TypeScript, React, Node.js runtime supported by the selected Next.js version. See ADR-0001.
- Data stack: SQLite, Prisma, server-side Data Access Layer. See ADR-0002.
- Development and trial verification environment: Docker Compose with explicit persistent storage for the SQLite database and backups. See ADR-0008.
- Authentication: Better Auth email/password for administrators. See ADR-0003.
- Authorization: single `admin` role enforced server-side. See ADR-0003.
- Concurrent status updates: optimistic locking with proposal `version`. See ADR-0004.
- Optional submitter fields: `submitter_name` and `submitter_contact`. See ADR-0005.
- Retention and backup policy: retain until 90 days after trial end, daily backups, 7 to 14 backup generations, operational deletion outside the v1 app. See ADR-0006.
- Audit policy: status change history, no proposal view history, application-specific administrator login success and failure logs. See ADR-0007.
- Requirements specification: conditionally approved as an input to v1 roadmap and implementation request creation after Accepted ADR reflection.
- Basic design: conditionally approved as an input to v1 roadmap and implementation request creation after reflecting the 2026-05-08 human decisions and passing Design Reviewer recheck.
- Input constraints: `title` 1 to 100 characters, `body` 1 to 2000 characters, `submitter_name` 0 to 100 characters, `submitter_contact` 0 to 254 characters.
- `submitter_contact` is limited to email format in v1 when provided.
- Initial administrator account is created by seed or an administrative script. Normal UI-based self-registration is not provided.
- Administrator disabling is handled by a database-level enabled/disabled flag or Better Auth-side disable procedure. A disabling UI is not provided in v1.
- Administrator rotation is handled by adding a new administrator and disabling the old administrator through an operational procedure. A rotation UI is not provided in v1.
- Password reset or recovery is handled by an administrator operational procedure. Public self-service password reset is not provided in v1.
- Optimistic-lock conflict message: `この提案は他の管理者により更新されています。最新の内容を確認してから再度操作してください。`
- On optimistic-lock conflict, fetch and reflect the latest proposal state on the screen. Do not automatically retry the status change.
- Backup generations: 14.
- Backup storage: outside the application public directory, in local or managed storage whose permissions are limited to administrators and operators.
- Backup encryption is required for the trial environment.
- Trial end date is the date when a human records the end of the trial.
- Trial end date, decision maker, and reason are recorded in an operations record such as `docs/operations/trial-operation-record.md`.
- At trial end date plus 90 days, the database file and target backups are deleted through an approved post-retention deletion procedure.
- A restore procedure must be created before trial start and manually verified at least once.
- Docker Compose is the standard development and trial verification environment for v1.
- The SQLite database file and backup files must be stored in explicit persistent volumes or host bind mounts, not only inside an ephemeral container.

## 4. Design Scope

### 4.1 Included in v1

- Unauthenticated proposal submission.
- Optional submitter information.
- Administrator login.
- Initial administrator creation by seed or administrative script.
- Administrator proposal list.
- Administrator proposal detail.
- Administrator status change.
- Status change history.
- Administrator login audit logs.
- Safe validation and error handling.
- Server-side authorization for all administrator operations.
- Operational backup, restore, retention, and post-retention deletion procedures as operational design items.

### 4.2 Out of Scope

- Comments, replies, or discussion threads.
- File or image uploads.
- Email notifications.
- External chat integrations.
- AI classification, summarization, or response generation.
- Multi-tenant or multi-organization support.
- General-user proposal editing or deletion.
- Proposal deletion screens or APIs.
- Advanced search, tags, analytics, or dashboards.
- Public API exposure.
- Public release or production operation.

## 5. Users, Roles, and Permissions

| User type | Authentication | Role | Allowed operations |
|---|---|---|---|
| General user | Not required | None | Submit proposal |
| Administrator | Required | `admin` | View proposal list, view proposal detail, view status history, change proposal status |

Permission rules:

- Proposal submission must not require authentication.
- Administrator pages and server actions must require an authenticated administrator.
- Authorization must be checked on the server side or another trusted boundary.
- UI hiding may improve usability but must not be treated as authorization.
- No non-admin route, server action, or data access function may return proposal detail, submitter information, status history, or login audit data.
- Normal UI-based administrator self-registration, disabling UI, rotation UI, and public self-service password reset are not provided in v1.
- Administrator account lifecycle operations are handled by seed, administrative scripts, Better Auth-side procedures, or direct operational procedures approved for the trial.

## 6. System Architecture

### 6.1 Logical Layers

| Layer | Responsibility |
|---|---|
| UI routes and components | Render submission form and administrator screens. Do not access the database directly. |
| Server actions / route handlers | Validate request shape, call authorization helpers for administrator operations, call service or Data Access Layer functions, return safe responses. |
| Authorization helpers | Confirm authenticated administrator session and `admin` role. Centralize administrator access checks. |
| Service layer | Coordinate business rules that involve multiple Data Access Layer operations, such as status change workflow. |
| Data Access Layer | Own Prisma calls, DTO shaping, transaction boundaries, optimistic locking update, and status history persistence. |
| Database | Store proposals, status change history, administrator login audit logs, and Better Auth data. |
| Docker Compose environment | Provide the standard development and trial verification runtime, including explicit persistent paths for the SQLite database and backups. |
| Operational procedures | Backup, restore, retention calculation, and post-retention deletion outside the v1 application. |

### 6.2 Responsibility Boundary Rules

- Business rules must not be embedded only in UI components.
- Proposal status validation must happen before data persistence.
- Administrator authorization must be enforced before administrator data reads and writes.
- Proposal list and detail responses must use DTOs that include only required administrator-facing fields.
- The Data Access Layer must not return raw database records to UI components when sensitive fields are not needed.
- Status update and status change history creation must run in one transaction.
- Docker container recreation must not delete the SQLite database or backup files when the configured persistent volumes or bind mounts are preserved.

### 6.3 Development and Trial Verification Environment

Docker Compose is the standard development and trial verification environment for v1.

Environment rules:

- The Compose setup must run the accepted Next.js/Node.js application stack.
- The SQLite database path must point to an explicit persistent volume or host bind mount.
- Backup output must point to an explicit persistent volume or host bind mount outside the application public directory.
- Database and backup files must not be committed to the repository.
- Required environment variables must be documented with safe placeholders only.
- Secrets, real administrator passwords, session secrets, encryption keys, database files, and backup files must not be printed by scripts or committed.
- The Docker setup must not be described as production release approval.

Verification implications:

- Step 1 must verify the application can start through Docker Compose.
- Trial-readiness verification must confirm the database persists after container recreation when the configured persistent storage is retained.
- Backup and restore procedures must use the documented persistent database and backup paths.

## 7. Route and Screen Design

Proposed route structure:

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Proposal submission form |
| `/submitted` | Public | Submission completion screen |
| `/admin/login` | Public | Administrator login |
| `/admin/proposals` | Admin only | Proposal list |
| `/admin/proposals/[id]` | Admin only | Proposal detail and status change |

Screen behavior:

- Submission form includes `title`, `body`, optional `submitter_name`, and optional `submitter_contact`.
- Submission completion screen must not expose internal IDs or administrative metadata.
- Administrator proposal list shows recent proposals first.
- Administrator proposal list must use pagination or a fixed result limit.
- Administrator detail screen shows proposal body, optional submitter information, current status, version, timestamps, and status change history.
- Administrator detail screen sends the proposal `version` read by the screen when requesting a status change.
- On status update conflict, the administrator sees `この提案は他の管理者により更新されています。最新の内容を確認してから再度操作してください。`
- On status update conflict, the latest proposal state is fetched and reflected on the screen. The original status change is not automatically retried.

## 8. Data Design

### 8.1 Proposal

| Field | Type direction | Required | Notes |
|---|---|---:|---|
| `id` | String or integer ID | Yes | System-generated. Exact Prisma type is implementation detail, but must be stable for references. |
| `title` | String | Yes | Constraint: 1 to 100 characters. |
| `body` | String | Yes | Constraint: 1 to 2000 characters. May contain personal or confidential information. |
| `status` | String | Yes | Must be one of `new`, `reviewing`, `planned`, `done`, `declined`. |
| `submitter_name` | Nullable string | No | Constraint: 0 to 100 characters. Personal information when provided. |
| `submitter_contact` | Nullable string | No | Constraint: 0 to 254 characters and email format when provided. Personal information when provided. |
| `version` | Integer | Yes | Initial value `1`; increment by `1` on successful status change. |
| `created_at` | DateTime | Yes | Set on creation. |
| `updated_at` | DateTime | Yes | Updated on successful modification. |

### 8.2 Status Change History

| Field | Type direction | Required | Notes |
|---|---|---:|---|
| `id` | String or integer ID | Yes | System-generated. |
| `proposal_id` | Proposal reference | Yes | Required. |
| `old_status` | String | Yes | Previous valid status. |
| `new_status` | String | Yes | New valid status. |
| `changed_by` | Admin identifier | Yes | Must identify the authenticated administrator without storing unnecessary personal data. |
| `changed_at` | DateTime | Yes | Set when status change succeeds. |
| `result` | String | Yes | `success` for successful status changes in v1. |

Failed status change attempts:

- Validation failures and optimistic-lock conflicts do not create successful status change history records.
- Security-relevant failures should be visible through safe application or operational logs without proposal body or submitter information.

### 8.3 Administrator Login Audit Log

| Field | Type direction | Required | Notes |
|---|---|---:|---|
| `id` | String or integer ID | Yes | System-generated. |
| `event_type` | String | Yes | `admin_login_success` or `admin_login_failure`. |
| `admin_identifier` | String | Yes | Email or stable admin identifier. |
| `timestamp` | DateTime | Yes | Event time. |
| `result` | String | Yes | `success` or `failure`. |
| `reason_category` | String | Yes | Safe category such as `invalid_credentials`, `disabled_account`, or `unknown`. |
| `request_id` | String | Yes | Request correlation ID. |

Login audit logs must not store passwords, session tokens, full session data, proposal body content, or submitter information.

### 8.4 Better Auth Data

Better Auth-owned authentication tables or records are part of the application database design, but their exact schema should follow Better Auth implementation guidance during implementation. Application code must not duplicate password handling outside Better Auth unless explicitly required by the library setup.

## 9. Business Rules

### 9.1 Proposal Submission

- `title` and `body` are required.
- `submitter_name` and `submitter_contact` are optional.
- A proposal can be submitted without submitter information.
- `submitter_contact` must be blank or a valid email-format value no longer than 254 characters.
- New proposals always start with status `new`.
- External input must be validated before storage.
- Proposal content must be escaped when displayed and must not be rendered as trusted HTML.
- Submission errors must be safe and actionable.
- Internal IDs, stack traces, SQL errors, and framework details must not be shown to general users.

### 9.2 Administrator List and Detail

- Administrator reads require server-side admin authorization.
- Proposal list should default to recent proposals first.
- Proposal list must have pagination or a maximum result limit.
- Proposal detail may show full proposal body and optional submitter information only to administrators.
- Full proposal body and optional submitter information must not be written to logs.

### 9.3 Status Change

- Only administrators can change status.
- Target status must be one of the accepted v1 statuses.
- Any valid status can be changed to any other valid status.
- The request must include the proposal ID, target status, and read `version`.
- The update succeeds only when proposal ID and version match.
- On success, update proposal status, increment version, update `updated_at`, and create status change history in one transaction.
- On nonexistent proposal or stale version, return a safe error and do not create a successful status change history record.
- On stale version, fetch the latest proposal state and reflect it on the screen without automatically retrying the status change.

## 10. Validation and Error Handling

| Case | User-facing behavior | Internal handling |
|---|---|---|
| Missing title or body | Show safe validation message | Do not create proposal |
| Length violation | Show safe validation message | Do not create or update record |
| Invalid contact email | Show safe validation message | Do not create proposal until corrected |
| Unauthenticated admin access | Redirect to login or return safe unauthorized response | Do not reveal proposal existence |
| Non-admin access | Return safe forbidden response | Do not return administrator data |
| Nonexistent proposal | Show safe not-found message | Do not expose database details |
| Invalid status | Show safe validation message | Do not update proposal |
| Stale status version | Show `この提案は他の管理者により更新されています。最新の内容を確認してから再度操作してください。` and reflect the latest proposal state | Do not create successful status history; do not automatically retry |
| Unexpected system error | Show generic safe error | Log safe operational metadata only |

## 11. Security and Sensitive Data Design

- Proposal body and optional submitter information are sensitive by default.
- Proposal body may contain personal, workplace, or confidential business information even when submitter fields are blank.
- Optional submitter information is visible only on administrator screens.
- Logs must not include optional submitter information, full proposal body content, passwords, session data, or secrets.
- Error messages must not reveal internal implementation details.
- Test fixtures and sample data must use clearly fake data only.
- Administrator authorization must be covered by tests for unauthenticated, unauthorized, and authorized cases.
- Backups must be treated as containing personal and confidential information.
- Administrator seed scripts and operational scripts must not print passwords, password hashes, session data, or secrets.

## 12. Audit, Logging, and Operational Visibility

Required audit records:

- Status change history for successful proposal status changes.
- Administrator login success and failure logs.

Not required in v1:

- Administrator proposal view history.
- Full audit log for every administrator read.

Operational logs may include:

- event type
- request ID
- actor/admin identifier where appropriate
- target proposal ID where appropriate
- result
- safe reason category
- timestamp

Operational logs must not include full proposal body, optional submitter information, passwords, session data, secrets, or raw database errors.

## 13. Retention, Deletion, Backup, and Restore

Policy from ADR-0006:

- Retain proposal data until 90 days after trial end.
- Post-retention deletion is an approved operational procedure outside the v1 application.
- Proposal deletion screens and APIs are not provided in v1.
- Use daily backups during the trial.
- Keep 14 backup generations.
- Restrict backup access to authorized administrators.
- Require backup encryption for the trial environment.
- In the Docker Compose environment, store the SQLite database and backups in explicit persistent volumes or host bind mounts.
- Do not store the database or backups only inside an ephemeral container filesystem.
- Revisit retention, deletion request handling, backup, and restore procedures before production release.

Basic operational design direction:

- Trial end date is the date when a human records the end of the trial.
- Trial end date, decision maker, and reason are recorded in an operations record such as `docs/operations/trial-operation-record.md`.
- Retention end date is trial end date plus 90 days.
- Backup storage must be outside public web-accessible paths.
- Backup storage must be local or managed storage whose permissions are limited to administrators and operators.
- Restore procedure must be documented before trial operation.
- Restore procedure must be manually verified at least once before trial start.
- Backup deletion must be included in post-retention handling.
- At retention end, the database file and target backups are deleted through an approved post-retention deletion procedure.

## 14. Implementation Unit Proposal

This section is a design-level split only. It is not an implementation instruction.

| Unit | Goal | Main verification |
|---|---|---|
| Foundation | Next.js, TypeScript, Prisma, Better Auth setup, Docker Compose environment, initial admin creation script | Type check, lint, basic smoke test, Docker Compose startup verification, admin creation verification |
| Proposal submission | Public proposal form and create flow | Validation tests, safe output checks, proposal test case CSV |
| Admin authentication and authorization | Admin login and server-side admin checks | Auth tests for unauthenticated, unauthorized, authorized access |
| Admin proposal list/detail | Admin-only read screens and DTOs | Permission tests, sensitive data display tests |
| Status change and history | Optimistic locking update and history transaction | Status validation, conflict, transaction, history tests |
| Audit and operations | Login audit logs, backup/retention runbook | Audit tests, manual operational verification |

A development roadmap should be created or confirmed before implementation because v1 spans UI, authentication, authorization, database, audit, and operational procedures.

## 15. Test Strategy

Implementation must follow `docs/ai-development/policies/TEST_POLICY.md`.

Expected feature-based test case CSV ownership:

- `docs/tests/proposal_submission_test_cases.csv`
- `docs/tests/admin_access_test_cases.csv`
- `docs/tests/status_change_test_cases.csv`
- `docs/tests/audit_and_operations_test_cases.csv`

Test-first validation should be considered for:

- Administrator authorization checks.
- Status change transaction and optimistic locking.
- Administrator login audit logs.
- Sensitive data exposure prevention.

Required test perspectives:

- Successful unauthenticated proposal submission.
- Submission without optional submitter information.
- Submission with optional submitter information.
- Missing required fields.
- Length and contact-format validation.
- HTML-like proposal body is displayed safely.
- Unauthenticated administrator access is rejected.
- Non-admin access is rejected if a non-admin authenticated state exists in tests.
- Administrator proposal list and detail are accessible to admin users.
- Valid status change succeeds and creates history.
- Invalid status is rejected.
- Nonexistent proposal returns safe not-found behavior.
- Stale version returns safe conflict behavior.
- Stale version fetches and reflects the latest proposal state without automatic retry.
- Login success and failure audit logs are created without secrets.
- Initial admin creation script creates one admin and does not allow public self-registration.
- Administrator disabling, rotation, and password recovery are covered by operational procedure checks.
- Proposal deletion screens and APIs do not exist in v1.
- Docker Compose startup works with safe placeholder documentation and without committed secrets.
- SQLite database persistence survives container recreation when the configured persistent storage is retained.
- Backup and restore procedures use the documented persistent paths.

## 16. Human Verification Gates

### Phase-blocking

No unresolved phase-blocking design decisions remain after the 2026-05-08 human decisions were reflected and the Design Reviewer recheck passed.

Before implementation starts, create or review a development roadmap and split implementation requests into small reviewable units.

During implementation, Docker Compose startup and persistent storage path verification should be treated as phase-blocking before dependent database, backup, or feature implementation proceeds.

### Non-blocking

The following can be refined during detailed design or implementation review, but must remain visible:

- Exact screen labels and minor UI wording.
- Localized display labels for status values.
- Proposal list column order.
- Submission completion message wording.

### Release-blocking

The following must be verified before trial release or broader rollout:

- Manual verification of proposal submission flow.
- Manual verification of administrator login.
- Manual verification that unauthenticated and non-admin users cannot access administrator functions.
- Manual verification of administrator proposal list and detail behavior.
- Manual verification of status change history creation.
- Manual verification of optimistic-lock conflict behavior.
- Manual verification that logs and errors do not expose proposal body, optional submitter information, passwords, session data, or internal errors.
- Manual verification of backup, restore, retention, and post-retention deletion procedures.
- Manual verification that Docker Compose startup works in the target development or trial verification environment.
- Manual verification that database and backup files are stored in the documented persistent paths and not inside an ephemeral-only container location.
- Human acceptance of residual security, personal information, and operational risks.

## 17. ADR Notes

Accepted ADRs followed:

- ADR-0001: Application Runtime and Web Framework
- ADR-0002: Database, ORM, and Data Access Policy
- ADR-0003: Authentication and Authorization Model
- ADR-0004: Concurrent Status Update Handling
- ADR-0005: Optional Submitter Information and Personal Data Handling
- ADR-0006: Retention, Deletion, and Backup Policy
- ADR-0007: Audit Log Policy
- ADR-0008: Docker Compose Development and Trial Verification Environment

No ADR conflict was identified in this basic design document.

New ADR recommendation:

- ADR-0008 was added to record the human-approved Docker Compose development and trial verification environment decision.
- A new ADR should be considered if production release, multi-role authorization, proposal deletion, public API exposure, external integrations, AI features, or proposal view audit logging is added.

## 18. Assumptions

- v1 implementation will be split into small reviewable units.
- SQLite file permissions and backup access control can be configured in the target trial environment.
- The target development and trial verification hosts can run Docker Compose.
- Host path or volume permissions for the SQLite database and backup directories can be configured consistently enough for the limited internal trial.
- Better Auth can support the required email/password administrator authentication and login audit integration in the selected Next.js stack.
- A non-admin authenticated user may not exist in v1, but tests should still cover absence of the `admin` role where feasible.
- Operational backup and deletion procedures may be documented separately, but must be reviewed before trial operation.

## 19. Remaining Risks

| Risk | Impact | Proposed response |
|---|---|---|
| Requirement drift | Requirements may change after implementation starts | Keep implementation requests small and trace each unit to the requirements document and Accepted ADRs |
| Optional personal data collection | Privacy and confidentiality risk | Use minimal fields, admin-only display, log suppression, retention controls |
| Application-managed admin credentials | Password and account lifecycle responsibility | Follow the approved seed/script, disable, rotation, password recovery, and login audit procedures; verify scripts and procedures during implementation and trial preparation |
| SQLite trial database | Operational file, backup, and concurrency limits | Keep limited trial scope and revisit before production |
| Docker persistent storage misconfiguration | Database or backups could be lost when containers are recreated | Use explicit volumes or host bind mounts and verify persistence, backup, and restore before trial release |
| No proposal view history | Limited investigation for read access | Accept per ADR-0007 for v1; reconsider if data sensitivity increases |
| Manual operational deletion | Human procedure may be missed | Document and verify retention and deletion procedure before trial operation |

## 20. Design Reviewer Status

Initial Design Reviewer review found auto-fixable issues and human-decision findings. Auto-fixable issues were reflected in the earlier revision.

The 2026-05-08 human decisions resolved the previously listed phase-blocking human-decision findings. The Design Reviewer recheck is recorded in `docs/design/basic-design-v1-review.md`.

This design artifact is conditionally approved as an input to v1 roadmap and implementation request creation after this revision and Design Reviewer recheck. It is not release approval, residual risk acceptance, or final completion judgment.
