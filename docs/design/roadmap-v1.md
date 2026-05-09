# Mini Improvement Box v1 Development Roadmap

## 1. Document Information

- Document type: Development roadmap
- Target: Mini Improvement Box v1
- Status: Approved as implementation planning input
- Created date: 2026-05-09
- Last updated: 2026-05-09
- Author: AI-assisted Designer
- Workflow: `docs/ai-development/workflows/DESIGN_WORKFLOW.md`

This roadmap is approved as an implementation planning input. It does not approve implementation results, release readiness, residual risk, or final completion.

## 2. Source Documents Checked

- `AGENTS.md`
- `docs/ai-development/workflows/DESIGN_WORKFLOW.md`
- `docs/ai-development/policies/AI_RULES.md`
- `docs/ai-development/policies/AI_DEVELOPMENT_POLICY.md`
- `docs/ai-development/policies/REVIEW_POLICY.md`
- `docs/ai-development/policies/SECURITY_POLICY.md`
- `docs/ai-development/policies/TEST_POLICY.md`
- `docs/requirements/requirements-v1.md`
- `docs/design/basic-design-v1.md`
- `docs/design/basic-design-v1-review.md`
- Accepted ADRs under `docs/adr/`

## 3. Approval Scope and Constraints

The requirements and basic design are conditionally approved as input to v1 roadmap and implementation request creation.

This approval scope does not include:

- implementation acceptance
- release approval
- residual risk acceptance
- final completion judgment

Implementation requests created from this roadmap must remain within the accepted scope:

- Next.js App Router, TypeScript, React
- SQLite, Prisma, server-side Data Access Layer
- Docker Compose as the standard development and trial verification environment
- Better Auth email/password for administrator authentication
- single `admin` role with server-side authorization
- unauthenticated proposal submission
- optional `submitter_name` and `submitter_contact`
- optimistic locking with proposal `version`
- status change history as the audit record for status changes
- administrator login success and failure logs
- no proposal deletion screens or APIs
- no file uploads, notifications, external integrations, AI features, public API, or production release work

## 4. Roadmap Overview

| Step | Name | Goal | Dependency |
|---:|---|---|---|
| 1 | Project foundation | Establish the Next.js/TypeScript/Prisma/Better Auth project base | None |
| 2 | Data model and Data Access Layer | Define schema, validation constants, DTOs, and core DAL boundaries | Step 1 |
| 3 | Administrator authentication foundation | Configure Better Auth and initial admin creation path | Steps 1-2 |
| 4 | Public proposal submission | Implement unauthenticated proposal creation | Steps 1-2 |
| 5 | Administrator authorization and proposal reads | Implement admin-only list/detail/status history reads | Steps 2-3 |
| 6 | Status change workflow | Implement optimistic locking and status change history transaction | Steps 2-5 |
| 7 | Audit and operational procedures | Implement login audit logging and draft operational runbooks | Steps 3-6 |
| 8 | Integrated verification and trial readiness review | Run full checks, complete test case CSVs, and prepare release-blocking verification | Steps 1-7 |

Each step should be implemented as a separate implementation request or a small group of tightly related requests.

Commits, pushes, and pull requests are reviewable save points. They do not mean implementation acceptance, residual risk acceptance, release approval, or final completion. When a phase-blocking verification item remains open, reviewed intermediate work may still be committed or pushed, but dependent roadmap steps must not proceed until the phase-blocking verification result is recorded.

## 5. Step Details

### Step 1. Project Foundation

Goal:

- Create the basic application skeleton and developer workflow without implementing business features.

Deliverables:

- Next.js App Router + TypeScript + React project structure.
- Dockerfile and Docker Compose configuration for standard development and trial verification startup.
- Baseline lint, type check, and test command configuration.
- Prisma and Better Auth dependencies configured, but business schema and auth behavior may be minimal.
- Environment variable documentation with safe placeholders only.
- Documented persistent database and backup paths using explicit volumes or host bind mounts.

Affected areas:

- project root
- application routing structure
- package/build configuration
- Dockerfile and Compose configuration
- developer documentation

Required tests or checks:

- Type check.
- Lint.
- Baseline test command or smoke test.
- Dependency install/build verification.
- Docker Compose startup verification.

Test case CSV:

- Not required in this step if no feature behavior is implemented.

Manual verification:

- Start the app through Docker Compose.
- Confirm the initial route renders without exposing debug or secret information.
- Confirm required environment variables are documented with safe placeholders.
- Confirm the configured SQLite and backup paths are persistent volumes or host bind mounts, not ephemeral-only container paths.

Expected review unit:

- One foundation implementation request, normally one reviewable PR or equivalent save point.

Dependencies:

- None.

Builder / Reviewer / Tester:

- Builder required.
- Independent Reviewer required.
- Separate Tester not required for this step unless setup becomes security-sensitive.

Human verification gate:

- Non-blocking: local setup usability.
- Phase-blocking before dependent database, backup, or feature steps: Docker Compose startup and persistent storage path design, because later database, backup, and restore work depend on these paths. This does not by itself block committing or pushing a reviewed Step 1 save point.

Proceed condition:

- Baseline commands are defined and pass, or skipped checks are explicitly justified.

Stop or escalation conditions:

- Required stack cannot be installed or run.
- Dependency choices diverge from accepted ADRs.
- Secrets or real credentials are introduced.
- Docker Compose cannot preserve database or backup files through the documented persistent storage design.

### Step 2. Data Model and Data Access Layer

Goal:

- Define approved database schema, Prisma migration path, validation constants, DTO boundaries, and DAL shape.

Deliverables:

- Prisma schema for proposals, status change history, administrator login audit logs, and Better Auth-owned data integration.
- Validation constants for title/body/submitter fields and status values.
- Server-side DAL functions or interfaces for proposal creation, admin reads, status changes, and audit log writes.
- DTO definitions for administrator list/detail responses.

Affected areas:

- Prisma schema and migrations.
- server-side data access modules.
- validation and domain constants.
- persistent SQLite database path used by the Docker Compose environment.

Required tests or checks:

- Type check.
- Lint.
- Unit tests for validation constants and status validation.
- DAL tests where practical for create/read boundaries using fake test data.

Test case CSV:

- Create or update `docs/tests/proposal_submission_test_cases.csv`.
- Create or update `docs/tests/admin_access_test_cases.csv`.
- Create or update `docs/tests/status_change_test_cases.csv`.
- Create or update `docs/tests/audit_and_operations_test_cases.csv` with planned cases where behavior is not implemented yet.

Human verification evidence:

- Review Builder, independent Reviewer, and Tester or test adequacy evidence for schema, validation constants, DAL boundaries, DTO boundaries, and sensitive field handling.
- Confirm evidence states that no proposal deletion table behavior, screen/API contract, or logical delete field was introduced as an application feature.
- Confirm evidence states that the Prisma SQLite URL targets the approved persistent database path in the Docker Compose environment.
- Inspect schema, migration, or DAL source selectively if evidence is missing, checks fail, review findings remain unresolved, or ADR/security/data concerns are raised.

Expected review unit:

- One data foundation implementation request, normally one reviewable PR or equivalent save point.

Dependencies:

- Step 1.

Builder / Reviewer / Tester:

- Builder required.
- Independent Reviewer required.
- Separate Tester recommended because this step defines data consistency, sensitive data fields, and audit-related schema.

Human verification gate:

- Phase-blocking before dependent feature steps: schema and DAL boundary review, because later steps depend on these contracts. This does not by itself block committing or pushing a reviewed Step 2 save point.

Proceed condition:

- Schema, validation constants, and DAL boundaries align with requirements, basic design, and ADR-0002/0004/0005/0007.

Stop or escalation conditions:

- Schema requires a new deletion policy.
- DAL exposes raw sensitive records unnecessarily.
- Migration approach conflicts with SQLite/Prisma ADR.

### Step 3. Administrator Authentication Foundation

Goal:

- Implement administrator authentication, initial admin creation, and server-side admin authorization foundation.

Deliverables:

- Better Auth email/password setup.
- Initial `admin` creation by seed or administrative script.
- Server-side admin authorization helper.
- Account disabling support through the approved flag or Better Auth-side procedure.
- Safe operational notes for admin creation, disabling, rotation, and password recovery.

Affected areas:

- authentication configuration.
- server-side authorization helper.
- seed or administrative scripts.
- operations documentation.

Required tests or checks:

- Type check.
- Lint.
- Authentication and authorization tests:
  - unauthenticated user rejected from admin boundary
  - authenticated non-admin or missing-role user rejected where feasible
  - admin user accepted
- Script test or dry-run verification that no password, hash, session data, or secret is printed.

Test case CSV:

- Update `docs/tests/admin_access_test_cases.csv`.
- Update `docs/tests/audit_and_operations_test_cases.csv` for admin creation and account lifecycle procedure checks.

Manual verification:

- Create one initial admin using seed or script in a local test environment.
- Confirm public self-registration is unavailable.
- Confirm admin-only boundary cannot be reached without admin authentication.

Expected review unit:

- One security-sensitive implementation request, normally one reviewable PR or equivalent save point.

Dependencies:

- Steps 1-2.

Builder / Reviewer / Tester:

- Builder required.
- Independent Reviewer required.
- Separate Tester recommended because authentication and authorization are security-sensitive.

Human verification gate:

- Phase-blocking before administrator feature steps: admin auth and server-side authorization boundary must be verified. This does not by itself block committing or pushing a reviewed Step 3 save point.

Proceed condition:

- Admin authorization helper exists and is used by later admin work.
- Tests cover unauthenticated and unauthorized cases.

Stop or escalation conditions:

- Better Auth cannot support required account lifecycle safely.
- Password reset or account disabling requires a new public UI or architecture decision.
- Auth logs or scripts expose secrets.

### Step 4. Public Proposal Submission

Goal:

- Implement public unauthenticated proposal submission with approved validation and safe output handling.

Deliverables:

- Public proposal form.
- Server-side proposal creation path through the DAL.
- Validation for `title`, `body`, `submitter_name`, and `submitter_contact`.
- Safe success and validation error responses.
- Safe rendering of user-entered proposal content.

Affected areas:

- public routes.
- proposal creation server action or route handler.
- validation modules.
- DAL create function.

Required tests or checks:

- Type check.
- Lint.
- Unit or integration tests for:
  - successful submission
  - submission without optional submitter data
  - submission with optional submitter data
  - required field failure
  - length limits
  - invalid email format
  - HTML-like body output safety

Test case CSV:

- Update `docs/tests/proposal_submission_test_cases.csv`.

Manual verification:

- Submit a proposal without authentication.
- Submit with blank optional fields.
- Submit with optional contact email.
- Confirm internal IDs and admin metadata are not shown to the submitter.
- Confirm HTML-like body text is not executed.

Expected review unit:

- One proposal submission implementation request, normally one reviewable PR or equivalent save point.

Dependencies:

- Steps 1-2.

Builder / Reviewer / Tester:

- Builder required.
- Independent Reviewer required.
- Separate Tester optional but recommended if UI validation is complex.

Human verification gate:

- Non-blocking for later admin implementation, but release-blocking for trial release.

Proceed condition:

- Proposal records are created with status `new`.
- Sensitive data is not logged.
- Test case CSV is updated.

Stop or escalation conditions:

- New fields or changed validation limits are needed.
- Submission requires authentication.
- Proposal content is rendered as trusted HTML.

### Step 5. Administrator Authorization and Proposal Reads

Goal:

- Implement administrator-only proposal list, detail, and status history read screens.

Deliverables:

- Admin proposal list route.
- Admin proposal detail route.
- Server-side authorization applied to all admin reads.
- DTOs for list and detail views.
- Pagination or maximum result limit.
- Status history display for administrators.

Affected areas:

- admin routes and components.
- authorization helper usage.
- DAL read functions.
- DTO mapping.

Required tests or checks:

- Type check.
- Lint.
- Tests for:
  - unauthenticated access rejected
  - unauthorized access rejected where feasible
  - admin list access allowed
  - admin detail access allowed
  - nonexistent proposal safe not-found behavior
  - sensitive fields not returned to non-admin paths

Test case CSV:

- Update `docs/tests/admin_access_test_cases.csv`.

Manual verification:

- Open admin list as admin.
- Open admin detail as admin.
- Attempt admin routes while unauthenticated.
- Confirm optional submitter information appears only on administrator screens.
- Confirm full proposal body is not written to logs.

Expected review unit:

- One administrator read implementation request, normally one reviewable PR or equivalent save point.

Dependencies:

- Steps 2-4 for proposal data.
- Step 3 for authorization.

Builder / Reviewer / Tester:

- Builder required.
- Independent Reviewer required.
- Separate Tester recommended because this step handles sensitive data visibility.

Human verification gate:

- Phase-blocking before status change implementation: admin read and authorization boundaries must be stable. This does not by itself block committing or pushing a reviewed Step 5 save point.

Proceed condition:

- Server-side authorization is consistently applied.
- Admin DTOs expose only approved fields.

Stop or escalation conditions:

- Admin data is exposed through public routes or client-only checks.
- Proposal view audit logging becomes newly required.
- Pagination/result limit cannot be implemented within current design.

### Step 6. Status Change Workflow

Goal:

- Implement administrator-only status changes with optimistic locking and transactional status change history.

Deliverables:

- Status change server action or route handler.
- Status validation.
- Optimistic locking using proposal `version`.
- Transactional status update and status change history creation.
- Approved safe conflict message.
- Latest-state refresh after conflict without automatic retry.

Affected areas:

- admin detail screen.
- status change server action or route handler.
- DAL transaction function.
- status history write function.

Required tests or checks:

- Type check.
- Lint.
- Tests for:
  - valid status change succeeds
  - invalid status rejected
  - unauthenticated and unauthorized status changes rejected
  - nonexistent proposal safe error
  - stale version conflict
  - no successful history record on stale conflict
  - successful status change creates history in same transaction
  - version increments on success

Test case CSV:

- Update `docs/tests/status_change_test_cases.csv`.
- Update `docs/tests/admin_access_test_cases.csv` for permission behavior.

Manual verification:

- Change a proposal status as admin.
- Confirm history is created.
- Simulate stale version from two admin views and confirm approved conflict message.
- Confirm latest state is reflected after conflict and the original change is not automatically retried.

Expected review unit:

- One status workflow implementation request, normally one reviewable PR or equivalent save point.

Dependencies:

- Steps 2, 3, and 5.

Builder / Reviewer / Tester:

- Builder required.
- Independent Reviewer required.
- Separate Tester recommended because this step is data-consistency and audit sensitive.

Human verification gate:

- Release-blocking: manual status flow and conflict verification.

Proceed condition:

- Status change transaction and stale conflict behavior pass tests.
- Status history is reliable and safe.

Stop or escalation conditions:

- Transaction cannot ensure status/history consistency.
- Optimistic locking cannot be implemented with the selected DAL approach.
- New status values or workflow rules are requested.

### Step 7. Audit and Operational Procedures

Goal:

- Implement administrator login audit logs and prepare operational procedures for trial readiness.

Deliverables:

- Administrator login success and failure log creation.
- Safe login failure reason categories.
- Request ID generation/propagation for audit events.
- Operations documentation for:
  - initial admin creation
  - admin disabling
  - admin rotation
  - password recovery
  - backup location and access control
  - backup encryption
  - restore procedure
  - trial end record
  - post-retention deletion

Affected areas:

- auth integration.
- audit log DAL.
- logging/request ID utilities.
- operations documentation under `docs/operations/` if created.

Required tests or checks:

- Type check.
- Lint.
- Tests for:
  - login success audit log
  - login failure audit log
  - audit logs exclude passwords/session/proposal content/submitter information
  - request ID presence
- Documentation review for operational procedures.

Test case CSV:

- Update `docs/tests/audit_and_operations_test_cases.csv`.

Manual verification:

- Perform successful admin login and verify safe audit record.
- Perform failed admin login and verify safe audit record.
- Execute or dry-run backup and restore procedure in a local trial-like environment.
- Confirm backup is outside public app directory and encrypted.
- Confirm backup and restore operate against the documented Docker Compose persistent database and backup paths.

Expected review unit:

- One audit and operations implementation request, normally one reviewable PR or equivalent save point. Split into audit logging and operations documentation PRs if review size grows.

Dependencies:

- Steps 2-3 for auth and audit schema.
- Step 6 for status history context.

Builder / Reviewer / Tester:

- Builder required.
- Independent Reviewer required.
- Separate Tester recommended because audit logging and operational recovery are security-sensitive and release-critical.

Human verification gate:

- Release-blocking: backup, restore, retention, deletion, and residual operational risk acceptance.

Proceed condition:

- Login audit behavior and operational procedures are documented and testable.

Stop or escalation conditions:

- Logs expose secrets or sensitive proposal data.
- Backup encryption cannot be provided in the trial environment.
- Restore cannot be manually verified before trial start.

### Step 8. Integrated Verification and Trial Readiness Review

Goal:

- Verify the implemented v1 behavior against requirements, basic design, ADRs, test policy, and security policy before trial release consideration.

Deliverables:

- All relevant automated checks run and reported.
- Feature test case CSVs updated with execution status.
- Coverage result CSV updated if coverage is measured.
- Manual verification checklist executed or prepared for human execution.
- Known residual risks listed for human acceptance.
- Implementation review result prepared.

Affected areas:

- all implemented v1 feature areas.
- `docs/tests/` CSVs.
- optional `docs/tests/coverage_result.csv`.
- release/trial verification notes if created.

Required tests or checks:

- Type check.
- Lint.
- Existing tests.
- New unit/integration/E2E tests added in prior steps.
- Security-sensitive negative tests.
- Manual verification procedure review.

Test case CSV:

- Finalize:
  - `docs/tests/proposal_submission_test_cases.csv`
  - `docs/tests/admin_access_test_cases.csv`
  - `docs/tests/status_change_test_cases.csv`
  - `docs/tests/audit_and_operations_test_cases.csv`
- Update `docs/tests/coverage_result.csv` if coverage is measured.

Manual verification:

- Proposal submission flow.
- Administrator login.
- Administrator list/detail.
- Unauthorized admin access rejection.
- Status change and history creation.
- Stale conflict handling.
- Safe errors and log review.
- Backup and restore.
- Trial end record and post-retention deletion procedure review.

Expected review unit:

- One verification-focused implementation/review request after feature work, normally one reviewable PR or equivalent save point if fixes or test artifacts change.

Dependencies:

- Steps 1-7.

Builder / Reviewer / Tester:

- Builder required for final fixes and reporting.
- Independent Reviewer required.
- Separate Tester recommended because this step is release-critical and security-sensitive.

Human verification gate:

- Release-blocking: all manual verification and residual risk acceptance before trial release.

Proceed condition:

- This step does not approve release. It prepares evidence for human release decision.

Stop or escalation conditions:

- Required security checks fail.
- Authorization, audit, backup, or data consistency behavior is unverified.
- Manual verification reveals requirement or design gaps.

## 6. Cross-Step Test Case CSV Plan

| CSV file | Created or updated by | Purpose |
|---|---|---|
| `docs/tests/proposal_submission_test_cases.csv` | Steps 2, 4, 8 | Public submission validation and safe output behavior |
| `docs/tests/admin_access_test_cases.csv` | Steps 2, 3, 5, 6, 8 | Authentication, authorization, admin read boundaries |
| `docs/tests/status_change_test_cases.csv` | Steps 2, 6, 8 | Status transitions, optimistic locking, history creation |
| `docs/tests/audit_and_operations_test_cases.csv` | Steps 2, 3, 7, 8 | Login audit logs, admin lifecycle, backup, restore, retention, deletion |
| `docs/tests/coverage_result.csv` | Step 8 if measured | Coverage by critical file, module, or function |

## 7. Human Verification Gate Summary

Human verification for this roadmap may be evidence-based. Human reviewers may rely on Builder reports, independent Reviewer results, Tester or test adequacy review, automated check results, test case CSV updates, and concrete manual behavior checks. Humans should inspect source code selectively when evidence is missing, checks fail, review findings remain unresolved, security/data/ADR concerns are raised, or a phase-blocking or release-blocking decision depends on implementation details.

Phase-blocking items block the next dependent roadmap step. They do not automatically block commit, push, or PR creation for the current reviewed save point. Non-blocking items do not block dependent implementation but must remain recorded. Release-blocking items may remain pending during continued implementation, but block trial release, release readiness claims, residual risk acceptance, and release decisions.

### Phase-blocking

- Step 1 Docker Compose startup and persistent storage path design before dependent database, backup, or feature implementation.
- Step 2 schema and DAL boundary review before dependent feature implementation.
- Step 3 administrator authentication and server-side authorization boundary verification before administrator features.
- Step 5 administrator read and authorization boundary verification before status change implementation.

### Non-blocking

- Local setup usability feedback from Step 1.
- Minor UI wording and labels, as long as approved meaning is preserved.
- Proposal list column order and minor display refinements.

### Release-blocking

- Main proposal submission flow manual verification.
- Administrator login and permission manual verification.
- Status change and status history manual verification.
- Optimistic-lock conflict manual verification.
- Safe error and log review for sensitive data exposure.
- Backup, restore, retention, post-retention deletion procedure verification.
- Docker Compose persistent database and backup path verification in the target trial verification environment.
- Human acceptance of residual security, personal information, and operational risks.
- Human release decision.

## 8. ADR Notes

Accepted ADRs checked:

- ADR-0001: Application Runtime and Web Framework
- ADR-0002: Database, ORM, and Data Access Policy
- ADR-0003: Authentication and Authorization Model
- ADR-0004: Concurrent Status Update Handling
- ADR-0005: Optional Submitter Information and Personal Data Handling
- ADR-0006: Retention, Deletion, and Backup Policy
- ADR-0007: Audit Log Policy
- ADR-0008: Docker Compose Development and Trial Verification Environment

No ADR conflict is identified in this roadmap document.

New ADR recommendation:

- No new ADR is required for this roadmap if implementation remains within v1 scope.
- A new ADR should be considered if implementation introduces production deployment, new roles, deletion features, public APIs, external integrations, AI features, proposal view audit logging, or a different database/authentication/runtime decision.
- Docker Compose is already accepted for development and trial verification. A new ADR should still be considered before treating the container setup as production deployment.

## 9. Assumptions

- The repository currently contains design documents but no application implementation was assumed.
- Implementation requests will be created after this roadmap is reviewed.
- Test framework selection can be handled in Step 1 within the accepted Next.js/TypeScript stack, without introducing a major architecture decision.
- Docker Compose setup can be handled in Step 1 within ADR-0008, without treating it as production deployment.
- Operational scripts and documents may be split into smaller requests if they become too large for one review unit.

## 10. Remaining Risks

| Risk | Impact | Planned response |
|---|---|---|
| Authentication and authorization defects | Administrator data or operations could be exposed | Use phase-blocking auth boundary verification and separate Tester recommendation |
| Sensitive proposal data exposure | Proposal body or submitter data could leak through UI, logs, tests, or backups | Enforce DTOs, log suppression, fake test data, and security review in relevant steps |
| Data consistency failure | Status update and history could diverge | Require transaction tests, optimistic-lock tests, and manual conflict verification |
| Operational backup/restore gaps | Trial data recovery or deletion could fail | Create and manually verify operational procedures before trial release |
| Docker persistent storage misconfiguration | Database or backups could be lost during container recreation | Verify explicit volumes or host bind mounts in Step 1 and backup/restore behavior in Steps 7 and 8 |
| Roadmap drift | Implementation may reveal new constraints | Stop and update roadmap or ADR when major decisions emerge |

## 11. Recommended Next Action

Continue with the next approved roadmap step only after any phase-blocking verification required by the preceding dependent step has been completed and recorded. For each implementation unit, use a focused commit, push, or PR as a reviewable save point, and carry forward unresolved non-blocking and release-blocking verification items in the implementation report or PR description.
