# Đảo Đèn Lồng — Phase 2 · Ba Đêm

Game 3D góc nhìn thứ ba: dẫn Mây qua Đảo Bến, Đảo Cau và Đảo Chuông, thắp 18 ngọn đèn,
tránh Bóng Mực và Gió Lạc. Cảnh/âm thanh procedural; bản web và CLI dùng chung core 60 Hz.

[Báo cáo Phase 2](docs/proof/phase-2/report.md) · [Đặc tả](specs/002-three-islands/spec.md) · [Verify](docs/VERIFICATION.md) · [Bản Phase 1](docs/proof/phase-1/report.md)

## Chạy game

Yêu cầu Node.js >=22 và npm. Sau clone, từ thư mục repo chạy tối đa ba lệnh:

```sh
npm ci
npm run build
npm start
```

Mở **http://localhost:4173** trong browser desktop có WebGL2. Bản build dist/
không cần mạng/CDN sau cài đặt; có thể phục vụ bằng static server bất kỳ.
Windows đã thử Node 22.17.0; Linux đã thử bằng Docker. Nếu môi trường doanh nghiệp
có CA riêng, dùng cấu hình CA hệ thống phù hợp, không tắt kiểm tra TLS.

## Điều khiển và luật

| Điều khiển | Hành động |
|---|---|
| WASD hoặc mũi tên | Di chuyển theo camera |
| Kéo chuột trên cảnh | Xoay camera |
| Space | Nhảy, cần nhả để nhảy tiếp |
| E | Nạp đèn gần trong 2 m; mỗi đèn cần 10 |
| Q | Tỏa sáng, tốn 3 đom đóm, cooldown 3 giây |
| Shift | Lướt 14 m/s trong 0,2 giây, hồi 1,5 giây |
| Esc/P hoặc nút Ⅱ | Tạm dừng/tiếp tục; chơi lại/cài đặt/về menu |

Mây có 3 lửa, mang tối đa 10 đom đóm, chạy 6 m/s. Ba Đêm dài 300/330/360 giây.
Bóng Mực đuổi 4 m/s (Đêm 3: 4,5), hit làm rơi nửa túi và miễn nhiễm 90 tick.
Ra ngoài nền sẽ rơi; dưới Y=-10 mất một lửa và toàn bộ đom đóm, hồi sinh sau 60 tick.
Đèn sáng tạo vùng an toàn 6 m. Pulse bán kính 3D 5 m, choáng 120 tick, đẩy 4 m trong 15 tick.
Nhặt trong XZ ≤1 m và chênh cao ≤1,5 m. Đảo Cau có cầu/bục nhảy; Đảo Chuông có tầng/dốc/gió.
Bùa Gió tăng chạy lên 7,2 m/s và bỏ hồi lướt trong 10 giây. Gió Lạc cướp tối đa 3 đom đóm;
pulse khi nó mang đồ để thu hồi. Cài đặt âm lượng/độ nhạy chuột được lưu trên trình duyệt.

Thắp đủ 5/6/7 đèn để thắng từng Đêm rồi bấm Đêm kế tiếp; thắng Đêm 3 tới Bình Minh.
Hết lửa ưu tiên thua; nếu còn sống, đủ đèn thắng kể cả đúng hạn. Tab ẩn tự pause.
Headless hỗ trợ pause: tick vẫn tăng, sim_tick/thời gian/tất cả timer đứng yên.

### Điểm

+10 mỗi đom đóm **nạp**, +100 mỗi đèn, +5 mỗi địch trúng pulse.
Khi thắng: +2 × floor(số giây còn lại) +50 × lửa còn lại. Dựng scenario không cộng điểm.
Nguồn cấu hình duy nhất: [game.contract.json](game.contract.json).

## Test và headless

```sh
npm test
npm run verify
node src/headless/cli.mjs --seed 42 --night 1 --ticks 600 --out artifacts/run.jsonl
node src/headless/cli.mjs --seed 42 --night 2 --scenario tests/scenarios/phase2/pad.json --ticks 90 --snapshot-every 1 --out artifacts/pad.jsonl
```

CLI ghi JSONL vào --out, snapshot mặc định mỗi 10 tick từ tick 0; input tick k tạo
state/event k+1. Thành công exit 0; inputs/scenario sai định dạng exit 2 và stderr.
Tất cả cờ/schema: [headless contract 1.1](specs/002-three-islands/contracts/headless.md). --night nhận 1, 2, 3.

`npm run verify` assert 10 scenario cho tính năng mới và kết quả ba Đêm, chạy hai
CLI so từng byte và đo 21.600 tick. Browser được kiểm tra riêng, gồm parity core/CLI.

Toàn bộ Verify tự động, cần thêm Python >=3.10 và Docker Linux:

```sh
python scripts/verify.py --config verification/checks.json
```

Runner trả nonzero nếu test/build/scenario/Linux thất bại. Report có raw log và
trạng thái; không thay thế việc review ảnh/camera/HUD. Xem [ma trận](specs/002-three-islands/verification.md).

## Docker Linux

```sh
docker build -t dao-den-long:phase-2 .
docker run --rm -p 4173:4173 dao-den-long:phase-2
```

CLI: `docker run --rm -v "${PWD}/artifacts:/out" dao-den-long:phase-2 node src/headless/cli.mjs --seed 42 --night 2 --ticks 600 --out /out/run.jsonl`.
Tạo thư mục artifacts trước khi bind mount nếu Docker yêu cầu. Base image pin digest trong Dockerfile.

## Sáng tạo của tôi

Đường đá và đom đóm dẫn ra năm hướng, đảo nổi giữa mây, ánh đèn ấm dần và lời kể
ngắn cho Mây. Tất cả mesh tự sinh; trang trí không dùng RNG gameplay và không thêm
thực thể vào output headless. [Ảnh bắt đầu](docs/proof/phase-1/intro.png) và
[ảnh thắng](docs/proof/phase-1/won.png); replay/core tests chứng minh luật vẫn đúng.

## Tài liệu và giới hạn

[AGENTS](AGENTS.md), [ARCHITECTURE](ARCHITECTURE.md), [constitution](.specify/memory/constitution.md),
[Spec Kit](docs/SPECKIT.md), [STATUS](docs/STATUS.md), [CREDITS](CREDITS.md), [LICENSE](LICENSE).
Phase 2 có âm thanh và lưu cài đặt; chưa lưu tiến độ chiến dịch hoặc hỗ trợ touch/mobile.
Video demo và Release v1.0.0 thuộc bàn giao cuối Phase 4.
Số liệu/bản đồ theo Ticket-02; các điểm chưa đặc tả được ghi rõ trong spec/assumptions.

<details>
<summary>Hướng dẫn lab gốc (giữ để tham khảo)</summary>

# Day 12 — AI SDLC: Đảo Đèn Lồng

> **Cá nhân** (1 người / 1 MSSV) · Áp dụng SDLC cùng AI để xây một **game 3D** qua **4 phase**, từ yêu cầu ban đầu tới bản phát hành.
> **Lab board + trợ giảng:** **[Đảo Đèn Lồng Lab](https://claude.ai/artifact/Q1RYyv1dxjUczzCbd2ZnoW)**

---

## Tài liệu của lab

| File | Nội dung |
|---|---|
| [GUIDE.md](GUIDE.md) | Hướng dẫn làm lab: vòng làm việc mỗi phase, harness, kiểm chứng, token |
| [CHECKPOINTS.md](CHECKPOINTS.md) | Các mốc tự kiểm tra từ chuẩn bị đến nộp bài |
| [SUBMISSION.md](SUBMISSION.md) | Đặt tên repo, hạn nộp, tag, Release, video, checklist |
| [RULES.md](RULES.md) | Quy định: AI, trung thực về bằng chứng, bản quyền, bảo mật |
| [RUBRIC.md](RUBRIC.md) | Thang điểm chi tiết |

## Lab board

Yêu cầu dự án được phát hành tại **[Đảo Đèn Lồng Lab](https://claude.ai/artifact/Q1RYyv1dxjUczzCbd2ZnoW)**. Mỗi phase là một tab (tab chưa phát hành bị khóa), mỗi tab có trợ giảng AI riêng chỉ trả lời trong phạm vi phase đó. Trợ giảng cần đăng nhập claude.ai và dùng lượt Claude của bạn.

## Dự án

**Đảo Đèn Lồng**: game 3D góc nhìn thứ ba. Mây, người giữ đèn nhỏ tuổi, gom đom đóm để thắp lại các Đèn Lồng Lớn và né Bóng Mực trong sương đen.

- Không ràng buộc công nghệ; chạy được trên macOS hoặc Linux.
- Tuân theo **Test Contract** (chế độ headless) để được chấm tự động và so sánh với nhau.

| Phase | Bạn nhận | Nộp |
|---|---|---|
| 1 | **PRD-0** (mô tả tổng quát) + Test Contract | tag `phase-1` |
| 2 | **Ticket-02**, phát hành khi Phase 1 kết thúc | tag `phase-2` |
| 3 | **Ticket-03**, phát hành khi Phase 2 kết thúc | tag `phase-3` |
| 4 | **Ticket-04**, phát hành khi Phase 3 kết thúc | tag `phase-4` + Release `v1.0.0` |

Yêu cầu sẽ được bổ sung và có thể thay đổi giữa các phase, giống dự án thật.

### Lịch 4 giờ

Bài lab kéo dài **4 giờ**. Phase 1 và 2 khoảng **1 giờ**, Phase 3 khoảng **30 phút**, Phase 4 khoảng **1 giờ 30 phút**. Mỗi phase phát hành đúng mốc giờ. Phase mới xuất hiện trên lab board khi tới mốc.

| Mốc | Sự kiện | Hạn tag |
|---|---|---|
| 0h | Phát hành **Phase 1** (PRD-0), gồm cả phần chuẩn bị | `phase-1` trước mốc 1h |
| 1h | Phát hành **Phase 2** | `phase-2` trước mốc 2h |
| 2h | Phát hành **Phase 3** | `phase-3` trước mốc 2h30 |
| 2h30 | Phát hành **Phase 4** | `phase-4`, Release `v1.0.0` và video trước mốc 4h |
| 4h | Hết giờ lab, chốt bài | |

Hết giờ mỗi phase thì tag và chuyển sang phase tiếp theo, dù phase chưa hoàn hảo. Chỗ chưa xong ghi trung thực trong bằng chứng.

---

## Gợi ý SDLC (cách làm là của bạn)

Mỗi phase là một vòng nhỏ. Công cụ, thứ tự, định dạng tài liệu đều tự do; đây chỉ là gợi ý:

1. **Requirements:** biến yêu cầu thành tiêu chí nghiệm thu kiểm chứng được. Chỗ mơ hồ thì tự giả định và ghi lại.
2. **Plan:** nghĩ cách kiểm chứng **trước** khi để agent viết code.
3. **Build:** để agent viết, bạn điều phối và review.
4. **Verify:** chạy thật, kiểm tra hành vi thật. *Không có bằng chứng thì chưa xong*: "agent bảo chạy rồi" không phải bằng chứng.
5. **Evaluate:** cái gì đạt, AI sai ở đâu, harness (AGENTS.md, skill, hook) cần chỉnh gì.
6. **Release:** gắn tag.

## Ba điều cần nhớ

> Bạn được **tự do sáng tạo thêm** quanh phần lõi (nhân vật, cơ chế nhỏ, câu chuyện, hiệu ứng, âm thanh…). Sáng tạo gọn và không phá yêu cầu được tính điểm trong hạng mục F của [RUBRIC](RUBRIC.md); ghi mục "Sáng tạo của tôi" trong README của bạn.

- **Game tốt là game đúng yêu cầu của khách hàng**, không phải game phức tạp hay đẹp nhất. Làm đúng và chứng minh được là đúng trước, trau chuốt sau.
- **Cân nhắc kỹ quota token của bạn.** Đốt nhiều token không làm bài tốt hơn. Ngữ cảnh gọn, kế hoạch rõ, kiểm chứng sớm thường vừa rẻ vừa đúng hơn chạy agent liên tục.
- **Kiểm chứng là phần quan trọng nhất.** Bằng chứng (test, output headless, ảnh, số đo) đáng giá hơn lời mô tả.

---

## Bàn giao cuối cùng

Một **repo GitHub cá nhân, public**, gồm:

1. **Toàn bộ mã nguồn** của game qua 4 phase, tag `phase-1` … `phase-4`, Release `v1.0.0`.
2. **Video demo `.mp4` dưới 5 phút** (đính kèm Release `v1.0.0` hoặc `docs/demo/demo.mp4`, link ở đầu README): chơi thử và cho thấy bằng chứng game chạy đúng.
3. **Bằng chứng kiểm chứng** của từng phase (định dạng tự chọn).
4. **Harness AI đã dùng** (AGENTS.md / CLAUDE.md, skills, hooks, plugins…), giữ nguyên trong repo và lịch sử git.
5. **Ghi chép ngắn:** spec/giả định mỗi phase, nhật ký dùng AI (gồm token/chi phí ước tính), retro.

Không commit API key, token hay `.env`. Gửi link repo theo hướng dẫn của Coach.

## Đánh giá (100 điểm)

| Hạng mục | Điểm |
|---|---|
| Test tự động ẩn (headless, gồm kiểm tra lại phase trước) | 30 |
| Kiểm chứng & bằng chứng của bạn | 20 |
| Quy trình SDLC & harness AI | 15 |
| Evaluation & retro (gồm cách bạn dùng token) | 10 |
| Hiệu năng & ổn định | 10 |
| Chất lượng sản phẩm (đúng yêu cầu, chơi được) | 10 |
| Video demo | 5 |

## Quy định

- Dùng AI thoải mái; không sao chép repo của người khác.
- Bằng chứng phải thật: test luôn đạt hay output sửa tay là vi phạm.
- Nhân vật, bối cảnh là bản gốc của lab; asset bên ngoài chỉ dùng loại CC0/CC-BY/MIT hoặc tự tạo, ghi nguồn trong `CREDITS.md`.

</details>
