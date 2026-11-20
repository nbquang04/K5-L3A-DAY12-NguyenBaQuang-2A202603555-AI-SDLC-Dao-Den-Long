# Data model — Phase 1

Tên dưới đây là nội bộ; adapter tuân schema contract.

| Field | Ràng buộc | Chuyển trạng thái |
|---|---|---|
| Session.tick | Số nguyên không âm, tăng một mỗi step | Snapshot 0 trước input |
| Session.state | playing/won/lost | Terminal giữ nguyên, không step thêm |
| Session.time_left_s | Hữu hạn, không âm | max(0, startTime-tick/60) |
| Session.score | Số nguyên không âm | Event hợp lệ; thắng thưởng một lần |
| Player.pos | Vector 3 số hữu hạn, Y chân, XZ gameplay | Move/nhảy/clamp đảo |
| Player.carried | Số nguyên 0..carry_capacity | Nhặt, nạp, pulse |
| Player.flames | Số nguyên 0..flames | Hit giảm một, miễn nhiễm ngay |
| Player.invulnUntil | Tick nguyên không âm | Hit đặt hết hạn |
| Player.pulseReady | Tick nguyên không âm | Pulse đặt hồi chiêu |
| Lantern.id | Duy nhất L1..L5 | Scenario patch đúng ID |
| Lantern.pos | Vector 3 hữu hạn | Scenario có thể đổi |
| Lantern.deposited | Số nguyên 0..lantern_cost | Nạp dở giữ lại |
| Lantern.lit | Boolean | Đủ nạp hoặc scenario lit true |
| Mote.id | String duy nhất | M1, M2… theo thứ tự tạo |
| Mote.pos | Vector 3 hữu hạn, Y=0 | Không drift gameplay |
| Shade.id | String duy nhất, tự cấp S1… tránh ID đã có | Giữ ổn định trong lượt |
| Shade.pos | Vector 3 hữu hạn | Chase/đẩy, không vào safe_radius |
| Shade.state | chase/stunned | Pulse đặt stunned, tick hết hạn trả chase |
| Input.move | Mảng 2 số [-1,1] | Chuẩn hóa nếu độ dài >1 |
| Input.cam_yaw_deg | Số hữu hạn | Xoay theo công thức contract |
| Input.jump/interact/pulse/dash | Boolean | Latch giữ trường vắng; chỉ cạnh false→true |

Scenario cho phép các trường PRD; field lạ bị từ chối (giả định validation nghiêm).
Inputs frames có tick nguyên không âm tăng nghiêm ngặt, nút đúng boolean.
Không lưu renderer resource, DOM hoặc đường dẫn trong Session.
