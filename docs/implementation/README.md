# Implementation Records

This directory stores repository-local records for AI-assisted implementation steps.

Use this directory for:

- implementation requests
- Builder reports
- Implementation Reviewer reports
- Tester reports or Tester-not-used rationale
- CI and local check evidence when it materially affects review or traceability
- human verification gate decision records

Records should be concise and tied to a roadmap step or reviewable implementation unit.

After commit, record the commit hash in the relevant implementation record.

After push, when CI is configured, the CI system is the source of truth for pushed commit CI status.
Do not create an additional evidence-only commit solely to copy a successful CI result into an implementation record when the CI run is available from the commit, branch, or PR.

Record post-push CI details here when they materially affect review or traceability, such as:

- CI failure, retry, or exception handling
- phase-blocking human gate decisions
- release-blocking or security-relevant evidence
- externally hosted or temporary CI evidence that may be hard to retrieve later
- an explicit human request to preserve the CI URL or result in the repository

If test case CSV or coverage CSV rows were executed against the committed work but still use `Working tree` in the `Version / Commit` field, update them to the commit hash during post-commit evidence cleanup when practical.
If the rows remain `Working tree`, record the reason in the implementation record.

These records are process evidence.
They do not approve final completion, residual risk, release readiness, or release decisions.
