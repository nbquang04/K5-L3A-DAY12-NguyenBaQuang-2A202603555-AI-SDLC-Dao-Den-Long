# Đảo Đèn Lồng — hướng dẫn cho agent

- Đọc README.md, RULES.md, GUIDE.md, CHECKPOINTS.md, SUBMISSION.md và RUBRIC.md trước khi làm việc; đọc tiếp ARCHITECTURE.md và spec của phase hiện tại.
- Nguồn yêu cầu: thông báo giảng viên và PRD/ticket đã phát hành trên lab board. Phân biệt yêu cầu gốc, bản người dùng cung cấp và giả định tự chọn. Không đoán nội dung ticket chưa phát hành.
- Quy trình: constitution → specify → clarify nếu cần → plan → tasks → analyze → implement → kiểm chứng → đánh giá → tag. Mỗi phase là một thư mục specs riêng.
- Phase 1 đã triển khai bằng Node ES modules + Three.js; đọc docs/STATUS.md và báo cáo Verify mới nhất trước khi kết luận. Không dùng trạng thái phiên cũ thay bằng chứng hiện tại.
- Phase 2 dùng Ticket-02/contract 1.1 tại specs/002-three-islands: ba bản đồ chuẩn, lướt/rơi, Gió Lạc/Bùa Gió/gió, campaign/pause/settings/audio/HUD. Đọc requirements.md để biết luật/test bị thay; dùng skill dao-verify cho kiểm chứng, giữ nguyên proof/tag phase-1.
- Phase 3 hiện hành: Ticket-03/contract 1.2, specs/003-lantern-fuel. Đọc ADR003/CHANGELOG và requirements.md trước sửa luật dầu/drain/capacity/điểm/bình minh; không khôi phục all_lit thắng sớm hoặc dùng snapshot đã làm tròn để xét vùng an toàn. Giữ proof/tag phase-1/2.
- Spec Kit 1.4.3 đã cài cho dự án tại .agents/skills; gọi $speckit-specify, $speckit-plan… trong Codex. CLI riêng: `./scripts/speckit.ps1`. Xem docs/SPECKIT.md; không chạy lại init để bắt đầu mỗi phase.
- Ghi lựa chọn kỹ thuật trong plan.md; giữ spec.md tập trung vào hành vi và nghiệm thu. Kiểm tra Test Contract gốc trước khi chốt schema hay CLI.
- Logic mô phỏng dùng chung cho 3D và headless; không phụ thuộc renderer, DOM, cửa sổ hoặc GPU. Dùng tick cố định và bộ sinh ngẫu nhiên theo seed.
- Không nhân đôi luật chơi trong HUD, renderer hoặc CLI. Mọi thông số gameplay lấy từ cấu hình chung sau khi được chốt.
- Mỗi yêu cầu chính phải có cách kiểm chứng và bằng chứng chạy thật. Không sửa tay output, tạo test luôn đạt hoặc đánh dấu hoàn thành khi chưa chạy.
- Phase mới: lập bảng luật cũ → luật mới → test bị ảnh hưởng; sửa/bỏ test có lý do và chạy lại mọi test còn hiệu lực.
- Khi có runtime, cập nhật ngay lệnh build/run/test/headless đã kiểm chứng vào README và game.contract.json. Xác minh chạy trên Linux hoặc macOS, không chỉ Windows.
- Lưu giả định, lỗi AI và token/chi phí trong docs/notes; bằng chứng từng phase trong docs/proof. Ghi “chưa đo” khi chưa có số liệu.
- Giữ commit nhỏ; không xóa harness đã dùng, không viết lại lịch sử sau tag. Chỉ tạo tag phase-N cho bản bàn giao thực tế, ghi rõ phần chưa đạt nếu hết giờ.
- Ghi nguồn asset/công cụ AI trong CREDITS khi có; không commit .env, khóa hoặc token. Bàn giao cuối có LICENSE, video MP4 dưới 5 phút và Release v1.0.0.

## Bắt đầu một phiên làm việc

1. Kiểm tra git status, đọc [trạng thái dự án](docs/STATUS.md) và task đang làm; bảo toàn thay đổi có sẵn của người dùng.
2. Đọc spec/plan/tasks của phase hiện tại và [bảng truy vết](specs/001-night-one/verification.md). Chỉ nạp ticket và tài liệu liên quan để giữ ngữ cảnh gọn.
3. Kiểm tra đầu vào cần thiết: nguồn yêu cầu đã xác minh chưa, quyết định nào còn mở, lệnh kiểm chứng nào có thật. Không biến giá trị đề xuất thành mặc định đã duyệt.
4. Nêu phạm vi thay đổi và cách chứng minh kết quả. Với công việc nhỏ có thể tiến hành ngay; không tự tạo thêm bước xin phép khi người dùng đã cho phép.

## Nơi cập nhật thông tin

| Thông tin | Nơi lưu |
|---|---|
| Hành vi phải có, tiêu chí nghiệm thu | spec.md của phase |
| Cách triển khai, công nghệ, phụ thuộc | plan.md và ARCHITECTURE.md |
| Công việc chưa xong/đã làm | tasks.md; chỉ đánh dấu khi có căn cứ |
| Quyết định và luật bị thay | docs/notes/decisions.md |
| Giả định chưa được xác nhận | docs/notes/assumptions.md |
| Yêu cầu → test → bằng chứng → kết quả | verification.md của phase |
| Trạng thái bàn giao, bước tiếp theo | docs/STATUS.md |
| Lệnh chạy và nguồn đầu vào gốc | README, contract thật, docs/requirements/README.md |

Không sao chép bảng tuning sang nhiều file cấu hình. Tài liệu có thể dẫn lại để giải thích, nhưng runtime chỉ đọc một nguồn.

## Quy tắc triển khai

- Mỗi task phải chỉ ra yêu cầu hoặc lỗi cụ thể. Việc ngoài phạm vi chỉ làm khi hỗ trợ trực tiếp tiêu chí đang triển khai.
- Trước khi sửa luật, đọc test hiện có và định nghĩa expected behavior. Test không được lấy chính output thực tế làm expected rồi tự tuyên bố đúng.
- Không đổi tên trường protocol, kiểu dữ liệu, cờ CLI hoặc mã thoát để thuận tiện nội bộ. Chuyển đổi ở adapter nếu cần.
- Không dùng renderer/collision callback của engine làm nguồn quyết định gameplay nếu headless không thực thi cùng cơ chế.
- Không thêm ngẫu nhiên gameplay, wall clock hay phụ thuộc thứ tự render vào core. Không thêm asset/hiệu ứng làm thay đổi output chấm.
- Pin phiên bản runtime/phụ thuộc và commit lockfile khi công nghệ đã chọn. Không thêm thư viện hoặc tầng trừu tượng cho nhu cầu chưa xuất hiện.
- Khi sửa lỗi, thêm ca hồi quy có khả năng thất bại với lỗi cũ, rồi chạy kiểm tra liên quan. Không viết test hình thức cho chỉnh sửa tài liệu đơn giản.

## Quy trình Verify bắt buộc của dự án

Theo [VERIFICATION.md](docs/VERIFICATION.md): kiểm tra contract, core, CLI, replay, bản chơi, hồi quy và phân phối. Chạy nhóm liên quan sau thay đổi; chạy toàn bộ nhóm còn hiệu lực trước bàn giao phase. Không dùng kết quả analyze/checklist/converge thay cho log chạy chương trình.

- Nếu test lỗi: sửa nguyên nhân hoặc ghi FAIL cùng task còn mở; không đổi expected để che lỗi.
- Nếu không chạy được: ghi BLOCKED và nguyên nhân; không ghi PASS. Nếu chưa thử: NOT_RUN.
- Không đi tiếp với phát biểu “đã hoàn tất” khi tiêu chí bắt buộc còn FAIL/BLOCKED/NOT_RUN. Hết giờ lab vẫn có thể chốt mốc, nhưng phải liệt kê thiếu sót.
- Bằng chứng ghi revision nguồn, trạng thái working tree, command, input, môi trường, exit code và kết quả assertion. Chạy lại sau thay đổi ảnh hưởng hành vi.
- Review độc lập do người dùng hoặc reviewer được chỉ định thực hiện; không tự mô tả việc tự đọc lại là review độc lập. Chỉ gọi agent khác khi được cho phép.

## Kết thúc phiên hoặc chuyển phase

Ghi thay đổi, kiểm tra đã chạy, lỗi còn lại và bước tiếp theo trong STATUS; cập nhật task và bảng truy vết. Phase mới lập bảng thay đổi yêu cầu, đối chiếu schema/CLI và test còn hiệu lực trước khi code. Không ghi đè bằng chứng của tag trước.

Lệnh đã có: `npm ci`, `npm run build`, `npm start`, `npm test`, `npm run verify`; CLI: `node src/headless/cli.mjs --seed 42 --night 1 --ticks 600 --out artifacts/run.jsonl`. Tuning ở game.contract.json; không nhân bản sang renderer.

Lệnh điều phối Verify có thật: `python scripts/verify.py --config verification/checks.json` (Python 3.10+). Manifest có build, unit/CLI, scenario/replay và Linux Docker; môi trường thiếu Docker sẽ BLOCKED/FAIL, không bỏ kiểm tra âm thầm. Sau code, tạo/cập nhật test hành vi phù hợp, thêm command thật, chạy runner và báo cáo theo mẫu trong VERIFICATION. Trước tag dùng [release checklist](docs/RELEASE-CHECKLIST.md).


## Phase4 runtime
Contract1.3 adds `npm run bench -- --seed 42 --duration 30 --out bench.json` and `npm run soak -- --seed 7 --nights 10 --out soak.json`. Read ADR004 and phase4 proof before changing flags/metrics. Local leaderboard requires shipped Node server, exports with `npm start -- --export-leaderboard out.json`. Preserve all four phase proofs and released tags.
