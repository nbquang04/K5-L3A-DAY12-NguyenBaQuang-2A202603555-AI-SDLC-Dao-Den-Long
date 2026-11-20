# Verification report

Status: **PASS**

Revision: `007b854a67cee2773bca2783cf8e2b618354ba78`

Configured automated commands only; manual checks and phase acceptance are separate.

| Check | Requirements | Status | Exit | Seconds | Logs |
|---|---|---|---|---|---|
| build | FR-001, FR-007, FR-008 | PASS | 0 | 0.375 | [stdout](001.stdout.log) / [stderr](001.stderr.log) |
| unit-and-cli | US-01, US-02, US-03, US-04, US-05, FR-006 | PASS | 0 | 2.281 | [stdout](002.stdout.log) / [stderr](002.stderr.log) |
| scenarios-and-replay | FR-005, FR-009, SC-001, SC-003, SC-004 | PASS | 0 | 1.328 | [stdout](003.stdout.log) / [stderr](003.stderr.log) |
| linux-clean-build-tests-parity | FR-008, FR-009, SC-005 | PASS | 0 | 19.563 | [stdout](004.stdout.log) / [stderr](004.stderr.log) |

## Issues

No runner issues recorded. See raw logs for command details.

Commands, environment, dirty working tree and timestamps are recorded in report.json.
