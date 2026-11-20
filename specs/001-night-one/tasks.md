# Tasks: Đêm 1 — Đảo Bến

Input: spec.md, plan.md, research.md, data-model.md, contracts/headless.md.
Tests được yêu cầu rõ bởi FR-009. Các mục chỉ đánh dấu sau có bằng chứng.

## Phase 1: Setup

- [ ] T001 Đối chiếu nguồn và chốt spec tại specs/001-night-one/spec.md, lưu docs/requirements/phase-1-source.ax.txt (FR-001–009).
- [ ] T002 Pin dependency/lệnh tại package.json, package-lock.json và game.contract.json theo contracts/headless.md (FR-005/008).

## Phase 2: Foundational

- [ ] T003 Viết test API và hành vi core trước triển khai trong tests/core.test.mjs (FR-001–004/009).
- [ ] T004 Viết validation trong src/core/validation.mjs theo data-model.md: Player.pos/carried/flames; Lantern.id/pos/deposited/lit; Mote.id/pos; Shade.id/pos/state; Input.move/cam_yaw_deg/jump/interact/pulse/dash (FR-006).
- [ ] T005 Khởi tạo/tick/RNG/snapshot src/core/simulation.mjs theo data-model.md: Session.tick/state/time_left_s/score; Player.invulnUntil/pulseReady; scenario patch/replace (FR-005/009).

## Phase 3: User Story 1 — di chuyển (P1)

- [ ] T006 [US1] Triển khai hướng camera/vector chéo/nhảy/rìa trong src/core/simulation.mjs và assertions tests/core.test.mjs (FR-001).
- [ ] T007 [US1] Tạo đảo/Mây/nón/đèn/camera/input trong src/web/main.mjs; world reads core (FR-001/007).

Independent test: core di chuyển sau 60 bước và nhảy bắt cạnh; bản chơi WASD/camera/Space.

## Phase 4: User Story 2 — tài nguyên (P1)

- [ ] T008 [US2] Thêm nhặt/nạp/điểm/event và test biên trong src/core/simulation.mjs, tests/core.test.mjs (FR-002).
- [ ] T009 [US2] Render motes/đèn/trạng thái nạp và ánh sáng trong src/web/main.mjs (FR-002/007).

Independent test: scenario cô lập túi đầy, nạp dở/đủ, đèn sáng chỉ thưởng một lần.

## Phase 5: User Story 3 — Bóng Mực (P1)

- [ ] T010 [US3] Triển khai chase/safe_radius/hit/invuln/pulse/stun/spawn trong src/core/simulation.mjs và tests/core.test.mjs (FR-003).
- [ ] T011 [US3] Render địch/pulse/hit phi bạo lực trong src/web/main.mjs, src/web/style.css (FR-003/007).

Independent test: scenario no spawn có địch chạm/ở đèn/pulse thiếu hoặc đủ.

## Phase 6: User Story 4 — lượt chơi (P1)

- [ ] T012 [US4] Kết thúc/điểm/ưu tiên đồng thời trong src/core/simulation.mjs và tests/core.test.mjs (FR-004).
- [ ] T013 [US4] Bắt đầu/HUD/kết quả/restart/focus handling trong index.html, src/web/main.mjs, src/web/style.css (FR-004).

Independent test: ba kết quả, restart; không reset bằng cách reload trang.

## Phase 7: User Story 5 — headless (P1)

- [ ] T014 [US5] Viết integration/negative/replay test trong tests/cli.test.mjs trước adapter (FR-005/006/009).
- [ ] T015 [US5] Triển khai CLI đọc/ghi/mã lỗi trong src/headless/cli.mjs theo contracts/headless.md (FR-005/006).
- [ ] T016 [US5] Tạo tests/scenarios/*.json và scripts/check-phase.mjs chạy assertions, so byte hai tiến trình (FR-009).

Independent test: node CLI --ticks 0/1/N, malformed files, so hai output bytes.

## Phase 8: Polish & validation

- [ ] T017 Build/vendor/server trong scripts/build.mjs, scripts/serve.mjs; Dockerfile/.dockerignore và kiểm chứng Linux (FR-008).
- [ ] T018 Cấu hình verification/checks.json, chạy Verify thật và lưu docs/proof/phase-1 (FR-009).
- [ ] T019 Chơi browser/ảnh/parity/restart và review kết quả trong docs/proof/phase-1/report.md (FR-001/004/007/009).
- [ ] T020 Cập nhật README/AGENTS/ARCHITECTURE/STATUS, assumptions/ai-log, CREDITS/LICENSE; commit và tag phase-1 với bằng chứng đúng revision (FR-008).

## Dependencies & Execution Order

T001→T002→T003→T004/T005→T006→T007→T008/T009→T010/T011→T012/T013→T014/T015/T016→T017–020.
T014 và T017 độc lập file khi core ready; các task sửa chung simulation/main phải tuần tự.
MVP đầu tiên US1 có đảo/nhân vật/camera, sau đó mỗi story thêm một vòng chơi.

## Parallel Examples

US1 core và visual có thể nghiên cứu độc lập sau model chung; US2 scenario và mesh;
US3 test và art; US4 kết quả test và CSS; US5 negative fixtures và CLI documentation.
Không tự khởi chạy agent song song ngoài bước research đã được skill yêu cầu.

## Implementation Strategy

Viết test trước, chạy thấy lỗi thiếu module, sau đó core→CLI→presentation.
Chạy test liên quan mỗi thay đổi; toàn suite + browser + Linux trước kết luận/tag.

## Phase 9: Convergence

- [ ] T021 Sửa hợp các vùng an toàn chồng nhau trong src/core/simulation.mjs và test hồi quy trong tests/core.test.mjs theo FR-003 (contradicts, HIGH).
- [ ] T022 Đồng bộ bán kính mesh theo tuning, bỏ phụ thuộc locale tie-break và epsilon bán kính trong src/web/main.mjs, src/core/simulation.mjs theo plan: single config và FR-005 (partial, MEDIUM).
- [ ] T023 Rà và hoàn tất ràng buộc khởi tạo/state tại src/core/simulation.mjs theo data-model.md: Mote.id/pos, Shade.id/pos/state, Lantern.id/pos/deposited/lit, Player.pos/carried/flames/invulnUntil/pulseReady và Session.tick/state/time_left_s/score; đối chiếu validation adapter chỉ nhận field scenario trong contract (partial, MEDIUM).
