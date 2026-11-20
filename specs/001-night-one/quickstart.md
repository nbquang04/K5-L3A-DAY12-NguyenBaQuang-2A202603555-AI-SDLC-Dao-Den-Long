# Quickstart validation

Node >=22. Sau clone, từ root:

```sh
npm ci
npm run build
npm start
```

Mở http://localhost:4173. WASD/mũi tên di chuyển, Space nhảy, E nạp, Q tỏa sáng,
kéo chuột xoay. Đi theo chấm sáng, gom 4 rồi nạp đèn, dùng pulse khi bị đuổi.
Thắp đủ năm đèn để thắng; hết 3 lửa hoặc 180 giây thì thua. Nút chơi lại reset lượt.

```sh
npm test
npm run verify
node src/headless/cli.mjs --seed 42 --night 1 --ticks 600 --out artifacts/run.jsonl
python scripts/verify.py --config verification/checks.json
```

Kỳ vọng: test đạt; CLI file có snapshot tick 0, step/event theo contract và một end;
run verify chạy scenario/replay và assertions. Xem report trong docs/proof/phase-1.
Đây là hướng dẫn kiểm chứng; chỉ ghi PASS trong báo cáo sau khi lệnh thật chạy.
