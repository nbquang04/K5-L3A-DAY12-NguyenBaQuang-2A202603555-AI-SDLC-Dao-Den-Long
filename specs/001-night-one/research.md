# Research — Phase 1

## Runtime

Decision: JavaScript ES modules, Node >=22; Three.js 0.181.2 cho presentation.
Rationale: core chạy cùng mã trên browser/Node; node:test không cần framework;
máy có Node 22.17.0 và Docker Linux. Chỉ một dependency đồ họa.
Alternatives: Godot có editor tốt nhưng tách runtime/core CLI phức tạp hơn;
Babylon/Vite thêm khả năng không cần cho màn đơn. Dùng import map và build copy
Three.js vào vendor, không cần bundler hoặc CDN lúc chạy.

Research được thực hiện bởi agent runtime_research theo bước Plan, chỉ đọc.
Nguồn: https://threejs.org/manual/pages/installation.html và
https://nodejs.org/download/release/v22.17.0/docs/api/test.html.

## Contract

Decision: dùng nguyên schema PRD-0 đã đọc trong artifact, đầu ra qua --out.
Rationale: bộ chấm nối cờ vào headless_cmd, không dựa vào giao diện.
Snapshot chứa tick/sim_tick/state/time_left_s/score/player/lanterns/shades/motes_active;
thêm motes theo khuyến nghị, không chứa timestamp hoặc renderer data.

## Gameplay còn mở trong PRD

Decision: giữ tuning người dùng cung cấp; chặn rìa đảo, không rơi/mất đom đóm;
safe_radius ngăn địch đi vào, pulse trước contact. Kết thúc ưu tiên all_lit,
no_flames, dawn. Tick dùng timer integer, vị trí dùng số thực không làm tròn giữa bước.
Rationale: dễ tái lập, công bằng khi vừa thắp đèn, không lệ thuộc callback engine.
Alternatives: physics engine hoặc random không seed làm parity khó chứng minh.

## Verification

Decision: node:test + subprocess CLI + replay byte compare + browser thực qua Orca;
Linux chạy trong Docker node:22-alpine (ghi phiên bản/digest lúc chạy).
Rationale: test core không chứng minh renderer; build Linux không chứng minh UX.
Không đặt ngưỡng FPS chưa có trong Phase 1; chỉ báo số đo nếu đo thật.
