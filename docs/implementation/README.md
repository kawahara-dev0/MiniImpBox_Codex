# Implementation Records

This directory stores repository-local records for AI-assisted implementation steps.

Use this directory for:

- implementation requests
- Builder reports
- Implementation Reviewer reports
- Tester reports or Tester-not-used rationale
- CI and local check evidence
- human verification gate decision records

Records should be concise and tied to a roadmap step or reviewable implementation unit.

After commit, record the commit hash in the relevant implementation record.

After push, when CI is configured and can be checked, record:

- CI status and conclusion
- CI run URL
- commit hash verified by CI

If test case CSV or coverage CSV rows were executed against the committed work but still use `Working tree` in the `Version / Commit` field, update them to the commit hash during post-commit evidence cleanup when practical.
If the rows remain `Working tree`, record the reason in the implementation record.

These records are process evidence.
They do not approve final completion, residual risk, release readiness, or release decisions.
