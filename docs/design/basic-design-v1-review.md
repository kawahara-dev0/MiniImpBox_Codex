# Mini Improvement Box v1 Basic Design Review

## Review Information

- Reviewed artifact: `docs/design/basic-design-v1.md`
- Reviewer role: Design Reviewer
- Workflow: `docs/ai-development/workflows/DESIGN_WORKFLOW.md`
- Review date: 2026-05-08
- Review basis:
  - `AGENTS.md`
  - `docs/ai-development/policies/AI_RULES.md`
  - `docs/ai-development/policies/AI_DEVELOPMENT_POLICY.md`
  - `docs/ai-development/policies/REVIEW_POLICY.md`
  - `docs/ai-development/policies/SECURITY_POLICY.md`
  - `docs/ai-development/policies/TEST_POLICY.md`
  - `docs/ai-development/checklists/BASIC_DESIGN_CHECKLIST.md`
  - `docs/requirements/requirements-v1.md`
  - Accepted ADRs under `docs/adr/`

## Initial Review Result

## Overall judgment

Needs revision due to auto-fixable documentation gaps and human-decision findings.

## What the Designer did well

- Reflected Accepted ADR decisions as approved architectural constraints.
- Kept implementation out of scope.
- Identified security-sensitive boundaries for administrator authentication, authorization, proposal content, optional submitter information, audit logs, and backups.
- Defined a small design-level implementation split without turning it into implementation work.

## Auto-fixable findings

1. The initial draft needed a clearer list of checked source documents.
2. The initial draft needed explicit test case CSV ownership units under `docs/tests/`.
3. The initial draft needed clearer separation between Accepted ADR decisions and proposed design refinements.
4. The initial draft needed a clearer statement that dependent implementation must not start while phase-blocking human decisions remain unresolved.

## Human-decision findings

1. Requirement approval is still required because the source requirements document is explicitly a draft.
2. Basic design approval is required before the design can be used as the basis for implementation.
3. Proposed validation constraints for `title`, `body`, `submitter_name`, and `submitter_contact` require human approval before implementation because they affect accepted user behavior and schema/validation design.
4. The decision to restrict `submitter_contact` to email format requires human approval before implementation because it changes accepted input behavior.
5. Administrator account lifecycle details require human approval before implementation: initial admin creation, disabling, rotation, and password reset or recovery.
6. Conflict UI behavior requires human approval before implementation: safe conflict wording and whether the latest proposal state reloads automatically.
7. Backup and retention operational details require human approval before trial operation: exact backup generation count, backup storage location, encryption requirement for the target environment, trial end date definition, post-retention deletion, and restore procedure.

## Missing or excessive artifacts

- No excessive implementation artifact was created.
- A development roadmap is recommended before implementation because v1 spans UI, authentication, authorization, database, audit, and operations.

## Policy issues revealed

- No ADR conflict was found.
- No security policy violation was found in the design draft.
- The draft correctly treats unresolved security, personal data, and operational details as human-decision items instead of accepting risk automatically.

## Recommended next action

Stop the workflow for human decisions before dependent implementation starts. The Designer may revise auto-fixable findings only.

## Auto-Fix Revision

The Designer revised `docs/design/basic-design-v1.md` to address all auto-fixable findings:

- Added a complete source document list.
- Added expected test case CSV ownership units.
- Clarified human-approved decisions from Accepted ADRs and proposed design refinements.
- Added an explicit stop statement for dependent implementation while phase-blocking human decisions remain unresolved.

## Final Review Result After Auto-Fix

## Overall judgment

Acceptable with concerns for human review. The artifact is usable as a basic design draft, but the workflow must stop before implementation because human-decision findings remain.

## What the Designer did well

- The revised draft clearly separates human-approved decisions, proposed refinements, assumptions, and human decisions required.
- Accepted ADRs are followed and referenced.
- Security, authorization, personal data, audit, retention, deletion, backup, and operational risks are visible.
- Human verification gates are classified as phase-blocking, non-blocking, and release-blocking.
- Test-first targets and expected test case CSV ownership are identified.

## Auto-fixable findings

- None remaining.

## Human-decision findings

The following remain unresolved and must not be auto-fixed by AI:

1. Human approval of the requirements draft as a basis for implementation.
2. Human approval of the basic design draft.
3. Human approval of proposed input constraints for `title`, `body`, `submitter_name`, and `submitter_contact`.
4. Human approval that `submitter_contact` is limited to email format in v1.
5. Human approval of administrator account lifecycle details: initial admin creation, disabling, rotation, and password reset or recovery.
6. Human approval of optimistic-lock conflict UI behavior: exact safe wording and latest-state reload behavior.
7. Human approval of exact backup generation count within the accepted 7 to 14 range.
8. Human approval of backup storage location and whether backup encryption is mandatory in the target trial environment.
9. Human approval of trial end date definition and how it is recorded.
10. Human approval of post-retention deletion and restore procedures.

## Missing or excessive artifacts

- Missing before implementation: human-approved development roadmap or implementation request split.
- No implementation files, code, tests, or schema were created.

## Policy issues revealed

- The source requirements document still contains outdated ADR notes saying no ADRs existed at the time of its creation. This does not block this design draft because Accepted ADRs now exist and were used, but the requirements draft should be updated or reviewed by humans to avoid stale guidance.
- The basic design cannot be treated as approved by AI review.

## Recommended next action

Human review should decide the listed human-decision findings. After those decisions are recorded, create or review a development roadmap and then prepare small implementation requests.

Workflow status: stopped for human decision findings.

## Re-Review After Human Decisions

## Overall judgment

Acceptable for human-approved design input. The previously listed phase-blocking human-decision findings were resolved by the 2026-05-08 human decisions and reflected in `docs/requirements/requirements-v1.md` and `docs/design/basic-design-v1.md`.

This does not mean release approval, residual security risk acceptance, or final completion.

## What the Designer did well

- Reflected Accepted ADRs into the requirements draft and removed stale "ADR not found" guidance.
- Reflected the approved validation constraints:
  - `title`: 1 to 100 characters
  - `body`: 1 to 2000 characters
  - `submitter_name`: 0 to 100 characters
  - `submitter_contact`: 0 to 254 characters and email format when provided
- Reflected administrator account lifecycle decisions without adding v1 UI features outside scope.
- Reflected optimistic-lock conflict wording and latest-state reload behavior.
- Reflected backup generation count, storage boundary, encryption requirement, trial end date definition, post-retention deletion, and restore verification requirements.
- Preserved the distinction between design approval, implementation planning, manual verification, and release approval.

## Auto-fixable findings

- None remaining.

## Human-decision findings

- None remaining that block using the requirements draft and basic design draft as inputs for roadmap and implementation request creation.

Resolved human-decision findings:

1. Requirements specification is conditionally approved as a v1 implementation input after Accepted ADR reflection.
2. Basic design is conditionally approved after the detailed 2026-05-08 human decisions are reflected and Design Reviewer recheck is performed.
3. Input constraints are approved.
4. `submitter_contact` email-format limitation is approved.
5. Administrator account lifecycle direction is approved for v1.
6. Optimistic-lock conflict wording and latest-state reload behavior are approved.
7. Backup generation count is approved as 14 generations.
8. Backup storage boundary and trial encryption requirement are approved.
9. Trial end date definition and operations record direction are approved.
10. Post-retention deletion and restore procedure requirements are approved.

## Missing or excessive artifacts

- No implementation files, code, tests, or schema were created.
- Before implementation, a development roadmap or implementation request split is still recommended because v1 spans UI, authentication, authorization, database, audit, and operations.
- An operations record file such as `docs/operations/trial-operation-record.md` should be created when trial operation details are recorded. It does not need to be created before trial end details exist, but the procedure should be prepared before trial start.

## Policy issues revealed

- No ADR conflict was found.
- No security policy violation was found in the revised design.
- The remaining release-blocking items are verification and risk-acceptance responsibilities, not unresolved design decisions.

## Recommended next action

Create or review a development roadmap, then prepare small implementation requests. Each implementation request should identify required tests, test case CSV updates, manual verification steps, and whether a separate Tester is recommended.

Workflow status: no auto-fixable findings remain and no unresolved human-decision findings block roadmap or implementation request creation.

## Human Approval Record for Docker Compose Design

- Approval date: 2026-05-09
- Approved scope: Docker Compose related design updates for v1 development and trial verification environment.
- Approved artifacts:
  - `docs/adr/0008-docker-compose-development-and-trial-verification-environment.md`
  - Docker-related updates in `docs/requirements/requirements-v1.md`
  - Docker-related updates in `docs/design/basic-design-v1.md`
  - Docker-related updates in `docs/design/roadmap-v1.md`
- Approval boundary: This approval covers the Docker Compose design direction as implementation planning input. It does not approve implementation results, production deployment, release readiness, residual risk acceptance, or final completion judgment.

## Re-Review After Docker Compose Environment Decision

## Overall judgment

Acceptable for implementation planning input. The revised basic design reflects the human-approved decision to use Docker Compose as the standard development and trial verification environment for v1.

This does not mean production deployment approval, release approval, residual risk acceptance, or final completion judgment.

## What the Designer did well

- Added ADR-0008 to record the Docker Compose environment decision instead of hiding the decision inside implementation details.
- Reflected the decision in the basic design as an environment and operational constraint.
- Preserved the accepted Next.js, Node.js, SQLite, Prisma, Better Auth, retention, backup, and audit decisions.
- Clarified that the SQLite database and backup files must use explicit persistent volumes or host bind mounts.
- Kept Docker Compose separate from production release approval.

## Auto-fixable findings

- Initial re-review found one traceability gap: Docker Compose startup and persistent storage verification was reflected in the roadmap but not explicitly carried into the basic design human verification gate section.
- The Designer revised `docs/design/basic-design-v1.md` to classify that implementation-time verification as phase-blocking before dependent database, backup, or feature implementation.
- None remaining after auto-fix.

## Human-decision findings

- None remaining that block using the basic design as an input for roadmap and implementation request creation.

The Docker Compose environment decision is treated as human-approved for v1 because the user explicitly instructed the Designer to update related documents with that policy.

## Missing or excessive artifacts

- No implementation files, Dockerfile, Compose file, code, tests, schemas, database files, backup files, or operation records were created.
- The actual Dockerfile and Compose configuration should be created during the Step 1 implementation request, not in this design revision.

## Policy issues revealed

- No ADR conflict was found.
- No security policy violation was found.
- File persistence, host permissions, backup encryption, restore verification, and release risk acceptance remain verification responsibilities.

## Recommended next action

Update or review the roadmap to include Docker Compose startup and persistent storage verification in Step 1, then prepare the Step 1 implementation request.

Workflow status: no auto-fixable findings remain and no unresolved human-decision findings block roadmap or implementation request creation.

## Re-Review After Approval Scope Clarification

## Overall judgment

Acceptable for implementation planning input. The revised requirements and basic design now clearly state that the conditional approval scope is limited to v1 roadmap and implementation request creation.

## What the Designer did well

- Clarified that conditional approval is for implementation planning input, not release approval.
- Preserved that residual risk acceptance, release approval, and final completion judgment remain human responsibilities.
- Separated release-stage verification from requirements/basic-design approval for implementation planning.
- Removed stale wording that made approved optimistic locking appear undecided.
- Updated the basic design status to `Conditionally approved as implementation planning input`.
- Reframed administrator credential lifecycle risk as an implementation and operations verification risk, rather than an unresolved pre-implementation design definition.

## Auto-fixable findings

- None remaining.

## Human-decision findings

- None remaining that block roadmap or implementation request creation.

## Missing or excessive artifacts

- No implementation files, code, tests, schemas, or operational record files were created.
- A roadmap or implementation request split is still the recommended next design artifact before implementation work.

## Policy issues revealed

- No ADR conflict was found.
- No security policy violation was found in the revised wording.
- Release approval, residual risk acceptance, and final completion judgment remain explicitly outside AI approval scope.

## Recommended next action

Create or review a development roadmap, then prepare small implementation requests. Keep release-stage verification and residual risk acceptance as human gates.

Workflow status: no auto-fixable findings remain and no unresolved human-decision findings block roadmap or implementation request creation.
