# Nguồn và giấy phép

- Phase 4: Playwright 1.65.1 (Apache-2.0, Microsoft) cho benchmark/QA/video; không nằm trong runtime web. https://github.com/microsoft/playwright
- FFmpeg (binary từ imageio-ffmpeg trong môi trường máy) chuyển bản ghi WebM thành MP4 H.264; chỉ phân phối video kết quả, không đóng gói binary FFmpeg. https://ffmpeg.org
- Screenshot/video là bản chạy thực tế của dự án. Không dùng ảnh/video AI giả lập gameplay.

- Mây, Bóng Mực, Đảo Đèn Lồng, PRD-0 và Test Contract: nội dung gốc của lab
  Day 12 AI SDLC trên artifact do giảng viên cung cấp. Dùng trong bài tập này;
  LICENSE của mã nguồn không cấp lại quyền sở hữu các nội dung lab.
- Mã game, đảo, nhân vật, cây, đèn, hạt sáng và toàn bộ mesh: tạo procedural bằng
  JavaScript/Three.js trong dự án với hỗ trợ Codex. Không tải model/texture/nhạc bên ngoài.
- Three.js 0.181.2: MIT, https://github.com/mrdoob/three.js ; bản LICENSE được copy vào dist/vendor.
- Spec Kit 1.4.3: toolkit chính thức https://github.com/github/spec-kit , MIT;
  các skill/template/script được giữ trong repo theo yêu cầu harness của lab.
- Font: Georgia/Arial/Times New Roman có sẵn trong hệ thống, không đóng gói font.
- Không có âm thanh trong Phase 1. Không sử dụng thương hiệu hoặc nhân vật game khác.
- Phase 2: nhạc và hiệu ứng âm thanh được tổng hợp procedural bằng Web Audio trong src/web/audio.mjs, không dùng audio/nhạc bên ngoài. Gió Lạc, Bùa Gió và bản đồ ba Đêm theo Ticket-02 của lab.

AI sử dụng: Codex để đặc tả, lập kế hoạch, viết code, test và tài liệu;
agent runtime_research hỗ trợ nghiên cứu và rà thiết kế kỹ thuật. Nhật ký ở docs/notes/ai-log.md.
