# Nhật ký quyết định

| ID | Ngày | Quyết định | Lý do / tác động | Trạng thái |
|---|---|---|---|---|
| D001 | 2026-11-20 | Một bộ spec/plan/tasks cho mỗi phase | Truy vết thay đổi và hồi quy; không dựng trước ticket | Áp dụng tổ chức tài liệu |
| D002 | 2026-11-20 | Core độc lập presentation, UI/CLI dùng chung luật | GUIDE yêu cầu headless; tránh hai phiên bản gameplay | Định hướng, chưa triển khai |
| D003 | 2026-11-20 | Constitution 0.1.0 → 0.2.0 | Người dùng yêu cầu chi tiết; thêm protocol, truy vết, bất biến và định nghĩa hoàn thành | Áp dụng tài liệu |
| D004 | 2026-11-20 | Verify có quy trình và runner báo cáo riêng | Spec Kit không thay được kiểm chứng runtime; chưa có stack nên runner dùng manifest argv | Runner chung; command gameplay chưa cấu hình |

Quyết định còn mở: engine/runtime; schema contract; tuning; thứ tự tick và xung đột terminal; RNG; spawn; phân phối. Không coi định hướng kiến trúc là luật gốc của giảng viên.

Mỗi quyết định mới ghi: nguồn/yêu cầu, bối cảnh, phương án đã cân nhắc, lựa chọn/lý do, module/test ảnh hưởng, người xác nhận khi cần. Khi bị thay, giữ dòng cũ và dẫn sang ID mới.

## Quyết định Phase 1 sau khi có nguồn

- D005: Đã đọc PRD-0/contract gốc trong Orca sau đăng nhập; thay trạng thái thiếu schema.
- D006: Node ES modules + Three.js 0.181.2; core không phụ thuộc renderer; npm lock và Docker base pin digest. Rationale/alternatives: research.md.
- D007: Dùng tuning đề xuất và thứ tự tick theo spec/plan; đây là quyết định dự án, không sửa yêu cầu gốc.
- D008: Địch không vào hợp các vùng an toàn; thuật toán projection tuần tự bị reviewer tìm lỗi, thay bằng exposed arc/intersection và test hồi quy.
- D009: UI pause khi hidden/blur; không bypass điều này để làm xanh test. Restore cửa sổ rồi chạy browser assertion lại.
- D010: Bằng chứng có revision nguồn và hash runtime; commit bằng chứng/tag sau đó không đổi mã gameplay.
