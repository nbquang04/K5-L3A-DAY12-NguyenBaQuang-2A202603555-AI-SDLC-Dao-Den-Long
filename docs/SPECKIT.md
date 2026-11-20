# Dùng Spec Kit cho từng phase

Có thể dùng: mỗi phase là một vòng phát triển theo đặc tả trên cùng một game. Constitution và kiến trúc dùng chung; spec/plan/tasks riêng cho từng phase. Không khởi tạo lại toàn bộ dự án sau mỗi phase.

## Trạng thái hiện tại

Cập nhật cài đặt: **đã cài Spec Kit 1.4.3** từ package chính thức `specify-cli`, khởi tạo integration `codex`, script PowerShell và chín skill tại `.agents/skills/speckit-*/SKILL.md`. `integration status --json` trả `ok`, không có file managed thiếu hoặc bị sửa. Constitution, AGENTS và ARCHITECTURE được kiểm tra hash sau init, không bị trình cài đặt ghi đè.

Trong Codex gọi `$speckit-specify`, `$speckit-clarify`, `$speckit-plan`, `$speckit-tasks`, `$speckit-analyze`, `$speckit-checklist`, `$speckit-implement`, `$speckit-converge`, `$speckit-constitution`. Skill sẽ được nhận ở lượt tiếp theo. Không cần tạo lại constitution đã có hoặc chạy init cho mỗi phase.

CLI được cô lập tại `.tools/speckit` (không commit), không thêm vào PATH toàn máy. Dùng từ gốc dự án:

```powershell
./scripts/speckit.ps1 version
./scripts/speckit.ps1 integration status --json
```

Để dựng lại CLI trên Windows sau clone: `python -m venv .tools/speckit`, sau đó `./.tools/speckit/Scripts/python.exe -m pip install specify-cli==1.4.3`. Các skill/scripts/templates đã có trong repo không cần init lại. Trình cài đặt dùng `--integration-options='--events false'`; không thêm hook native tự chạy lệnh.

### Ghi nhận trước khi cài (lịch sử)

Đã đọc toàn bộ sáu file Markdown có sẵn ở gốc repo. Chưa có mã game, engine hoặc Specify CLI trong PATH. Không tìm thấy skill tên speckit/spec-kit trong các vị trí skill cục bộ đã kiểm tra. Các file ở specs và .specify/memory hiện được soạn trực tiếp theo quy trình, **không phải kết quả chạy bộ lệnh Spec Kit đã cài**.

Đã mở [artifact](https://claude.ai/artifact/Q1RYyv1dxjUczzCbd2ZnoW#p1) bằng Orca ngày 2026-11-20: thấy tiêu đề “Đảo Đèn Lồng Lab” và thông báo “Sign in to see this artifact’s data”; chưa đọc được nội dung PRD/contract trong iframe. Người dùng cần đăng nhập trang hoặc cung cấp nguyên văn PRD-0/Test Contract để hoàn tất đối chiếu.

## Cấu trúc

```text
AGENTS.md                         Hướng dẫn agent, trạng thái và quy ước
ARCHITECTURE.md                   Ranh giới core, headless, presentation
README.md                        Hướng dẫn lab gốc + mục dẫn tài liệu dự án
.specify/memory/constitution.md   Nguyên tắc dùng chung bốn phase
specs/001-night-one/
  spec.md                        Bản nháp yêu cầu và nghiệm thu Phase 1
  plan.md                        Bản nháp thiết kế và kiểm chứng
  tasks.md                       Công việc theo phụ thuộc; chưa thực hiện
docs/SPECKIT.md                   Quy trình và cách chuyển phase
docs/notes/assumptions.md         Giả định, chỗ chưa chốt và nguồn
docs/notes/ai-log.md              Nhật ký AI và số liệu khi có
```

Các mục sẽ tạo khi đủ đầu vào: game.contract.json, mã nguồn, tests/scenarios, docs/proof/phase-N, CREDITS, LICENSE, video. Thư mục specs/002-phase-two, 003-phase-three, 004-phase-four chỉ được tạo khi nhận ticket tương ứng; đổi hậu tố theo nội dung thật của ticket.

## Công cụ chính thức và cách gọi

Phần hướng dẫn khảo sát dưới đây được ghi trước khi cài. Trạng thái hiện hành và cách gọi chính xác cho Codex nằm ở đầu tài liệu; không cần thực hiện thêm các phương án cài khác.

Tham khảo [GitHub Spec Kit](https://github.com/github/spec-kit) và [quickstart chính thức](https://github.github.io/spec-kit/quickstart.html). Spec Kit là toolkit có CLI khởi tạo và các skill/lệnh cho agent; không cần cài một skill cộng đồng chỉ vì tên giống “speckit”.

Quickstart hiện minh họa cài CLI bằng `uv tool install specify-cli`. Máy này chưa có uv trong PATH; bộ công cụ chưa được cài trong công việc soạn tài liệu này. Khi cài, đọc installation guide chính thức, chọn phiên bản và integration đúng agent, dùng `specify init --help` để xác nhận tùy chọn trước khi khởi tạo vào repo hiện có. Sao lưu/review diff để tránh ghi đè tài liệu đã soạn; lưu phiên bản và lệnh cài thực tế vào nhật ký.

Quickstart hiện dùng `/speckit-specify`, `/speckit-plan`… trong chat của agent; một số bản/integration dùng `/speckit.specify`, `/speckit.plan`… Chỉ dùng cách gọi được integration đã cài hỗ trợ. Đây không phải lệnh PowerShell. Không giả định gõ tên lệnh trong chat đồng nghĩa skill đã được nạp.

## Vòng làm việc

| Bước | Áp dụng ở dự án | Kết quả |
|---|---|---|
| constitution | Thiết lập một lần; sửa có lý do khi cần | .specify/memory/constitution.md |
| specify | Chỉ đọc PRD/ticket đã công bố, tách bắt buộc và giả định | specs/NNN-name/spec.md |
| clarify | Giải quyết schema/luật còn thiếu; số tự chọn ghi thành giả định | Spec rõ tiêu chí và nguồn |
| plan | Chọn engine, module, thứ tự tick và kế hoạch kiểm chứng | plan.md, cập nhật ARCHITECTURE |
| tasks | Chia việc nhỏ theo phụ thuộc, gắn với US/tiêu chí | tasks.md |
| analyze | So spec/plan/tasks/contract, sửa xung đột trước code | Danh sách sai lệch đã xử lý |
| implement | Thực hiện từng việc và kiểm chứng thật | Mã + test + evidence |
| converge/review | Nếu integration có converge thì dùng; vẫn review và chơi thật | Kết quả đạt/chưa đạt và việc còn thiếu |
| release | Chốt revision, bằng chứng, đánh giá và tag đúng mốc | phase-N; cuối cùng v1.0.0 |

Luồng gọn phù hợp thời gian lab; không cần sinh nhiều tài liệu phụ nếu không giúp kiểm chứng. Bước duyệt kế hoạch là vòng làm việc gợi ý trong GUIDE, không phải lý do tự tạo thêm các cổng xin phép cho việc soạn tài liệu.

## Áp dụng bốn phase

| Phase | Đầu vào | Việc tập trung | Bàn giao |
|---|---|---|---|
| 1, 60 phút gồm chuẩn bị | PRD-0 + contract | Một màn chơi 3D, core dùng chung, headless và bằng chứng | phase-1 |
| 2, 60 phút | Ticket-02 khi phát hành | Ghi phần bổ sung/thay đổi, kiểm chứng phần mới và hồi quy | phase-2 |
| 3, 30 phút | Ticket-03 khi phát hành | Truy vết luật bị thay; sửa/bỏ test cũ có lý do | phase-3 |
| 4, 90 phút | Ticket-04 khi phát hành | Yêu cầu thật của ticket, số đo nếu có, phân phối sạch, video | phase-4 + v1.0.0 |

Khi chuyển phase, dùng feature directory đúng phase theo cơ chế phiên bản Spec Kit đã cài. Quickstart hiện dùng .specify/feature.json hoặc biến SPECIFY_FEATURE_DIRECTORY; không chỉ checkout nhánh rồi mặc định công cụ đã chuyển spec. Không tự tạo file state với schema chưa kiểm tra.

Mỗi spec phase mới có bảng: yêu cầu mới → luật cũ bị ảnh hưởng → module/test/tài liệu cần sửa → bằng chứng. Test luật còn hiệu lực tiếp tục chạy; luật đã thay giữ được lịch sử ở tag trước. Chưa biết ticket thì không viết trước gameplay của nó.

## Lời nhắc dùng ngay khi có contract

> Làm Phase 1 trong specs/001-night-one. Đọc AGENTS, constitution, ARCHITECTURE và tài liệu lab. Đối chiếu PRD-0/Test Contract nguyên văn tôi cung cấp với spec hiện tại, ghi chênh lệch và giả định. Chốt tuning, đặc biệt 180 giây và pulse tốn 2. Hoàn thiện Plan với engine đã thử 3D/headless, cập nhật Tasks, kiểm tra nhất quán rồi triển khai theo thứ tự. Không bịa schema, lệnh chạy hoặc bằng chứng. Mỗi yêu cầu có kết quả kiểm chứng thật; không làm trước Phase 2.

## Trước khi gắn tag

Áp dụng [quy trình Verify code và báo cáo](VERIFICATION.md); chạy `python scripts/verify.py --config verification/checks.json` sau khi cấu hình các command test thật. Đối chiếu [ma trận Phase 1](../specs/001-night-one/verification.md) và [release checklist](RELEASE-CHECKLIST.md). Manifest Phase 1 hiện có các command thật; manifest trống vẫn phải BLOCKED.

- Chạy build/test/headless thật; replay hai lần; chơi từ bắt đầu đến kết quả và restart.
- Lưu command/input/output/exit code/môi trường/revision; không sửa output để “đạt”.
- Review độc lập bởi người dùng hoặc reviewer; ghi giới hạn và lỗi còn tồn.
- Cập nhật README, assumptions, nhật ký token và đánh giá. Không gắn tag phase-1 cho bộ khung tài liệu chưa có game.
- Khi hết giờ phase, bàn giao trạng thái thực tế theo README/CHECKPOINTS dù còn mục chưa đạt; không đánh dấu chúng hoàn thành.

## Thực thi Phase 1

Đã áp dụng specify → clarify → plan (có research độc lập) → tasks → analyze →
implement → checklist/review → converge → implement sửa findings → Verify.
Artifact nguồn đã đọc; game và CLI đã có, không còn chỉ là bộ tài liệu chuẩn bị.
Bằng chứng và tiến độ hiện hành: docs/proof/phase-1/report.md và docs/STATUS.md.
Các mô tả repo chưa có code hoặc thiếu nguồn ở phần lịch sử không còn áp dụng.
