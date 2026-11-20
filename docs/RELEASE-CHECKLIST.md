# Kiểm tra trước bàn giao phase

Chưa có mục nào đã nghiệm thu. Dùng bản sao/ghi kết quả theo từng phase; checklist không thay bảng bằng chứng.

- [ ] Nguồn PRD/ticket và phiên bản contract đã xác minh; giả định còn mở được ghi rõ.
- [ ] Spec/plan/tasks/kiến trúc/config khớp nhau; luật thay thế có nguồn và lý do.
- [ ] Test mới cho code/hàm thay đổi có assertion đúng hành vi, gồm ca biên và hồi quy phù hợp.
- [ ] Chạy build/test/contract/replay/headless và suite cũ còn hiệu lực; lưu report, raw log, input và revision.
- [ ] Chơi thử điều khiển/camera/HUD/ánh sáng/kết quả/restart; lưu ảnh hoặc clip thật.
- [ ] Reviewer độc lập đã xem thay đổi và bằng chứng; ghi người review và vấn đề tồn.
- [ ] Chạy từ môi trường sạch trên Linux/macOS; README tối đa ba lệnh sau clone và lệnh headless thật.
- [ ] Không còn tiêu chí bắt buộc thiếu bằng chứng nếu kết luận đạt đầy đủ; nếu hết giờ ghi FAIL/BLOCKED/NOT_RUN trung thực.
- [ ] Cập nhật STATUS, ma trận verify, assumptions, quyết định và nhật ký AI/token.
- [ ] Rà bí mật/asset/giấy phép; không commit .env/token hay log có dữ liệu nhạy cảm.
- [ ] Tag phase-N trỏ đúng mã đã kiểm tra, không thay đổi lịch sử tag cũ.
- [ ] Phase 4: Release v1.0.0 có bản chạy, LICENSE/CREDITS, video MP4 dưới 5 phút và link đầu README.
