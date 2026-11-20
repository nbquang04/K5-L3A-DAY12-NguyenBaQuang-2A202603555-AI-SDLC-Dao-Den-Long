# Nhật ký sử dụng AI

## 2026-11-20 — chuẩn bị harness và đặc tả

- Yêu cầu: đọc tài liệu lab, kiểm tra khả năng dùng Spec Kit từng phase, tạo AGENTS và ARCHITECTURE cùng bộ tài liệu mẫu Phase 1.
- Đã đọc: README, GUIDE, CHECKPOINTS, SUBMISSION, RULES, RUBRIC. Repo ban đầu chỉ có sáu file này.
- Skill hỗ trợ: find-skills để kiểm tra hướng tìm công cụ; orca-cli để mở artifact. Chưa có skill Spec Kit được nạp/cài.
- Nguồn ngoài: GitHub Spec Kit và quickstart chính thức. Mở artifact qua web thất bại; trình duyệt Orca mở được nhưng yêu cầu đăng nhập để thấy dữ liệu.
- Kết quả: tài liệu chuẩn bị, spec/plan/tasks nháp Phase 1; không viết mã game, không tạo protocol giả, không tạo bằng chứng gameplay hoặc tag phát hành.
- Điều chỉnh harness: ghi rõ nguồn và trạng thái nháp để tránh AI coi tuning đề xuất là yêu cầu bắt buộc; không tuyên bố đã dùng lệnh Spec Kit khi chưa cài.
- Token/chi phí: chưa có số liệu do công cụ cung cấp. Không tự ghi số ước lượng thiếu căn cứ.
- Tiết kiệm: giữ hướng dẫn thường trực gọn; chỉ tạo yêu cầu Phase 1, không suy đoán các ticket tiếp theo.

Mỗi phase bổ sung: yêu cầu đạt/chưa đạt, lệnh/bằng chứng và revision, hồi quy, lỗi AI/cách phát hiện/cách sửa harness, token/chi phí có nguồn hoặc ước tính có phương pháp. Chưa có kết quả nghiệm thu game.

## 2026-11-20 — mở rộng tài liệu và Verify

- Theo yêu cầu người dùng: bổ sung chi tiết constitution/AGENTS/ARCHITECTURE; thêm quy trình tạo/chạy test sau code và báo cáo.
- Thêm VERIFICATION, STATUS, decision log, nguồn yêu cầu, ma trận Phase 1 và release checklist. Không sửa thêm README trong lượt này.
- Thêm scripts/verify.py và manifest command rỗng. Script điều phối argv không qua shell, lưu raw log và report JSON/Markdown; không tự sinh test gameplay hoặc tự kết luận phase đạt.
- Đã kiểm tra runner bằng sáu trường hợp: command thành công, thất bại, executable thiếu, timeout, manifest rỗng, manifest sai; trạng thái/exit code đúng và raw stdout/stderr được lưu. Đây là kiểm tra harness, không phải kiểm tra game.
- Lần thử đầu bị sandbox chặn tempfile; chạy lại kiểm tra với quyền được chấp thuận. Manifest mặc định trả BLOCKED/exit 2 vì chưa cấu hình test thật.
- Tài liệu Spec Kit chính thức xác nhận checklist/analyze/converge hỗ trợ kiểm tra tài liệu/code; dự án vẫn cần kiểm chứng runtime riêng.

## 2026-11-20 — cài Spec Kit chính thức

- Người dùng yêu cầu cài skill Spec Kit. Đọc skill-installer và hướng dẫn cài/integration Codex chính thức. Skill chính thức được sinh theo project bằng Specify CLI, không có thư mục SKILL.md tĩnh phù hợp để dùng helper tải skill GitHub trực tiếp.
- Cài specify-cli 1.4.3 từ PyPI. Lần cài --user phát sinh Starlette không tương thích FastAPI; chuyển sang venv .tools/speckit rồi gỡ đúng 12 package vừa được thêm vào Python dùng chung. Xác nhận Starlette gốc 0.38.6 được khôi phục.
- Sao lưu tài liệu vào .tools/speckit-install-backup trước init; khởi tạo codex/PowerShell, native events false. Trình cài giữ constitution; hash ba file chính trước/sau init giống nhau.
- Đã có chín skill chính thức, template/script và workflow. Specify version 1.4.3; integration status ok, missing/modified managed files đều 0.
- CLI dùng scripts/speckit.ps1; .tools được gitignore. Không chạy các skill tạo yêu cầu/code và không thay luật gameplay trong bước cài.

## 2026-11-20 — triển khai Phase 1 qua Spec Kit

- Người dùng yêu cầu hoàn thành Phase 1 tuần tự các skill, cho full access.
- Đã đọc PRD-0/Test Contract thực tế qua Orca sau đăng nhập/reload; chỉ tab Phase 1.
- Specify chuẩn hóa spec/feature state; clarify ghi nguồn và baseline tự chọn;
  Plan dùng template resolver/setup và research agent; Tasks dùng setup-tasks;
  Analyze read-only xác nhận FR/SC/task/model coverage trước triển khai.
- Implement viết test trước (FAIL do module chưa tồn tại), xây core/CLI rồi renderer.
  Checklist sinh mục chưa tích; reviewer độc lập đánh giá 10/10 rồi ghi kết quả riêng.
- Converge/review phát hiện safe-circle overlap; test regression FAIL trước sửa,
  sửa thuật toán, reviewer chạy độc lập 23/23 PASS. Sửa hardcode/locale/epsilon liên quan.
- Verify: Windows Node 22.17.0, Linux Docker Node 22.23.2; 23 tests; ba scenario kết thúc;
  full default route won ở tick921, 1188 điểm, 3 lửa; byte parity giữa tiến trình/nền tảng.
- Browser thực: keyboard/pickup, jump, hit/dawn/restart, pulse, win/parity; camera drag
  được kiểm tra riêng. Tab hidden tự pause làm lần kiểm tra live-input thất bại;
  không sửa product để bỏ pause, restore Orca window rồi rerun đạt.
- npm ci lần đầu lỗi CA môi trường; dùng Node --use-system-ca, không tắt TLS.
- Token/chi phí: chưa có số đo nhà cung cấp, không tự ghi số. Tiết kiệm bằng core thuần,
  node:test sẵn có, một dependency và tập trung Phase 1; không đoán phase sau.
- Review kỹ thuật không thay nghiệm thu cảm giác chơi của người dùng. Chưa chạy hidden
  tests giảng viên; không tuyên bố tương thích các yêu cầu chưa được công bố.

- User-reported A/D reversal fixed in keyboard adapter. Four-yaw regression and browser passed; final Verify: 25/25 Windows/Linux, browser 8/8.

## Phase2 ? 2026-11-20
Released Ticket-02 read via Orca; phase1 tagged/pushed first. Spec/plan/research/data-model/contracts/tasks/analyze then implementation and Verify.
Tests failed before missing maps implementation. Revised superseded Phase1 assertions by requirements.md rule table.
Research reviewer found exact-drop/recoil/spawn/ID/resume issues; fixed and added regression, reviewer18/18 passed.
Final suite43/43 Windows/Linux, ten CLI scenarios/two-process and cross-platform bytes, browser parity17checks.
Normal1280x720 FPS measured113 over6seconds, settings persisted on reload; headless21600ticks below1second.
Browser hidden-tab checks correctly failed; restored window without bypassing pause.
Added project dao-verify skill using skill-creator guidance; official Spec Kit skills unchanged.
Token/cost not measured. No hidden-test or full-human-playthrough certification.

## Phase3 2026-11-20
Read released Ticket03 only; specify/plan/research/tasks/analyze/implement/verify/review/converge.
New tests failed before capacity helper/fuel implementation.53tests passed after explicit rule replacements, no silent skips.
12new+10retained CLIcases, Linux/process/browser parity,32browser checks passed.
Normal FPS trials in background tabs throttled; final visible side-pane normalgame119FPS, palette persisted.
Reviewer independently ran53tests and checked fuel/drain/capacity/scoring/terminal/UI, no mandatory defect found in scope.
ADR003,CHANGELOG and requirements table record breakingchanges and scenario/cadence interpretations.
Token/cost not measured; no hidden-test or full-human-playthrough claim.


## Phase4 - 2026-11-20
Codex implemented released Ticket04 via SpecKit specify/plan/tasks/analyze/implement and dao-verify. Research/review agent read-only found soak-results schema and edge-arrow placement/aspect defects, fixed and retested. Failed FPS/RSS/default-runtime trials disclosed. Final61tests/22replays/32retained+6release browsergroups PASS, actual bench/soak, ZIP smoke and62.48s MP4. Tokens/cost: chua do; no billing estimate available.

## Đối soát token sau phát hành — 2026-11-20

Đã tìm thấy usage trong log phiên chính và review agent. Các dòng “chưa đo” phía trên
là trạng thái lúc viết, được bổ sung bằng số liệu có nguồn dưới đây; không sửa tag cũ.

| Phase | Token phân bổ theo thời gian |
|---|---:|
| Phase1 | 23.560.412 |
| Phase2 | 10.045.534 |
| Phase3 | 11.035.378 |
| Phase4 | 13.829.784 |
| Tổng bốn phase | **58.471.108** |

Đa số là context cached:57.199.488; input chưa cache1.020.290, output251.330.
Đã loại trùng response và không cộng lại số tích lũy/reasoning. Chuẩn bị và rà soát nộp
được tách riêng. [Phương pháp và giới hạn](AI-USAGE.md), [dữ liệu](ai-usage.json).
Chi phí tiền chưa có giá/hóa đơn để xác minh. Không coi cached token là miễn phí hoặc
dùng giá model khác. Bổ sung ghi chép theo yêu cầu người dùng; không thay runtime/Release.
