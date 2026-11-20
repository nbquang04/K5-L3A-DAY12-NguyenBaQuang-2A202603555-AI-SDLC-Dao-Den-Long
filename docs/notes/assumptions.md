# Giả định và quyết định cần chốt

Ngày 2026-11-20. Nguồn lab gốc nằm ở sáu file Markdown tại root; nguồn Phase 1 hiện là bản người dùng gửi trong chat.

| Mã | Nội dung | Trạng thái / tác động |
|---|---|---|
| A01 | Dùng một bộ spec/plan/tasks riêng cho mỗi phase | Áp dụng cho tổ chức tài liệu; không làm trước ticket chưa phát hành |
| A02 | Thông số trong spec Phase 1 là đề xuất người dùng, không lấy từ file contract có sẵn | Chưa duyệt; đặc biệt 180 giây và pulse tốn 2 |
| A03 | Core độc lập phần hiển thị, dùng chung với headless | Định hướng thiết kế theo GUIDE; engine chưa chọn |
| A04 | Schema/tên cờ CLI chính xác chưa biết | Cần contract gốc trước khi tạo adapter và game.contract.json |
| A05 | Thông số đảo, spawn, nhảy, điều khiển và xử lý đồng thời còn thiếu | Nếu PRD không quy định thì tự chọn, ghi lý do và test |
| A06 | Artifact cần đăng nhập để đọc dữ liệu | Orca đã mở nhưng hiển thị yêu cầu Sign in; chưa xác minh PRD/contract |

Khi đổi quyết định: ghi ngày, nguồn yêu cầu mới, luật cũ → luật mới và danh sách test/tài liệu cần cập nhật. Chưa có quyết định kỹ thuật hoặc tuning nào được ghi là đã nghiệm thu.

## Chốt baseline khi triển khai Phase 1

2026-11-20: người dùng yêu cầu tự hoàn thành Phase 1 và cho full access. Đã đọc
PRD-0/contract nguyên văn sau đăng nhập; nguồn docs/requirements/phase-1-source.ax.txt.
A02/A04/A06 ở bảng trên là trạng thái lịch sử trước khi lấy được nguồn.

Giữ bảng tuning đề xuất của người dùng làm baseline theo quyền chọn thông số của PRD;
180 giây/pulse2 không phải con số bắt buộc của giảng viên. Giá trị runtime chỉ trong
game.contract.json. Đảo28m, đèn16m, jump7/gravity18, spawn48/3 theo seed, max60/7.
Nạp/pulse trước contact, all_lit→no_flames→dawn. Vùng an toàn chặn địch; overlap dùng
union projection đã có regression. Chặn rìa, hit_drop_ratio0; không event fall.
Validation từ chối unknown fields và enum/range/type sai; dash boolean nhận nhưng
Phase 1 không có dash. Terminal scenario đánh giá ở bước đầu, tick0 không phát event.
Không có giờ bắt đầu lab chính thức trong phiên, nên không tuyên bố tag đúng deadline.
