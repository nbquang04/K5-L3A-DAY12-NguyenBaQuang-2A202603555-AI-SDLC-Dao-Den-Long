# Ma trận kiểm chứng Phase 1

Trạng thái ban đầu: chưa có code/test/game. Mọi dòng đều NOT_RUN. Expected theo bản người dùng, cần đối chiếu contract gốc trước khi chốt assertion chi tiết. Quy trình: [VERIFICATION](../../docs/VERIFICATION.md).

| ID kiểm tra | Yêu cầu | Cần chứng minh | Phương pháp | Test/bằng chứng | Trạng thái |
|---|---|---|---|---|---|
| P1-V01 | US-01 | Gốc, camera-relative, vector chéo và cạnh nhảy | Unit + scenario + chơi | Chưa tạo | NOT_RUN |
| P1-V02 | US-02 | Nhặt đúng ngưỡng, đầy túi, không nhặt hai lần | Unit + scenario | Chưa tạo | NOT_RUN |
| P1-V03 | US-02 | Nạp dở/đủ, deposit trước lantern_lit, không thưởng lặp | Scenario | Chưa tạo | NOT_RUN |
| P1-V04 | US-03 | Đuổi, chạm, miễn nhiễm và vùng an toàn | Scenario + chơi | Chưa tạo | NOT_RUN |
| P1-V05 | US-03 | Pulse đủ/thiếu, cooldown, đẩy, stunned | Unit + scenario | Chưa tạo | NOT_RUN |
| P1-V06 | US-04 | Ba kết quả, điểm và ưu tiên đồng thời | Scenario | Chưa tạo | NOT_RUN |
| P1-V07 | US-04 | HUD và reset toàn session/input/timer | Chơi + integration | Chưa tạo | NOT_RUN |
| P1-V08 | US-05 | Snapshot 0, tick k+1, giữ input, bắt cạnh | Contract assertion | Chưa tạo | NOT_RUN |
| P1-V09 | US-05 | Scenario patch/replace, không event/điểm khi dựng | Contract assertion | Chưa tạo | NOT_RUN |
| P1-V10 | US-05 | JSONL schema/rounding/end, stderr và exit 2 | CLI integration | Chưa tạo | NOT_RUN |
| P1-V11 | US-05 | Cùng input ra output giống từng byte | Hai tiến trình + binary compare | Chưa tạo | NOT_RUN |
| P1-V12 | Hình ảnh | Mây/nón/đèn, màu, đảo sáng dần, phản hồi | Chơi + ảnh/clip | Chưa tạo | NOT_RUN |
| P1-V13 | Kiến trúc | Core chung, không GPU, UI/CLI cùng state | Headless + parity replay | Chưa tạo | NOT_RUN |
| P1-V14 | Bàn giao | Clone sạch Linux/macOS, tối đa ba lệnh | Clean environment smoke | Chưa tạo | NOT_RUN |

Mỗi dòng khi chạy bổ sung command, input, expected/actual, revision, môi trường và link report. PASS chỉ sau assertion hoặc quan sát có bằng chứng. “Chưa tạo” không phải link đến test tồn tại.

## Review và đánh giá phase

- Reviewer độc lập: chưa chỉ định; chưa review.
- Suite tự động: chưa cấu hình, runner sẽ BLOCKED.
- Kết quả chơi thử: NOT_RUN.
- Rủi ro mở: thiếu PRD/contract nguyên văn, tuning và engine chưa chốt.
- Kết luận: bộ tài liệu chuẩn bị; chưa đủ điều kiện ghi Phase 1 đạt.
