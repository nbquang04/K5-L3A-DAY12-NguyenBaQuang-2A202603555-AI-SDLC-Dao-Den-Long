# Đảo Đèn Lồng Constitution

## Core Principles

### I. Yêu cầu có nguồn

Ưu tiên chỉ dẫn giảng viên và PRD/ticket đã công bố. Bản tóm tắt và ví dụ không thay thế Test Contract gốc. Đánh dấu giả định, ghi lý do và cập nhật khi ticket làm rõ. Không suy đoán phase chưa phát hành.

### II. Một bộ luật cho hai chế độ

Game phải là 3D góc nhìn thứ ba và có headless đúng contract. Presentation và CLI cùng dùng core; headless không cần cửa sổ/GPU. Thông số gameplay có một nguồn cấu hình.

### III. Tái lập được

Dùng tick cố định và RNG theo seed. Input, scenario, thời điểm event, làm tròn và kết thúc theo contract của phase. Kiểm tra replay bằng so sánh từng byte; không dùng thời gian thực để quyết định gameplay.

### IV. Kiểm chứng trước và sau thay đổi

Mỗi yêu cầu chính có tiêu chí nghiệm thu, cách kiểm tra và bằng chứng thật. Viết kế hoạch kiểm chứng trước code. Không đánh dấu “đạt” khi chưa chạy. Phase mới chạy hồi quy luật còn hiệu lực; test bị thay thế phải có lý do.

### V. Phạm vi vừa thời gian lab

Bám bốn mốc 60/60/30/90 phút theo README. Ưu tiên đúng luật và chơi được; sáng tạo không làm đổi protocol headless. Hết giờ bàn giao trung thực, không giấu việc chưa xong.

### VI. Harness và trách nhiệm

Giữ AGENTS ngắn, lưu harness trong lịch sử, ghi lỗi AI/cách sửa và token/chi phí ước tính. Người nộp hiểu và giải thích được sản phẩm. Không ghi số liệu sử dụng khi công cụ chưa cung cấp.

### VII. Bàn giao tái chạy được

README hướng dẫn tối đa ba lệnh sau clone; chạy được trên Linux hoặc macOS. Tag phase-1 đến phase-4 khớp bằng chứng; cuối cùng có Release v1.0.0, video MP4 dưới 5 phút, LICENSE và CREDITS. Không đưa bí mật vào repo.

### VIII. Truy vết và phân loại thông tin

Mỗi yêu cầu có ID ổn định trong phase và dẫn đến nguồn, tiêu chí nghiệm thu, task, test và bằng chứng. Nguồn chưa đọc được không được ghi là đã xác minh. Phân biệt bốn loại: yêu cầu gốc, nội dung người dùng cung cấp, giả định và quyết định thiết kế. Khi mâu thuẫn, ghi rõ khác biệt và giải quyết theo yêu cầu hiện hành, không âm thầm trộn hai luật.

Contract giao tiếp với bộ chấm là ràng buộc bên ngoài: schema, tên cờ, stdout/stderr, thời điểm tick, event và mã thoát phải giữ đúng phiên bản được công bố. Thay đổi contract cần truy vết đến ticket hoặc nguồn xác nhận; quyết định kỹ thuật nội bộ không có quyền tự đổi protocol.

### IX. Bất biến gameplay và kiến trúc

Core là nơi duy nhất thay đổi state gameplay. Tại mọi tick hợp lệ: ID thực thể duy nhất, số mang không âm và không vượt sức chứa, lượng nạp trong giới hạn cấu hình, state hữu hạn, điểm phát sinh từ hành động hợp lệ và kết quả terminal chỉ được xác lập một lần. Bất biến cụ thể phải được rà lại khi ticket thay luật.

Tài nguyên hiển thị không tồn tại trong state mô phỏng. Tốc độ render không được làm đổi tốc độ trò chơi. Cùng config/seed/scenario/input và phiên bản runtime được hỗ trợ phải tái lập được; không tuyên bố tất định trên nền tảng chưa thử.

### X. Định nghĩa hoàn thành

Một task triển khai chỉ được hoàn thành khi mã khớp tiêu chí, kiểm chứng liên quan đã chạy và kết quả được ghi. Một phase chỉ được ghi “đạt đầy đủ” khi mọi tiêu chí bắt buộc có PASS, không còn lỗi chặn, có review, hồi quy và kiểm tra phân phối phù hợp.

PASS/FAIL/BLOCKED/NOT_RUN mô tả kết quả chạy; SUPERSEDED chỉ dùng khi có yêu cầu mới thay thế với lý do và liên kết. Tích hết checkbox tài liệu, build thành công hoặc AI báo converge chưa đủ để kết luận game đạt nghiệm thu.

Nếu hết thời gian, phát hành mốc đúng lịch với báo cáo thiếu sót; không đổi định nghĩa PASS để phù hợp thời hạn. Mục tiêu hoàn tất và trạng thái bàn giao thực tế phải được ghi riêng.

### XI. Chất lượng chơi và phát hành

Kiểm chứng trực quan gồm khả năng điều khiển, camera, đọc HUD, nhận biết nguy hiểm/an toàn, phản hồi và restart. Kiểm chứng tự động không thay thế phần này. Hiệu năng chỉ so với ngưỡng có nguồn; đo trên cấu hình ghi rõ, không bịa FPS hoặc cam kết mức hiệu năng chưa được ticket yêu cầu.

Bản phát hành phải cài/chạy theo README từ môi trường sạch, không dựa vào cache, đường dẫn tuyệt đối của máy tác giả hoặc file chưa commit. Tài sản bên ngoài và do AI tạo phải có nguồn; LICENSE cho mã nguồn không tự cấp phép lại asset bên thứ ba.

## Ràng buộc dự án

Áp dụng cho bốn phase của Đảo Đèn Lồng. PRD/ticket và Test Contract đã công bố là
nguồn yêu cầu; bảng tuning, engine và schema cụ thể được chốt trong spec/plan/config.
Việc chuẩn hóa tài liệu này không chốt thay các quyết định còn mở.

Hướng dẫn thực hiện nằm trong AGENTS.md, ARCHITECTURE.md và docs/VERIFICATION.md.
Tài liệu và skill hỗ trợ quy trình; kết quả nghiệm thu phải có bằng chứng theo
các nguyên tắc IV, VIII, X và XI.

## Quy trình phát triển và kiểm chứng

| Thời điểm | Kiểm tra |
|---|---|
| Trước Plan | Nguồn yêu cầu, giả định, khả năng headless và nền tảng chấm |
| Trước Implement | Tiêu chí kiểm tra được; task gắn yêu cầu; quyết định quan trọng có lý do |
| Trước bàn giao | Bảng truy vết, bằng chứng thật, hồi quy, review, giới hạn và tag |
| Khi ticket đổi luật | Danh sách luật/test bị thay, tài liệu/config/adapter chịu ảnh hưởng |

Mỗi phase dùng spec/plan/tasks riêng. Kế hoạch kiểm chứng có trước code; sau thay đổi,
agent tạo hoặc cập nhật test cho hành vi bị ảnh hưởng, chạy test trên phiên bản code
cuối cùng và báo cáo kết quả cùng bằng chứng theo docs/VERIFICATION.md.
Việc chưa chạy hoặc bị chặn phải giữ trạng thái NOT_RUN hoặc BLOCKED.
Không dùng kết quả build/checklist/analyze/converge thay cho kiểm chứng runtime.

## Governance

Khi sửa nguyên tắc, ghi lý do trong docs/notes và rà lại ARCHITECTURE, spec, plan, tasks, contract và test liên quan. Constitution không được dùng để phủ định yêu cầu lab hoặc chỉ dẫn hiện hành của người dùng. Đây là tài liệu dự án tự soạn, không phải bằng chứng đã chạy lệnh Spec Kit.

Đề xuất sửa ghi phiên bản cũ/mới, lý do, nguồn và tác động trong decisions.md. Thay cách diễn đạt: patch; thêm hướng dẫn tương thích: minor; đổi nguyên tắc khiến thiết kế cũ không còn hợp lệ: major. Không cần sửa constitution cho mọi thay đổi tuning; tuning thuộc contract/config và quyết định gameplay.

Nhật ký 0.2.0: làm rõ truy vết, protocol, bất biến, định nghĩa hoàn thành và kiểm chứng phát hành theo yêu cầu người dùng. Chưa có engine hoặc schema gốc, nên các chi tiết triển khai vẫn chưa chốt.

Khi lập Plan hoặc review bàn giao, đối chiếu các nguyên tắc và bảng kiểm tra trên.
Nếu có xung đột, ghi rõ nguồn yêu cầu, nguyên tắc bị ảnh hưởng và cách xử lý;
không kết luận đạt khi thiếu bằng chứng. Ngày thông qua lấy từ bản 0.1.0 được lập
ngày 2026-11-20. Bản 0.2.1 chỉ chuẩn hóa cấu trúc và làm rõ cách áp dụng các nguyên tắc
đã có, không thay luật gameplay hoặc bổ sung yêu cầu cho phase chưa công bố.

**Version**: 0.2.1 | **Ratified**: 2026-11-20 | **Last Amended**: 2026-11-20
