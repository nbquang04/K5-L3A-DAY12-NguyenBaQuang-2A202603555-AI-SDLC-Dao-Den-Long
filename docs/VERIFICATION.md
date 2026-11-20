# Quy trình Verify code và báo cáo

Áp dụng sau mỗi task triển khai và trước bàn giao phase. Đây là quy trình dự án bổ sung cho Spec Kit, không phải chứng nhận code đã đúng. Phase 1 đã có code, contract gốc và kiểm chứng thực tế; xem docs/proof/phase-1/report.md để biết kết quả từng lần chạy.

## 1. Xác định nội dung cần chứng minh

Đọc diff và tiêu chí trong spec; liệt kê hàm/module thay đổi, đầu vào, đầu ra, side effect và caller bị ảnh hưởng. Gắn mỗi kiểm tra với ID yêu cầu hoặc ID lỗi. Với logic gameplay mới/sửa, xác định expected behavior từ spec/contract/quyết định đã chốt trước khi viết test. Nếu spec thiếu luật quyết định kết quả thì làm rõ hoặc ghi giả định trước, không lấy hành vi hiện tại làm chuẩn.

Test có thể được viết trước hoặc ngay sau khi code; phải chạy sau phiên bản code cuối cùng. Ưu tiên test đơn vị cho logic thuần, integration/scenario cho nhiều hệ thống và chơi thử cho đồ họa. Không bắt buộc test riêng mọi hàm private hoặc thay đổi tài liệu/định dạng không có rủi ro hành vi.

## 2. Thiết kế và tạo test

Với mỗi hành vi, chọn ca thành công, biên, dữ liệu sai và trường hợp trạng thái liên quan. Test cần arrange rõ state/seed/config, act bằng API thật và assert giá trị/event/side effect mong đợi. Không chỉ assert “không throw” hoặc “có output”.

| Nhóm | Ca cần cân nhắc |
|---|---|
| Hàm tính toán | Giá trị bình thường, 0, dấu/giới hạn, vector chéo, độ chính xác |
| Hàm đổi state | Trước/sau, tài nguyên bị trừ/cộng, không phát thưởng lặp |
| Input | Bỏ trường, false/0/null, giữ nút, nhả rồi nhấn, dữ liệu sai |
| Khoảng cách/timer | Nhỏ hơn, bằng, lớn hơn ngưỡng; tick đầu/cuối |
| Tương tác hệ thống | Nạp rồi sáng/an toàn, pulse rồi hit, kết thúc đồng thời |
| CLI/protocol | Parse, schema, stderr/stdout, exit code, tick/event/end |
| Hồi quy lỗi | Ca tái hiện lỗi cũ và expected sau sửa |

Không mock core khi muốn chứng minh luật core. Mock chỉ ở ranh giới bên ngoài cần cô lập. Không cập nhật golden snapshot hàng loạt mà chưa review thay đổi luật. Tạo test hồi quy có thể phát hiện lỗi cũ khi khả thi.

## 3. Chạy theo phạm vi thay đổi

1. Chạy test trực tiếp cho hàm/hành vi vừa sửa.
2. Chạy test module/caller và scenario liên quan.
3. Trước bàn giao: build/type/lint nếu dự án có, toàn bộ test còn hiệu lực, contract CLI, replay hai tiến trình, smoke headless và kiểm tra phân phối.
4. Chơi thử các mục trực quan bị ảnh hưởng và luồng bắt đầu → kết quả → restart; lưu ảnh/clip thật.
5. Nếu sửa code sau khi chạy, chạy lại các kiểm tra bị ảnh hưởng; không dùng log cũ để báo phiên bản mới đã đạt.

Chạy lại rộng hơn khi lỗi hoặc thay đổi có thể ảnh hưởng hệ thống khác. Không lặp toàn bộ suite vô ích sau chỉnh sửa chỉ vào báo cáo.

## 4. Bộ kiểm tra của game

| Lớp | Chứng minh | Kết quả cần lưu |
|---|---|---|
| Unit | Công thức, chuyển state, bất biến | Assertion và log test runner |
| Scenario | Nhặt/nạp/địch/pulse/thắng thua | Input, expected, actual và diff |
| Contract | Schema/CLI/tick/JSONL/mã lỗi | Output raw, stderr, exit code và assertion |
| Replay | Cùng seed/config/scenario/inputs | Hai output raw và so sánh từng byte |
| Parity | UI và CLI dùng cùng luật | State cùng tick từ replay; ghi giới hạn phương pháp |
| Visual | Camera/HUD/ánh sáng/phản hồi/restart | Ảnh/clip, thao tác và nhận xét |
| Regression | Luật phase trước còn hiệu lực | Suite chạy và danh sách test thay/bỏ có lý do |
| Distribution | Chạy từ môi trường sạch Linux/macOS | Lệnh, phiên bản, môi trường và log |
| Performance | Ngưỡng cụ thể trong ticket khi có | Số đo thực và cấu hình máy |

So byte chỉ chứng minh tái lập, không chứng minh luật đúng. Build thành công chỉ chứng minh build. Các test runner phải trả nonzero khi assertion sai; script điều phối không tự hiểu gameplay từ log.

## 5. Script điều phối và báo cáo

Chạy từ gốc repo bằng Python 3.10 trở lên:

```text
python scripts/verify.py --config verification/checks.json
```

Manifest hiện có bốn nhóm: build, unit/CLI, scenario/replay và Linux clean build/test/parity. Manifest trống hoặc executable thiếu vẫn phải BLOCKED/exit 2. Không thêm lệnh giả luôn exit 0 để làm xanh báo cáo.

Manifest có `checks`, mỗi mục gồm `id`, `requirements`, `command`, `timeout_seconds`. `command` là argv, không phải chuỗi shell; `requirements` là danh sách ID được kiểm tra. Mặc định chỉ exit 0 là PASS. Không dùng lệnh CLI cố ý trả 2 làm check trực tiếp: viết test wrapper assert rằng CLI trả 2 và stderr đúng, rồi wrapper trả 0 khi assertion đạt.

Ví dụ cấu trúc khi đã có test runner (chỉ minh họa, chưa phải lệnh game):

```json
{
  "checks": [
    {
      "id": "core-unit",
      "requirements": ["US-01", "US-02", "US-03"],
      "command": ["runtime-da-chon", "lenh-test-thuc-te"],
      "timeout_seconds": 120
    }
  ]
}
```

Runner không mở shell; script PowerShell hoặc npm trên Windows có thể cần executable launcher rõ ràng. Chọn cách gọi theo runtime thật và kiểm tra trên nền tảng hỗ trợ. Chỉ chạy manifest đã review vì mỗi command có quyền thực thi như lệnh terminal thông thường.

Kết quả ở `verification/runs/<UTC-time>-<unique-id>/`: report.json, report.md, stdout/stderr từng check. Report có argv, requirements, trạng thái, thời lượng, exit code, revision, working tree và môi trường. Exit của runner: 0 khi mọi check cấu hình PASS, 1 khi có FAIL, 2 khi BLOCKED/cấu hình sai/chưa có check. Timeout là FAIL; executable thiếu là BLOCKED. Không ghi bí mật vào argv hoặc output.

**PASS của runner chỉ là PASS của các command đã cấu hình.** Chưa chứng minh đầy đủ phase, kiểm tra thủ công, độ phủ assertion hoặc độc lập review. Đối chiếu thêm verification.md và checklist release. Các kiểm tra thủ công chưa chạy vẫn NOT_RUN dù runner xanh.

Runner hỗ trợ `--output-dir` để lưu vào thư mục bằng chứng trong repo; đường dẫn phải ở trong repo. Mặc định runs được gitignore để tránh vô tình commit log/dữ liệu. Khi bàn giao, review bí mật rồi lưu những bằng chứng cần thiết có chủ đích, kèm revision và input.

## 6. Phân loại và xử lý kết quả

| Trạng thái | Ý nghĩa | Việc tiếp theo |
|---|---|---|
| PASS | Kiểm tra đã chạy và assertion đạt | Lưu bằng chứng, cập nhật ma trận |
| FAIL | Đã chạy nhưng sai assertion/build/timeout | Ghi actual/expected, sửa và chạy lại |
| BLOCKED | Thiếu executable/nguồn/cấu hình/môi trường | Ghi nguyên nhân, giữ task mở |
| NOT_RUN | Chưa thực hiện kiểm tra | Không dùng để kết luận đạt |
| SUPERSEDED | Luật bị ticket thay thế | Ghi nguồn thay thế, lý do và test mới |

Nếu đỏ, agent không được bỏ check, giảm assertion hay sửa output chỉ để đổi màu. Sửa test khi expected sai phải dẫn đến yêu cầu/quyết định xác nhận. Review độc lập cần người dùng hoặc reviewer được chỉ định; không tự gọi thêm agent khi chưa được phép.

## 7. Mẫu báo cáo gửi người dùng

```text
Phạm vi: hàm/module nào thay đổi, đáp ứng yêu cầu nào.
Test bổ sung: ca bình thường/biên/lỗi/hồi quy nào, nằm ở đâu.
Đã chạy: command và revision; số pass/fail/blocked nếu runner cung cấp.
Bằng chứng: đường dẫn report, output/scenario, ảnh/clip liên quan.
Chưa kiểm tra: mục NOT_RUN/BLOCKED và giới hạn môi trường.
Lỗi còn lại: expected khác actual ra sao, ảnh hưởng và task theo dõi.
Kết luận: task/phase đạt phạm vi nào; chưa đủ căn cứ thì không ghi hoàn tất.
```

## 8. Quan hệ với Spec Kit

Theo [quickstart chính thức](https://github.github.io/spec-kit/quickstart.html), checklist xem chất lượng yêu cầu, analyze tìm xung đột spec/plan/tasks và converge đối chiếu code với tài liệu. Chúng hỗ trợ Verify nhưng không thay thế test runner, kiểm tra contract, chơi thử hoặc bằng chứng phát hành. Repo đã cài chín skill Spec Kit 1.4.3 cho Codex; việc cài skill chưa đồng nghĩa có test gameplay hoặc đã chạy nghiệm thu.
