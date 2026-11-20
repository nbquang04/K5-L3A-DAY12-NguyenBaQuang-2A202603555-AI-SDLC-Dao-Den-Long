# Feature Specification: Đêm 1 — Đảo Bến

**Feature Branch**: không tạo nhánh riêng; feature directory `specs/001-night-one`

**Created**: 2026-11-20

**Status**: Implemented — runtime verification and technical review completed; see verification.md

**Input**: Hoàn thành Phase 1 theo PRD-0/Test Contract v1.0 và cấu hình đề xuất trong phiên.

Nguồn gốc đã đọc ngày 2026-11-20 tại artifact Phase 1 sau đăng nhập;
bản trích accessibility tại docs/requirements/phase-1-source.ax.txt.
Chỉ xây Đêm 1; không thực hiện ticket Phase 2 dù tab đã phát hành.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Khám phá đảo (Priority: P1)

Điều khiển Mây từ góc nhìn thứ ba.

**Why this priority**: Đây là hành vi lõi hoặc điều kiện chấm bắt buộc của Phase 1.

**Independent Test**: Dựng scenario cô lập và đối chiếu state/event; với UI chơi trực tiếp.

**Acceptance Scenarios**:

1. **Given** trạng thái đầu vào hợp lệ cho US-01, **When** thực hiện hành động của câu chuyện,
   **Then** Mây bắt đầu tại (0,0,0); camera xoay được; di chuyển theo hướng camera, vector chéo không nhanh hơn, nhảy/đáp đất; giữ nút chỉ nhảy một lần.

### User Story 2 - Gom đom đóm và thắp đèn (Priority: P1)

Gom ánh sáng và nạp vào năm đèn.

**Why this priority**: Đây là hành vi lõi hoặc điều kiện chấm bắt buộc của Phase 1.

**Independent Test**: Dựng scenario cô lập và đối chiếu state/event; với UI chơi trực tiếp.

**Acceptance Scenarios**:

1. **Given** trạng thái đầu vào hợp lệ cho US-02, **When** thực hiện hành động của câu chuyện,
   **Then** Trong bán kính và chưa đầy túi thì nhặt, phát mote_picked. Interact nạp phần còn thiếu; giữ nạp dở; đủ thì deposit trước lantern_lit, không thưởng lặp.

### User Story 3 - Tránh Bóng Mực (Priority: P1)

Dùng vùng an toàn hoặc pulse để sống sót.

**Why this priority**: Đây là hành vi lõi hoặc điều kiện chấm bắt buộc của Phase 1.

**Independent Test**: Dựng scenario cô lập và đối chiếu state/event; với UI chơi trực tiếp.

**Acceptance Scenarios**:

1. **Given** trạng thái đầu vào hợp lệ cho US-03, **When** thực hiện hành động của câu chuyện,
   **Then** Địch đuổi, không đi vào vùng an toàn. Chạm ngoài vùng an toàn giảm lửa khi hết miễn nhiễm. Pulse đủ tài nguyên/cooldown trừ đúng chi phí, đẩy và stunned địch trong bán kính.

### User Story 4 - Kết quả và chơi lại (Priority: P1)

Theo dõi tiến độ và chơi lại.

**Why this priority**: Đây là hành vi lõi hoặc điều kiện chấm bắt buộc của Phase 1.

**Independent Test**: Dựng scenario cô lập và đối chiếu state/event; với UI chơi trực tiếp.

**Acceptance Scenarios**:

1. **Given** trạng thái đầu vào hợp lệ cho US-04, **When** thực hiện hành động của câu chuyện,
   **Then** HUD có lửa/đom đóm/đèn/thời gian/điểm; đủ đèn won/all_lit, hết lửa lost/no_flames, hết giờ lost/dawn; restart trả về trạng thái khởi đầu.

### User Story 5 - Kiểm chứng không giao diện (Priority: P1)

Chạy CLI theo Test Contract v1.0.

**Why this priority**: Đây là hành vi lõi hoặc điều kiện chấm bắt buộc của Phase 1.

**Independent Test**: Dựng scenario cô lập và đối chiếu state/event; với UI chơi trực tiếp.

**Acceptance Scenarios**:

1. **Given** trạng thái đầu vào hợp lệ cho US-05, **When** thực hiện hành động của câu chuyện,
   **Then** Đọc seed/night/scenario/inputs/ticks/out/snapshot-every; tick 0 trước input, input k tạo state/event k+1; input giữ giá trị và bắt cạnh; JSONL đúng schema, một end; lỗi dữ liệu exit 2/stderr; hai tiến trình cùng đầu vào giống từng byte.

### Edge Cases

- Đúng biên bán kính dùng ≤; mọi khoảng cách gameplay theo XZ, không phụ thuộc độ cao nhảy.
- Túi đầy không lấy mất đom đóm; đèn đã sáng không nhận nạp/thưởng lại.
- Input bỏ trường giữ giá trị; false khác trường vắng; tick tăng nghiêm ngặt, move trong [-1,1].
- Scenario thay mảng motes/shades, kể cả rỗng; lanterns patch L1–L5; dựng không event/điểm.
- Đồng thời: hành động/nạp/pulse trước địch và hit; ưu tiên all_lit, rồi no_flames, rồi dawn.
- Nhiều địch chạm cùng tick chỉ mất một lửa nhờ miễn nhiễm ngay sau hit.
- Terminal ngay từ scenario: giữ snapshot 0 đúng state dựng, đánh giá terminal ở bước đầu.
- Tick 0 bước yêu cầu: snapshot 0 và end playing nếu chưa chạy bước nào.
- Trùng vị trí khi đẩy: dùng hướng +X xác định; không chia cho 0.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Một đảo tròn 3D, năm đèn, Mây đội nón lá treo đèn nhỏ, đi/nhảy và camera góc nhìn thứ ba (US-01).
- **FR-002**: Nhặt/nạp có sức chứa, nạp dở, event và điểm đúng một lần (US-02).
- **FR-003**: Địch đuổi, không đi vào vùng đèn sáng; hit/miễn nhiễm, pulse/cooldown/stun/đẩy (US-03).
- **FR-004**: Bắt đầu, HUD, ba lý do kết thúc, điểm thưởng khi thắng, restart sạch (US-04).
- **FR-005**: CLI và JSONL đúng Test Contract v1.0, không GPU, fixed tick 60 Hz, tất định (US-05).
- **FR-006**: Xác thực input/scenario; lỗi định dạng trả 2, stderr; không output giả (US-05).
- **FR-007**: Vàng cam là ánh sáng, tím đen là nguy hiểm; đảo sáng dần, hit phi bạo lực (US-01/03/04).
- **FR-008**: Build/run trên Linux hoặc macOS; README tối đa ba lệnh sau clone, điều khiển/điểm/headless; bằng chứng và tag phase-1.
- **FR-009**: Có test đơn vị, scenario, CLI assertions, replay hai tiến trình, visual evidence và báo cáo Verify có revision/môi trường.

### Key Entities *(include if feature involves data)*

- Mây: chân/vận tốc, lửa, số mang, miễn nhiễm, pulse cooldown.
- Đèn: ID L1–L5, vị trí chân, lượng nạp và sáng.
- Đom đóm: ID ổn định, điểm mặt đất; độ cao lơ lửng chỉ để hiển thị.
- Bóng Mực: ID ổn định, vị trí tâm, trạng thái chase/stunned.
- Lượt chơi: seed, tick, thời gian, điểm, state playing/won/lost và event.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Chơi từ bắt đầu đến thắng hoặc thua, restart được mà không reload trang.
- **SC-002**: Mọi tiêu chí US-01–05 có test/quan sát và bằng chứng; không còn lỗi bắt buộc chưa ghi nhận.
- **SC-003**: Hai tiến trình cùng seed/scenario/inputs cho file JSONL giống từng byte.
- **SC-004**: CLI thực hiện đúng N bước trừ khi terminal; một end cuối, scenario sai exit 2.
- **SC-005**: Clone sạch chạy với tối đa ba lệnh sau clone; kiểm chứng trên Linux thực tế.

## Assumptions

Thông số là lựa chọn dự án theo mẫu người dùng, không phải giá trị giảng viên bắt buộc.
Yêu cầu triển khai tự chủ được hiểu là cho phép dùng bảng đề xuất làm baseline có thể chỉnh sau chơi thử.

| Hạng mục | Baseline |
|---|---|
| Màn | 180 giây; 3 lửa; Mây 6 m/s; rìa đảo chặn, không phạt rơi |
| Đom đóm | Mang tối đa 8; nhặt trong 1,2 m |
| Đèn | Năm đèn; mỗi đèn cần 4; tương tác trong 2 m; giữ nạp dở |
| Pulse | Tốn 2; bán kính 5 m; stunned 3 giây; đẩy 2 m; cooldown 1 giây |
| Bóng Mực | 3 m/s; chạm 0,8 m; miễn nhiễm sau hit 2 giây; giữ đom đóm khi hit |
| An toàn | Đèn sáng tạo vùng an toàn bán kính 3 m |
| Điểm | +10/đom đóm; +100/đèn; +20/Bóng Mực bị stunned; khi thắng +2/giây nguyên còn và +50/lửa còn |

- Đảo bán kính 28 m; năm đèn ở bán kính 16 m, L1 ở +Z, còn lại cách 72°.
- Ban đầu 48 đom đóm và 3 địch; bổ sung theo seed tối đa 60 đom đóm/7 địch.
- Nhảy tốc độ đầu 7 m/s, trọng lực 18 m/s²; chặn rìa, không phạt rơi.
- WASD/mũi tên, Space nhảy, E nạp, Q pulse, kéo chuột xoay camera; không cần pointer lock.
- Thời gian từ tick; score thưởng giây nguyên bằng floor(time_left_s) khi thắng.
- Không lưu tiến độ hoặc thêm multiplayer/backend. Đồ họa procedural tự tạo, không phụ thuộc asset từ xa.
- Kiểm tra chất lượng yêu cầu và test/runtime là các loại kết quả khác nhau.

## Clarifications

### Session 2026-11-20

- Q: Đã đăng nhập artifact để đọc nguồn gốc chưa? → A: Người dùng trả lời “rồi”; đã đọc PRD-0/contract qua Orca sau reload.
- Các phần PRD để mở được chọn theo giả định baseline ở trên theo yêu cầu tự chủ; không còn chỗ thiếu protocol cần đoán.
