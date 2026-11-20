# Verification report

Status: **FAIL**

Revision: `f5335ad6b3f2e3ef13af3759a872d257f58a32e5`

Configured automated commands only; manual checks and phase acceptance are separate.

| Check | Requirements | Status | Exit | Seconds | Logs |
|---|---|---|---|---|---|
| build | FR-001, FR-007, FR-008 | PASS | 0 | 0.125 | [stdout](001.stdout.log) / [stderr](001.stderr.log) |
| unit-and-cli | US-01, US-02, US-03, US-04, US-05, FR-006 | PASS | 0 | 1.187 | [stdout](002.stdout.log) / [stderr](002.stderr.log) |
| scenarios-and-replay | FR-001, FR-002, FR-003, FR-004, FR-008, FR-009 | FAIL | 1 | 5.563 | [stdout](003.stdout.log) / [stderr](003.stderr.log) |
| linux-clean-build-tests-parity | FR-008, FR-009, SC-005 | PASS | 0 | 19.75 | [stdout](004.stdout.log) / [stderr](004.stderr.log) |

## Issues

No runner issues recorded. See raw logs for command details.

Commands, environment, dirty working tree and timestamps are recorded in report.json.
