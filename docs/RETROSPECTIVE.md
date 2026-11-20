# Retro — bốn phase Đảo Đèn Lồng

## Kết quả và điều chỉnh

Phase 1 tạo vòng chơi 3D/headless chung core, JSONL theo tick và harness kiểm chứng.
Người dùng phát hiện A/D bị đảo khi nhìn theo camera; lỗi nằm ở adapter bàn phím,
không ở trục X của protocol. Ca hồi quy screen-left/right giúp giữ đúng qua các phase.
Phase 2 mở ba đảo, dash, cầu/bục nhảy, nhiều tầng, gió, Giό Lạc và Bùa Giό.
Điểm khó là địa hình phải giống nhau giữa bản chơi và headless; chuyển xử lý mặt nền
vào core và kiểm tra từng đường đi tốt hơn dựa vào collision của renderer.

Phase 3 thay luật thắng sớm bằng giữ đèn tới bình minh, thêm dầu/hút dầu/thắp lại,
tăng túi và thay điểm. Bảng luật cũ → mới và 22 scenario có expected độc lập giúp
phân biệt test lỗi vì yêu cầu thay đổi với lỗi triển khai. 53 test và kiểm tra browser
ở mốc Phase3 đã PASS; bằng chứng từng tag được giữ riêng, không ghi đè.
Phase 4 bổ sung đo thật, soak, bảng xếp hạng trên đĩa, đổi phím và phát hành.
Benchmark trước tối ưu đạt 73,6 FPS, 1% low 29,8; instancing giữ từng phần mô hình
đưa lần đo tiếp lên 119,1/67,9 FPS. Số đo cuối và môi trường nằm trong bench.json;
máy chấm của giảng viên mới quyết định ngưỡng hiệu năng chính thức.

## Làm việc với AI

AI làm tốt khi có contract cụ thể, test biên và đường dẫn bằng chứng. AI cũng mắc lỗi:
đảo A/D; đo FPS ở tab không thực sự được vẽ; ban đầu xuất soak.results thành object
thay vì chuỗi; đặt mũi tên spawn trong caption thay vì mép màn hình. Người dùng,
assertion browser và review kỹ thuật độc lập phát hiện các lỗi đó. Sửa code rồi chạy
lại có giá trị hơn tự đọc và tuyên bố đúng. Không coi analyze/checklist là chạy test.

AGENTS.md hữu ích nhất để giữ luật chung core, nguồn yêu cầu và quy trình bàn giao.
Spec Kit giữ spec/plan/tasks theo phase; dao-verify và runner lưu revision, dirty tree,
command/exit/assertion. Không có hook bí mật: extension hooks không được cấu hình.
Review của runtime_research chỉ là review kỹ thuật độc lập; trải nghiệm chơi và
nghiệm thu của người dùng vẫn tách biệt.

Soak đầu tiên không crash nhưng RSS tăng hơn 20% do runtime cấp phát/JIT. Không nâng
baseline hoặc thay RSS bằng heap. Lệnh soak công khai dùng V8 jitless, vùng nhớ tạm
1 MiB, GC ở cùng ranh giới trước/sau mỗi đêm để giảm biến thiên runtime; vẫn chạy
đúng core, RNG và 10 đêm. Các thử nghiệm và cờ chạy được ghi trong báo cáo.

## Chi phí và điều làm lại

Tổng token/chi phí AI: **chưa đo**, không có số liệu billing đáng tin để ước lượng.
Tiết kiệm ngữ cảnh bằng đọc ticket hiện hành, dùng STATUS/bảng truy vết, chia tài liệu
theo phase và chạy nhóm test liên quan trước toàn bộ hồi quy. Không tải lại toàn bộ
artifact ở mỗi bước, không sao chép tuning sang renderer và không viết test cho từng
chỉnh sửa văn bản. Nếu làm lại: tạo sớm test hướng camera, bộ đo FPS trong cửa sổ
thật và schema assertion cho từng output CLI; bắt đầu UX cỡ chữ 18px ngay từ Phase1.
Thêm thời gian chơi thử cân bằng dầu/đom đóm; test tự động chưa chứng minh game vui.
Hidden tests không được cung cấp, macOS chưa chạy, không tuyên bố đã đạt hai mục này.
