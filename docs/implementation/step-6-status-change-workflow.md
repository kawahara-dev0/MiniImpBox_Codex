# Step 6 Status Change Workflow Implementation Record

## Related Scope

- Roadmap: `docs/design/roadmap-v1.md` Step 6. Status Change Workflow
- Request source: Human instruction on 2026-05-10 to implement roadmap Step 6 using `policy-driven-implementation`
- Scope: administrator-only proposal status changes with status validation, optimistic locking by proposal `version`, transactional status history, safe conflict handling, latest-state refresh after conflict, tests, CSV updates, review evidence, Tester evidence, commit, and push gate handling.

Out of scope:

- New status values or new workflow restrictions.
- Proposal deletion, retention operations, or backup/restore implementation.
- New authentication or authorization model.
- Release approval, residual risk acceptance, or final completion judgment.

## Builder Summary

Implemented Step 6 as the Builder.

Changes:

- Added `src/lib/admin/proposal-status.ts` as the centralized server-side status change boundary. It checks the current administrator before DAL access, validates status and expected version, maps safe not-found and conflict results, and uses the ADR-approved conflict message.
- Added `src/app/admin/proposals/[id]/status-actions.ts` as the server action used by the admin detail form. It revalidates and redirects after success or conflict so the detail page reloads the latest proposal state without automatic retry.
- Updated `src/app/admin/proposals/[id]/page.tsx` to render the status form, success/error messages, and the ADR-approved conflict message.
- Updated `src/app/admin/proposals/page.tsx` to show a safe missing-proposal message after a not-found status change attempt.
- Updated `src/app/globals.css` for the status form controls.
- Added `src/lib/admin/proposal-status.test.ts` for admin authorization, disabled admin rejection, invalid status, invalid expected version, success, missing proposal, and conflict behavior.
- Added `src/app/admin/proposals/[id]/status-actions.test.ts` for server-action redirect and revalidation mapping.
- Updated `src/lib/dal/proposal.test.ts` with a safe not-found status change test.
- Updated `docs/tests/status_change_test_cases.csv`, `docs/tests/admin_access_test_cases.csv`, and `docs/tests/coverage_result.csv`.

## Checks Run

Local checks:

- `npm test`: Pass, 9 test files / 41 tests.
- `npm run typecheck`: Pass.
- `npm run lint`: Pass.
- `npm run prisma:validate`: Pass.
- `npm run build`: Pass.
- `docker compose config --quiet`: Pass.

CI:

- GitHub Actions CI is configured in `.github/workflows/ci.yml`.
- CI has not run on the current working tree before commit/push.
- CI result must be checked after push or PR creation.

## Test Case CSV and Coverage CSV Status

- `docs/tests/status_change_test_cases.csv`: Updated for Step 6 automated and manual status workflow cases.
- `docs/tests/admin_access_test_cases.csv`: Updated for Step 6 status-change authorization cases.
- `docs/tests/coverage_result.csv`: Created. Percentage coverage is recorded as not measured; critical-path verification is recorded with remaining risks.

## Implementation Reviewer Evidence

Reviewer: Separate AI Implementation Reviewer agent.

Latest outcome:

- Accepted for Human Verification after this implementation record is added.
- No remaining code or automated test blockers.
- Required process fix before commit/push: add this Step 6 implementation record and record Tester evidence.

Reviewer test adequacy result:

- Adequate for Step 6 pre-human-verification.
- Verified local checks: `npm test`, `npm run typecheck`, `npm run lint`, `npm run prisma:validate`, `docker compose config --quiet`, and `npm run build`.
- Verified CSV updates in `docs/tests/status_change_test_cases.csv`, `docs/tests/admin_access_test_cases.csv`, and `docs/tests/coverage_result.csv`.

Reviewer gates:

- Phase-blocking: none after this record is added.
- Release-blocking: manual successful admin status change/history verification, manual two-session optimistic-lock conflict verification, safe error/log review for sensitive data exposure, human residual risk acceptance, and release decision.

## Tester Evidence

Tester: Separate AI Tester agent was used because Step 6 is data-consistency and audit sensitive.

Latest outcome:

- Ready for implementation review from a testing perspective.
- No additional automated tests required before implementation review.
- Remaining test items are release-blocking manual verification, not phase-blocking for implementation review.

Tester-confirmed fixes:

- Disabled-admin rejection is covered.
- Invalid `expectedVersion` is covered before DAL persistence.
- Server-action redirect mapping is covered.
- `status_change_test_cases.csv` has repeatable manual rows for conflict and successful status/history verification.
- `admin_access_test_cases.csv` records disabled-admin status-change authorization coverage.
- `docs/tests/coverage_result.csv` exists and records not-measured percentage coverage with critical-path verification and remaining risks.

## Human Verification Gates

Phase-blocking:

- None identified for this Step 6 implementation after Builder checks, Tester review, Implementation Reviewer review, and this record.

Non-blocking:

- Minor UI wording review for English success/error messages, if desired.

Release-blocking:

- Manual successful admin status change and history verification.
- Manual two-session optimistic-lock conflict verification.
- Safe error and log review for sensitive data exposure.
- CI result review after push or PR.
- Human residual risk acceptance.
- Human release decision.

## Manual Verification Steps

Successful status change:

1. Sign in as an enabled administrator.
2. Open `/admin/proposals`.
3. Open one proposal detail page.
4. Change the proposal status to a different valid status.
5. Verify the success notice appears.
6. Verify status and version are updated.
7. Verify Status History contains a success row with previous status, new status, changed administrator, and changed time.

Optimistic-lock conflict:

1. Sign in as an administrator in two browser sessions.
2. Open the same proposal detail page in both sessions.
3. Change the status in the first session.
4. Submit a different status from the stale second session.
5. Verify the approved conflict message appears.
6. Verify the screen reflects the latest status and version from the first session.
7. Verify the stale requested status is not applied automatically.
8. Verify status history has no extra success entry for the stale attempt.

Safe error/log review:

1. Exercise successful, conflict, denied, and missing-proposal status change paths.
2. Inspect application logs from the same run.
3. Verify logs do not contain proposal body, submitter contact, passwords, session tokens, or raw database errors.

## Assumptions

- Step 5 administrator read and authorization boundary phase-blocking gate has already been cleared and recorded in `docs/tests/admin_access_test_cases.csv`.
- The existing Prisma DAL transaction boundary is the approved persistence boundary for Step 6.
- `changedBy` may use the authenticated administrator email for v1 status history.
- Browser-level manual verification can remain release-blocking because automated service/action/DAL checks cover the implementation boundary for this step.

## Remaining Risks

- Coverage percentages were not measured; targeted critical-path tests were used instead and this is recorded in `docs/tests/coverage_result.csv`.
- GitHub Actions CI has not run on this exact commit yet.
- Manual UI verification and log review remain pending as release-blocking items.
- Human review remains responsible for final acceptance, residual risk acceptance, and release decisions.

## ADR Notes

Accepted ADRs checked:

- ADR-0001 Application Runtime and Web Framework.
- ADR-0002 Database, ORM, and Data Access Policy.
- ADR-0003 Authentication and Authorization Model.
- ADR-0004 Concurrent Status Update Handling.
- ADR-0005 Optional Submitter Information and Personal Data Handling.
- ADR-0006 Retention, Deletion, and Backup Policy.
- ADR-0007 Audit Log Policy.
- ADR-0008 Docker Compose Development and Trial Verification Environment.

No ADR conflict was identified.

No new ADR is recommended because the implementation stays within the accepted Step 6 design and ADR-0004 optimistic-locking decision.

## Gate Decision

No phase-blocking human gate is required before pushing this Step 6 reviewable save point.

This record does not approve final completion, residual risk acceptance, release readiness, or release.
