# Kiến trúc Đảo Đèn Lồng

Trạng thái: Phase 1 đã triển khai bằng JavaScript ES modules, Node >=22 và Three.js 0.181.2. Đã đối chiếu PRD-0/Test Contract v1.0 trực tiếp sau đăng nhập. Thiết kế cụ thể và quyết định theo [plan Phase 1](specs/001-night-one/plan.md); phần định hướng dưới đây được cụ thể hóa bằng mapping hiện hành.

## Mục tiêu và giới hạn

Một game 3D góc nhìn thứ ba có thể chơi và một CLI headless cùng thực thi một bộ luật. Bản chấm cần chạy trên Linux hoặc macOS. Việc phát triển trên Windows không thay thế kiểm chứng đa nền tảng. Chưa cần backend, tài khoản, mạng hoặc cơ sở dữ liệu.

## Các lớp

```text
Điều khiển người chơi ──> bộ chuyển input ───┐
                                          v
Scenario + inputs CLI ──> xác thực ──> Simulation core ──> state + events
                                          ^                    │
                                  tuning + seeded RNG          ├─> renderer 3D + HUD + âm thanh
                                                               └─> serializer JSONL + CLI stdout
```

| Thành phần dự kiến | Trách nhiệm | Ràng buộc |
|---|---|---|
| Core | State, di chuyển/nhảy, nhặt/nạp, AI Bóng Mực, sát thương, pulse, điểm, thắng/thua | Không import engine đồ họa, DOM hay thời gian hệ thống |
| Config/contract | Thông số gameplay và giao diện chấm | Chỉ tạo game.contract.json thực thi khi biết schema và lệnh thật |
| Input adapter | Chuyển input giao diện hoặc CLI sang input mô phỏng | Cùng quy tắc giữ giá trị và bắt cạnh nhấn |
| Scenario loader | Xác thực rồi dựng trạng thái khởi đầu | Không phát event gameplay hoặc cộng điểm khi dựng |
| Headless adapter | Parse CLI, chạy tick, xuất JSONL, mã thoát | Không cửa sổ/GPU; lỗi ở stderr; stdout chỉ chứa protocol |
| Presentation | Camera, mô hình, ánh sáng, HUD, hiệu ứng, màn kết quả | Chỉ đọc state/events; không tự quyết định sát thương hoặc điểm |
| Verification | Scenario, assertion, replay và bằng chứng trực quan | Đối chiếu kết quả mong đợi độc lập với hàm được kiểm tra |

Tên thư mục mã nguồn chưa được cam kết; chọn theo engine ở bước Plan. Có thể dùng engine có headless hoặc renderer web cộng runtime CLI, miễn đáp ứng contract và chạy được trên nền tảng chấm.

## Thời gian và tính tất định

Theo bản nháp người dùng: bước mô phỏng 1/60 giây; snapshot tick 0 sau khi dựng scenario và trước input. Input tick k tạo kết quả tại k+1. Renderer có thể nội suy nhưng không thay đổi tick gameplay. Mọi ngẫu nhiên gameplay dùng seed; ngẫu nhiên trang trí không tác động core.

State cần chứa player, đèn theo ID, đom đóm hoạt động, Bóng Mực, tick, bộ đếm cooldown/miễn nhiễm, điểm và kết quả. Thời gian gameplay được suy từ tick. Chỉ làm tròn tọa độ khi serialize; không làm tròn state sau mỗi bước. Duy trì thứ tự thực thể/event ổn định, không ghi timestamp thực vào JSONL.

Contract gốc để mở thứ tự nội bộ. Plan đã chọn move/nhặt/nạp/pulse → spawn/địch/hit → kết quả; test kiểm tra trường hợp đồng thời: thắp đèn cuối đúng lúc hết giờ, bị chạm cùng tick pulse, nhiều Bóng Mực chạm cùng tick. Không tự coi quyết định kỹ thuật là yêu cầu của giảng viên.

## Giao diện giữa các lớp

Core có thao tác khởi tạo từ config/seed/scenario và thao tác bước nhận input, trả state cùng event. Tên hàm/kiểu cụ thể chờ chọn ngôn ngữ. Snapshot là dữ liệu có thể serialize, không chứa mesh, material, audio handle hoặc đối tượng engine.

Input lưu giá trị các trường bị bỏ qua; jump/interact/pulse bắt cạnh false → true. Camera được chuyển thành hướng gameplay xác định trước khi bước core, theo schema contract gốc khi có. Restart khởi tạo lại toàn bộ state, input latch, RNG và bộ đếm; không chỉ đưa nhân vật về gốc.

## Thay đổi theo phase

Constitution dùng chung; mỗi phase có spec/plan/tasks và bảng truy vết riêng. Khi ticket thay luật, ghi quan hệ thay thế, cập nhật core/config/adapter/tài liệu/test bị ảnh hưởng; giữ lịch sử ở tag cũ. Không tạo sẵn nội dung gameplay Phase 2–4.

## Kiểm chứng kiến trúc

1. Headless khởi chạy được trên môi trường không có GPU/cửa sổ.
2. Cùng seed/scenario/inputs cho JSONL giống từng byte qua hai tiến trình.
3. Replay cùng input ở chế độ chơi và CLI cho cùng state gameplay tại cùng tick.
4. Test biên kiểm tra bán kính bằng đúng ngưỡng, vector chéo, giữ nút, đầy túi, nạp một phần và kết thúc đúng một lần.
5. Chơi thử xác nhận camera, HUD, chuyển sáng, phản hồi va chạm và restart; CLI không chứng minh được các tiêu chí hình ảnh.

Các mục trên đã có test/CLI/Linux/browser trong docs/proof/phase-1/report.md; kết quả chi tiết và giới hạn phải đọc cùng báo cáo đó.

## Quyền sở hữu dữ liệu và chiều phụ thuộc

Core sở hữu state và luật chuyển trạng thái; adapter sở hữu đọc/ghi bên ngoài; presentation sở hữu mesh/material/camera/audio/UI. Adapter và presentation có thể gọi core; core không gọi ngược chúng. Mọi event là mô tả một việc đã xảy ra, không phải callback bắt renderer quyết định luật.

| Dữ liệu | Chủ sở hữu | Vòng đời |
|---|---|---|
| Tuning đã xác thực | Config loader | Bất biến trong một lượt chơi |
| Seed, RNG, tick, input latch | Simulation session | Khởi tạo lại theo quy tắc restart |
| Player, đèn, đom đóm, Bóng Mực, điểm/kết quả | Core | Chỉ đổi qua khởi tạo hoặc step |
| Event trong tick | Core | Danh sách thứ tự ổn định, chỉ tiêu thụ một lần |
| Input thiết bị, góc camera trực quan | Presentation/input adapter | Chuyển sang dữ liệu gameplay trước step |
| Cấu hình CLI, đường dẫn, stream | Headless adapter | Không rò vào state gameplay |
| Lệnh, log, revision, assertion | Verification runner | Lưu riêng theo phase/lần chạy |

State được đưa ra ngoài dưới dạng view/snapshot không cho phép renderer vô tình sửa. Cách dùng immutable data hay bản sao tùy ngôn ngữ, không bắt buộc thêm thư viện.

## Mô hình trạng thái đề xuất

Các trường dưới đây là khái niệm nội bộ, **không phải tên trường JSON contract**.

- Session: tick, seed/RNG, config, trạng thái running/won/lost và nguyên nhân kết thúc.
- Player: vị trí/vận tốc, hướng, trạng thái chạm đất, lửa, số mang, miễn nhiễm và pulse cooldown.
- Lantern: ID ổn định, vị trí, lượng đã nạp, trạng thái sáng; trạng thái sáng được cập nhật nhất quán với lượng cần theo luật.
- Mote: ID, vị trí, còn hoạt động; một lượt nhặt chỉ tăng tài nguyên/điểm một lần.
- Enemy: ID, vị trí, trạng thái đuổi/stunned và thời điểm hết choáng; luật lựa chọn hướng/đẩy khi trùng vị trí cần quyết định xác định.
- Input latch: giá trị giữ từ tick trước và cạnh nhấn của tick hiện tại; không để tốc độ render tạo nhiều lần interact/pulse.

Bất biến cần assertion: không NaN/Infinity, không âm tài nguyên/cooldown, không trùng ID, nạp không vượt nhu cầu, không nhận hai thưởng cho cùng một chuyển trạng thái. Các giới hạn dựa vào config đã chốt.

## Khởi tạo và vòng đời

1. Đọc và xác thực config/CLI; phân biệt file không đọc được, JSON sai và dữ liệu sai theo contract.
2. Tạo state mặc định bằng seed; áp dụng scenario theo chính xác thứ tự/replace/patch của contract.
3. Chuẩn hóa và kiểm tra bất biến; không biến trạng thái scenario thành event giả hoặc điểm thưởng.
4. Xuất snapshot tick 0 như contract; bắt đầu nhận input.
5. Mỗi step nhận input chuẩn hóa, cập nhật gameplay, tạo event và state mới; adapter quyết định thời điểm serialize theo contract.
6. Khi terminal, không thực hiện thêm gameplay; xuất đúng một end. Quy tắc terminal ngay từ scenario, tick yêu cầu bằng 0 và snapshot cuối cần đối chiếu nguồn gốc.
7. Restart dựng một session mới và dọn event/listener/tài nguyên lượt cũ; reset camera/HUD theo thiết kế. Tránh đăng ký input hai lần sau nhiều lượt chơi.

## Trình tự tick cần chốt trong Plan

Đề xuất các nhóm thao tác: giữ giá trị input/bắt cạnh → tính hướng/di chuyển/nhảy → xử lý hành động và tương tác → cập nhật địch/cooldown/va chạm → đánh giá kết quả/điểm → tạo output. Thứ tự thực thi hiện hành được chốt trong plan.md và src/core/simulation.mjs.

Plan phải xác định rõ thời điểm giảm timer, so sánh ngưỡng và ưu tiên xung đột. Đặc biệt: đèn vừa sáng có bảo vệ ngay trong tick đó không; pulse có ngăn hit cùng tick không; địch hết stunned có di chuyển ngay không; lửa cuối/đèn cuối/dawn cùng tick kết thúc thế nào. Test dựa trên quyết định có nguồn, không dựa vào thứ tự tình cờ trong code.

## Input, tọa độ và va chạm

Gameplay dùng XZ làm mặt phẳng, Y làm độ cao theo bản nháp. Chốt đơn vị m/s và giây/tick trong config/Plan. Vector di chuyển chéo được chuẩn hóa theo luật; camera adapter phải ghi được hướng cần thiết cho replay. Visual camera shake không được thay hướng mô phỏng ngoài ý muốn.

Nhặt/nạp/an toàn/chạm dùng phép đo và điều kiện biên riêng theo contract; không suy từ hình dạng mesh. Tránh dùng rigid-body solver không tất định của engine để thay thế kiểm tra khoảng cách core. Quy tắc cạnh đảo, đáp đất và nhảy phải có thể thực hiện ở CLI mà không tải scene 3D.

## Serialization và lỗi

Xác thực trước khi chạy; không âm thầm bỏ input sai, clamp dữ liệu ngoài phạm vi hoặc nhận field lạ nếu contract không cho phép. Giữ tính phân biệt giữa trường bị bỏ qua, false, 0, null và mảng rỗng. Scenario patch đèn theo ID và replace danh sách phải có test riêng.

Serializer chỉ xuất trường protocol yêu cầu, thứ tự ổn định và format số đã chốt. Làm tròn tại biên output; quyết định xử lý -0 và tie rounding theo contract/runtime và kiểm tra. Chẩn đoán ở stderr; JSONL ở stdout; exit code theo contract. Tên event nội bộ có thể khác nhưng adapter phải ánh xạ chính xác.

Không viết tệp log hoặc timestamp vào stream chấm. Expected fixture, actual output và báo cáo assertion là ba loại tệp tách biệt.

## Cấu trúc vật lý sau khi chọn engine

Plan ánh xạ các module logic trên sang thư mục thật: core, config/contracts, adapters/headless, presentation, tests/unit, tests/scenarios và công cụ verify. Đây là nhóm trách nhiệm; không yêu cầu tạo thư mục rỗng hoặc cố ép engine theo một framework khác.

Khi runtime được chọn, bổ sung bảng phiên bản, lệnh build/test/run/headless, nền tảng hỗ trợ, entry point, cách đóng gói và cách CI chạy không GPU. Chưa có dữ liệu thì để trạng thái chưa chọn, không ghi placeholder có vẻ chạy được vào contract.

## Quyết định và tiêu chí đổi kiến trúc

Ghi [decision log](docs/notes/decisions.md) khi chọn engine, thứ tự tick, cách RNG, ưu tiên terminal hoặc thay contract. Mỗi quyết định có bối cảnh, lựa chọn, lý do, tác động và test liên quan. Chỉ tách thêm module khi trách nhiệm hiện tại gây lỗi/khó kiểm tra hoặc ticket cần; không thiết kế trước hệ thống nhiều đảo/nhiều người chơi.

Xem [chiến lược Verify](docs/VERIFICATION.md) và [ma trận Phase 1](specs/001-night-one/verification.md). Kiến trúc này được coi là đáp ứng khi headless, replay, parity và bản chơi đều có bằng chứng; kết quả hiện hành xem verification.md và report thay vì dựa vào tài liệu định hướng.

## Mapping triển khai Phase 1

- src/core/validation.mjs: schema inputs/scenario; DataError phân biệt lỗi dữ liệu.
- src/core/simulation.mjs: createGame/step/snapshot, RNG, tick, luật và union safe circles.
- src/headless/cli.mjs: cờ CLI, file I/O, JSONL và exit code; không import Three.js.
- src/web/main.mjs: procedural scene, camera/input, fixed accumulator và HUD; style.css/index.html là presentation.
- scripts/build.mjs: clean dist có kiểm tra đường dẫn trong repo, copy vendor local; serve.mjs phục vụ tĩnh.
- tests/core.test.mjs và cli.test.mjs: unit/negative/contract; check-phase.mjs tạo route chơi thật và replay.
- scripts/linux-check.mjs: image pin digest, clean npm ci/build/tests/scenarios, so byte với Windows.
- scripts/verify.py: điều phối và report; không thay bộ assertion Node.

Chạy `?labtest=1` mới có window.__lab dùng QA/parity. Bản bình thường không có API inject scenario;
fixture QA chỉ copy tạm vào dist khi kiểm tra và bị xóa bởi build sạch. Đồ họa không thay state core.
