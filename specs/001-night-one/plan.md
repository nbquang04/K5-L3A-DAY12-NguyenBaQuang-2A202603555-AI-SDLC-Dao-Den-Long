# Implementation Plan: Đêm 1 — Đảo Bến

**Branch**: feature directory 001-night-one, giữ nhánh hiện tại | **Date**: 2026-11-20 | **Spec**: [spec.md](spec.md)

**Input**: spec Phase 1 và PRD-0/Test Contract đã xác minh.

## Summary

Core JS deterministic dùng chung Node CLI và Three.js browser. Dữ liệu tuning chỉ ở
game.contract.json; đồ họa procedural, không tải CDN. Xây test/assertion trước core,
sau đó tích hợp renderer/input/HUD, kiểm tra browser, replay và Linux Docker.

## Technical Context

**Language/Version**: JavaScript ES modules, Node >=22; máy dev 22.17.0.
**Primary Dependencies**: Three.js 0.181.2, pin package-lock.
**Storage**: JSON scenario/input, file JSONL và bằng chứng; không database.
**Testing**: node:test, CLI subprocess, replay byte compare, Orca browser và Docker Linux.
**Target Platform**: browser desktop có WebGL2 trên Windows/macOS/Linux; CLI Node Linux/macOS.
**Project Type**: game web tĩnh + CLI.
**Performance Goals**: core fixed 60 Hz theo contract; headless chạy nhanh nhất có thể;
Phase 1 không có ngưỡng FPS bắt buộc nên không phát minh ngưỡng chấm.
**Constraints**: headless không import renderer/DOM/GPU; không network lúc chơi;
README tối đa ba lệnh sau clone; đúng protocol và một end.
**Scale/Scope**: một đảo 28 m, năm đèn; tối đa 60 đom đóm và 7 Bóng Mực.

## Constitution Check

Trước/sau thiết kế: I/VIII nguồn đã xác minh và giả định ghi trong spec; II/IX core
độc lập; III replay seed/tick; IV/X test/ma trận/báo cáo trước kết luận; V chỉ Phase 1;
VI lưu harness/log/token; VII/XI clean Linux + browser + credits/license/tag.
Không có ngoại lệ constitution. Gate thiết kế PASS; kết quả runtime xem verification.md và docs/proof/phase-1/report.md.

## Project Structure

### Documentation (this feature)

spec.md, plan.md, research.md, data-model.md, contracts/headless.md,
quickstart.md, tasks.md, verification.md, checklists/requirements.md.

### Source Code (repository root)

```text
src/core/{simulation,validation}.mjs
src/headless/cli.mjs
src/web/{main.mjs,style.css}
index.html
game.contract.json
tests/{core,cli}.test.mjs
tests/scenarios/*.json
scripts/{build,serve,check-phase}.mjs
scripts/verify.py
Dockerfile
```

**Structure Decision**: core không dependency; adapter CLI đọc file, browser render state.
Build copy mã web/core/config và vendor Three.js vào dist; static server chỉ phục vụ dist.

## Tick pipeline và hệ thống

1. Latch input, tính cạnh; tick tăng. Di chuyển camera-relative/chuẩn hóa, nhảy/đáp đất,
clamp XZ theo bán kính. Chỉ serialize mới làm tròn.
2. Nhặt theo thứ tự ổn định; interact đèn gần nhất trong radius, tie ID.
3. Pulse bắt cạnh, trừ chi phí/cooldown, stun và đẩy địch; event pulse có stunned_ids.
4. Spawn theo tick/seed nếu cờ cho phép; địch stunned đứng yên đến tick hết hạn;
chase tiến về player nhưng không vào vùng đèn sáng, kể cả scenario đặt sẵn bên trong.
5. Contact ngoài safe_radius và hết invuln: hit một lần; dropped=0.
6. End all_lit → no_flames → dawn; bonus thắng một lần. Snapshot chu kỳ, một end.

Input trên browser là cùng cấu trúc latch của core. UI fixed-step accumulator giữ dư;
không bỏ tick gameplay khi FPS thấp. Khi mất focus hiển thị tạm dừng chỉ ở UI,
clear input, không áp dụng thời gian tab ẩn khi resume. Restart tạo session mới seed 42.

## Validation và bằng chứng

Unit: vector, jump edge, biên nhặt/nạp, pulse/cooldown, safe collision, điểm/terminal.
CLI: schema, tick/frame rules, scenario patch/replace, stderr/exit 2, end/snapshot.
Replay: hai tiến trình và so byte; Windows/Linux cùng input. Browser: thực sự dùng
keyboard và restart; chạy cùng core với scenario thắng/thua để kiểm tra màn kết quả.
Lưu command/log/input/revision/hash code, screenshot và environment trong docs/proof/phase-1.

## Complexity Tracking

Không có vi phạm cần ngoại lệ; không ECS/physics engine/backend hoặc hệ thống phase tương lai.
