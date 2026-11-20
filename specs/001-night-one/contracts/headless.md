# Headless interface — Test Contract v1.0

Nguồn: artifact Phase 1, bản trích tại docs/requirements/phase-1-source.ax.txt.

```text
node src/headless/cli.mjs --seed <int> --night 1 [--scenario <file.json>]
  [--inputs <file.json>] --ticks <int> --out <file.jsonl> [--snapshot-every <int>]
```

snapshot-every mặc định 10, seed mặc định 1 nếu bỏ (mở rộng tiện dụng); --night 1,
--ticks và --out bắt buộc. Tick không âm, snapshot-every nguyên dương. Thành công 0;
JSON hoặc schema inputs/scenario sai 2, chẩn đoán stderr; lỗi I/O khác 1.
stdout không chứa log gameplay. Không GPU, không cửa sổ.

Input: `{frames:[{tick:0,move:[0,1],cam_yaw_deg:0,jump:false,interact:false,pulse:false}]}`.
Move/yaw/nút mặc định 0/false; field vắng giữ cũ; tick tăng nghiêm ngặt.
Dash boolean được nhận nhưng Phase 1 không có hành động dash.

Scenario: player.pos/carried/flames tùy chọn; random_motes/random_shades boolean;
motes mảng vector; shades mảng {id?,pos}; lanterns patch {id,pos?,deposited?,lit?};
time_left_s tùy chọn. Mảng rỗng thay thế. Khởi tạo không event/điểm.

Snapshot: type=snapshot, tick=sim_tick, state, time_left_s, score,
player {pos,flames,carried}, lanterns [{id,pos,lit,deposited}],
shades [{id,pos,state}], motes_active và motes [{id,pos}].
Tọa độ làm tròn 3 chữ số; snapshot 0 và mỗi chu kỳ; không ép snapshot ngoài chu kỳ.

Event: {type:event,tick,name,data}. Data chính xác:

- mote_picked: {carried}
- deposit: {lantern_id,amount,deposited}
- lantern_lit: {lantern_id}
- pulse: {stunned_ids}
- player_hit: {by:shade,flames,dropped}; dropped=0 theo tuning
- shade_spawned: {id}
- game_over: {result,reason}

End duy nhất ở cuối: {type:end,ticks,state,score}. Dừng N bước hoặc terminal.
Scenario đã đủ đèn/hết lửa/hết giờ được đánh giá bước đầu (quyết định dự án).
