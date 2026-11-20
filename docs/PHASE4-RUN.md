## Phase 4 · v1.0.0

![Game chạy thật](docs/proof/phase-4/browser/hud.png)

[Release v1.0.0](https://github.com/nbquang04/K5-L3A-DAY12-NguyenBaQuang-2A202603555-AI-SDLC-Dao-Den-Long/releases/tag/v1.0.0) · [Báo cáo](docs/proof/phase-4/report.md) · [Retro](docs/RETROSPECTIVE.md)

Yêu cầu: Node22+, browser desktop WebGL2, bàn phím/chuột; khuyến nghị1280×720.
Ba lệnh cài/chạy bên dưới vẫn giữ nguyên. ZIP Release đã chứa thư mục web và server,
giải nén rồi `node scripts/serve.mjs`, không cần npm install. Static server khác chạy
được game nhưng cần Node server đi kèm để lưu/xuất leaderboard trên đĩa.

```sh
npm run bench -- --seed 42 --duration 30 --out bench.json
npm run soak -- --seed 7 --nights 10 --out soak.json
npm start -- --export-leaderboard out.json
node scripts/browser-check-phase4.mjs
python scripts/verify.py --config verification/checks.json
```

Benchmark mở Chrome/Edge cài sẵn trong cửa sổ thật, viewport1280×720. Nếu chưa có,
`npx playwright install chromium`; có thể đặt BROWSER_EXECUTABLE_PATH. Linux cần
GUI/display để đo. Cảnh chuẩn200 Bóng Mực,100 đom đóm,3 đèn100dầu, camera30m/15m/15giây,
3giây khởi động rồi30giây đo. Browser rAF chịu vsync; không thể bảo đảm tắt ở driver
nên vsync_off=false. Web không đọc được RSS riêng renderer nên peak_mem_mb=null,
không thay bằng JS heap. p95 dùng nearest-rank ceil(0.95N); 1% low lấy ceil(0.01N)
mẫu chậm nhất. Raw dt trong bench.json.frames.json. Ngưỡng chấm chỉ xác nhận trên
cấu hình giảng viên công bố.

Soak dùng Node `--jitless --max-semi-space-size=1 --expose-gc`: giảm biến thiên JIT/heap
tạm, không đổi luật. GC cùng ranh giới sau load và sau reset mỗi đêm; RSS thật, không
chèn dữ liệu nâng baseline. Input RNG độc lập core, seed7+i, xoay đêm1/2/3. Output chính
đúng schema; sidecar `.details.json` ghi seed/tick/lý do/flags. Các lần thử cờ mặc định
vượt20% được ghi trong báo cáo, không dùng làm kết quả đạt.

Settings đổi đủ9 hành động, phát hiện trùng và khôi phục mặc định; phím phụ cũ chỉ hoạt
động khi không bị hành động khác chiếm. Giảm chuyển động tắt flash/lá bay; không có
camera shake. Chữ tối thiểu18px, chữ lớn×1.25; có caption và spawn arrow ở mép màn hình.
Sau thua hoặc Bình Minh cuối, nhập tên3–12[A-Za-z0-9_] để lưu tổng điểm **các đêm thắng**.
Top10 lưu `.data/leaderboard.json`, giữ khi khởi động lại; không commit dữ liệu người chơi.
LEADERBOARD_PATH chọn file khác cho kiểm thử. API local không có chống gian lận cho
leaderboard thi đấu trực tuyến.

