# Báo cáo Phase 3 — Đèn cạn dầu

2026-11-20. Runtime kiểm chứng: c8c62ccd45771d53415141a8daad666c20071245.
Đã triển khai Ticket-03/contract1.2: hao/châm dầu, thắp lại, Bóng Mực hút dầu, túi tăng sức chứa,
điểm mới, thắng khi giữ đủ đèn tới bình minh và chế độ mù màu lưu qua reload.

| Kiểm chứng | Kết quả | Bằng chứng |
|---|---|---|
| Build/test/Linux |53/53 PASS trên Windows và Linux | [Verify cuối](verify/20261120T094528Z-37d8c864/report.md), linux-tests.log |
| CLI/scenario |12 mới +10 hồi quy, snapshot/parity/assertions PASS | results.json, regression/results.json |
| Replay |Hai tiến trình và Windows/Linux giống từng byte cho22scenario | linux-results.json và JSONL nguyên bản |
| Browser |15 kiểm tra Phase3 +17 hồi quy PASS | browser-results.json |
| Palette/hiển thị |Mắt/viền xanh00B3FF, cảnh báo trắng⚠, scaleđèn tắt.8, vết rách, fuelbar và nhấp nháy24/5 | browser-results.json, [ảnh](fuel-palette.png) |
| Bản thường |119FPS tại1280×720, palette giữ sau reload, không lộ API test | normal-results.json |
| Headless |21.600tick dưới1giây trên môi trường đo | results.json |
| Review |Reviewer độc lập chạy53tests và đối chiếu luật/state/UI | technical-review.md |

Chạy lại: npm ci; npm run build; npm start. Mở http://localhost:4173.
Test: npm test. Scenario/replay: npm run verify. Toàn Verify cần Python và Docker:
`python scripts/verify.py --config verification/checks.json`.
BrowserQA: mở /?labtest=1, chạy scripts/browser-check-phase3.ps1 -Page <id> sau npm run verify.
Giữ browser hiển thị trong pane bên cạnh; tab nền bị throttling/pause không hợp lệ để đo FPS.
Các lần đo trên tab nền không được dùng kết luận hiệu năng; phép đo cuối ở pane hiển thị PASS.

Môi trường Windows Node22.17.0, Linux Docker Node22.23.2, Three.js0.181.2, Chromium150.
Verify report.json lưu command/revision/workingtree/environment/exit và rawlog. Các commit sau runtime chỉ đổi docs/proof.

Converge cuối đối chiếu8FR,5SC,6acceptance stories,8quyết định thiết kế,11nguyên tắc và11task:
không còn việc triển khai bắt buộc thiếu trong phạm vi đã đọc, không thêm task rỗng.
ADR tại docs/adr/003-lantern-fuel.md; breakingchanges tại CHANGELOG.md; test thay thế có lý do tại requirements.md.

Giới hạn: không có bộ chấm ẩn, không tuyên bố hidden tests đạt. Campaign/finaltick dùng scenario/core parity,
không phải bằng chứng một người thắng tay ba Đêm. Cảm giác chơi/cân bằng cần phản hồi người dùng.
Cadence drain60tick liên tục và chi tiết scenario là diễn giải được ghi rõ trong contract/ADR.
Chưa đo token/chi phí hoặc thời điểm bắt đầu lab. Video/Release1.0.0 thuộc Phase4.
