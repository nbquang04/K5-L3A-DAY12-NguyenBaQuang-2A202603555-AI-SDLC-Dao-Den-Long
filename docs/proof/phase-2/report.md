# Báo cáo Phase 2 — Ba Đêm

Ngày 2026-11-20. Ticket-02/contract1.1 đã triển khai: ba bản đồ chuẩn, dash/rơi/hồi sinh,
Gió Lạc/Bùa Gió/gió, chuỗi ba Đêm, pause/settings/audio/HUD. Phase1 giữ nguyên tại tag phase-1.

Runtime cuối:8db6afd; các commit bàn giao sau đó chỉ đổi tài liệu/bằng chứng.

[Verify cuối — PASS](verify/20261120T091948Z-5e5e6d03/report.md) · [Đảo Cau](night2.png) · [Đảo Chuông](night3.png).
Source hashes và working tree tại source-revision.json. Browser cuối đo Đêm3 khoảng106FPS, bản thường khoảng113FPS; các số là mẫu đo trên máy này.

Converge cuối: đối chiếu9FR,5SC,5acceptance stories,8quyết định thiết kế,11nguyên tắc và12task; không còn việc triển khai bắt buộc chưa có mã/bằng chứng trong phạm vi đã đọc. Không thêm task rỗng. Đây là đối chiếu của tác giả, không thay log/runtime hoặc review độc lập.

| Nhóm | Kết quả | Bằng chứng |
|---|---|---|
| Unit/CLI/regression |43/43 Windows và Linux PASS | verify/*/report.md, linux-tests.log |
| Headless |10scenario, hai tiến trình giống từng byte | results.json; *-a/b.jsonl |
| Windows/Linux |10scenario byte-identical | linux-results.json |
| Browser |17 kiểm tra PASS, gồm CLI parity, A/D/dash/pause, campaign/retry/audio | browser-results.json |
| Hiệu năng |21.600tick dưới1giây; Đêm3 trên30FPS tại1280×720 | results.json, browser-results.json |
| Bản thường |113FPS trên mẫu6giây; không có API test, cài đặt giữ sau reload | normal-results.json |
| Review |Rà soát độc lập; sửa lỗi drop/recoil/spawn/ID/resume,18test mới PASS | technical-review.md |

Chạy lại: npm ci; npm run build; npm start. Mở http://localhost:4173.
Test: npm test. Verify: python scripts/verify.py --config verification/checks.json (cần Docker).
Browser QA: sau npm run verify, mở /?labtest=1 rồi scripts/browser-check-phase2.ps1 -Page <id>.
Phải giữ tab/cửa sổ hiển thị; không bỏ cơ chế tự pause để đo FPS. Fixture QA bị build sạch xóa.

Môi trường Windows Node22.17.0, Linux Docker Node22.23.2, Three.js0.181.2, Chromium150.
Verify report.json lưu argv, input, revision, working tree, môi trường, exit code và log.
Các lần chạy cũ giữ riêng; dùng report cuối cùng dưới verify/ để đối chiếu runtime cuối.

Giới hạn: chưa có bộ chấm ẩn, không tuyên bố hidden tests đạt. Campaign/win được kiểm bằng
fixture terminal và core parity, không mô tả là người chơi thắng tay cả ba Đêm. Cảm giác chơi
và cân bằng vẫn cần phản hồi người dùng. Các điểm ticket chưa đặc tả (start Đêm3, schema phụ,
night_start) được ghi là giả định tại spec/contracts. Chưa đo token/chi phí hay xác nhận mốc giờ lab.
Video/Release v1.0.0 thuộc bàn giao cuối Phase4.
