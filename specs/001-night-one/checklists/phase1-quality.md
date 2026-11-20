# Phase 1 Requirements Quality Checklist

Purpose: chất lượng yêu cầu gameplay/contract/UX trước bàn giao, không thay test runtime.
Created: 2026-11-20. Feature: [spec.md](../spec.md). Audience: reviewer kỹ thuật.

Checkbox thuộc reviewer; x chỉ xác nhận cách viết yêu cầu đủ rõ, không xác nhận game đạt.
speckit-checklist tạo các mục chưa tích; đánh giá reviewer được ghi riêng sau đó.

## Completeness & clarity

- [x] CHK001 Đặc tả có đủ đi/nhảy/camera và quy tắc giữ nút không? [Completeness, Spec US-01/FR-001]
- [x] CHK002 Nhặt/nạp dở/nạp đủ và điều kiện túi đầy có tiêu chí không mâu thuẫn? [Clarity, Spec US-02/FR-002]
- [x] CHK003 Vùng an toàn ngăn địch đi vào và pulse/hit có được phân biệt rõ? [Clarity, Spec US-03/FR-003]
- [x] CHK004 Các lý do kết thúc và thứ tự ưu tiên đồng thời có được định nghĩa? [Coverage, Spec Edge Cases/FR-004]

## Contract & evidence

- [x] CHK005 CLI, tick 0, input giữ giá trị và JSONL có nguồn nguyên văn để đối chiếu? [Traceability, Spec FR-005; contracts/headless.md]
- [x] CHK006 Dữ liệu sai, mảng rỗng và patch ID có yêu cầu xác định? [Coverage, Spec FR-006/Edge Cases]
- [x] CHK007 Tuning tự chọn có được tách khỏi thông số bắt buộc? [Consistency, Spec Assumptions]
- [x] CHK008 SC về replay, Linux và luồng chơi có phương pháp kiểm chứng đo được? [Measurability, Spec SC-001–005]

## UX & scope

- [x] CHK009 Nhận biết ánh sáng/nguy hiểm, HUD và restart có tiêu chí trực quan? [Completeness, Spec FR-004/007]
- [x] CHK010 Phạm vi một đảo/năm đèn và các phần ngoài Phase 1 có ranh giới rõ? [Consistency, Spec Input/Assumptions]

## Notes

Không ghi kết quả implementation vào các checkbox này. Kết quả runtime ở verification.md
và docs/proof/phase-1; implement chỉ đọc checklist state.

Đánh giá riêng sau generation: runtime_research đã đối chiếu độc lập CHK001–010 và
báo 10/10 đạt ngày 2026-11-20. Điều phối ghi checkbox theo đánh giá đó; không phải
implementation tự đổi checklist để vượt gate. Hai ghi chú trạng thái tài liệu đã được cập nhật.
