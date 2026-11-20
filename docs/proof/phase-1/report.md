# Báo cáo Phase 1

Ngày 2026-11-20. Runtime revision: e75aeb2afabb97cad179fb701ddd7613060c7c44.

- [Verify cuối](verify/20261120T085439Z-a9fae9b6/report.md): bốn nhóm PASS, exit 0.
- 25/25 test trên Windows và Linux; [Linux log](linux-tests.log), [parity](linux-results.json).
- [Browser](browser-results.json): 8/8 PASS gồm A/D, đi/nhặt, nhảy, hit/dawn/restart, pulse, win/CLI parity.
- [Camera](browser-camera.json): kéo chuột và đi theo yaw mới.
- [Ảnh bắt đầu](intro.png), [ảnh thắng](won.png); WebGL thực, viewport 1280×800.
- [Review kỹ thuật độc lập](technical-review.md): phát hiện/sửa union vùng an toàn, chạy 23 test trước bổ sung A/D.

Route mặc định có địch và đom đóm: thắng tick 921, điểm 1188, còn 3 lửa.
Input tại default-play.inputs.json; browser so toàn snapshot với CLI.
Replay SHA-256: 48dda7568d451d05846126601b845b965efc380ef15439f10beb363f9aefa38d.
Windows Node 22.17.0, Linux Node 22.23.2, Three.js 0.181.2; Chromium 150.
Report.json của Verify ghi command, môi trường, revision, working tree, exit code và log nguyên bản.

Tái chạy: npm ci; npm run build; npm start. Test: npm test.
Verify: python scripts/verify.py --config verification/checks.json (cần Docker).
Browser: mở /?labtest=1, giữ tab hiển thị; chạy scripts/browser-check.ps1 -Page <id>.
Fixture QA bị xóa khi build sạch; URL thường không có API inject scenario.

Lỗi người dùng báo A/D đảo chiều đã sửa ở adapter bàn phím; core/CLI giữ protocol.
Test mới kiểm tra A/D bốn yaw, W/S, arrows và phím đối nhau. Browser A=[3,0,0], D=[-3,0,0]
với camera nhìn +Z, phía phải màn hình là -X. Sửa A/D được tác giả kiểm chứng;
chưa có review độc lập bổ sung riêng. Không mô tả replay là người chơi thắng thủ công.
Chưa chạy hidden tests giảng viên, chưa nghiệm thu cảm giác chơi, chưa đo FPS/token/chi phí.
Không khẳng định đạt mốc thời gian lab vì chưa đo giờ bắt đầu. Video/Release v1.0.0 thuộc Phase 4.
