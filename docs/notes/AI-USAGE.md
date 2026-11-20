# Token AI theo phase — đối soát sau phát hành

Ngày2026-11-20, bổ sung theo yêu cầu người dùng sau khi đã phát hành. Đây là ghi chép
bổ sung; không đổi tag hay giả vờ số liệu đã được ghi trước thời điểm bàn giao.

Tìm thấy `token_usage_record` trong log Codex cục bộ của đúng workspace, gồm phiên chính
và agent `runtime_research`. Dữ liệu đo ở cấp response; **phân bổ theo phase là ước tính
dựa trên thời điểm**, không phải suy token từ số dòng code. Model trong metadata:
`gpt-6.1-sol`. Repo chỉ lưu số liệu đã lọc, không chứa hội thoại, credential hay log gốc.

| Phase | Responses | Input chưa cache | Input được cache | Output | Tổng token |
|---|---:|---:|---:|---:|---:|
| Phase1 | 115 | 360.147 | 23.112.832 | 87.433 | **23.560.412** |
| Phase2 | 64 | 143.068 | 9.848.320 | 54.146 | **10.045.534** |
| Phase3 | 44 | 63.129 | 10.929.920 | 42.329 | **11.035.378** |
| Phase4 | 102 | 453.946 | 13.308.416 | 67.422 | **13.829.784** |
| **Bốn phase** | **325** | **1.020.290** | **57.199.488** | **251.330** | **58.471.108** |

Dấu chấm trong bảng là phân cách hàng nghìn. Cache chiếm **98,25% input**. Tổng58,47triệu
bao gồm context được gửi lại qua nhiều response, phần lớn đã cache; không phải58,47triệu
token mới viết hoặc token tính giá input chưa cache. Tổng input mới + output là1.271.620.
Reasoning54.968 đã nằm trong output251.330, không cộng lần nữa.

Tách riêng, không ép vào một phase:

- Chuẩn bị harness/constitution/cài skill trước yêu cầu triển khai Phase1: **4.875.959**token.
- Kiểm tra nộp bài sau phát hành, trước yêu cầu audit này: **948.281**token.
- Tổng bao gồm hai nhóm trên: **64.295.348**token. Công việc audit hiện tại và hoạt động
  sau cutoff không tính ngược vào sản phẩm đã phát hành.

## Nguồn, khoảng thời gian và công thức

Script: [audit-ai-usage.py](../../scripts/audit-ai-usage.py).
Dữ liệu: [ai-usage.json](ai-usage.json), gồm usage từng response đã băm ID, hash snapshot
nguồn, khoảng thời gian và tổng từng nhóm. Không đưa session log thô lên GitHub.

Các khoảng là `[bắt đầu, kết thúc)`, UTC:

| Nhóm | Bắt đầu | Kết thúc | Căn cứ |
|---|---|---|---|
| Chuẩn bị | Session bắt đầu07:37:06.380 | 08:12:06.027 | Yêu cầu triển khai Phase1 |
| Phase1 | 08:12:06.027 | 08:58:04.000 | Commit tagphase-1, gồm sửa A/D và chốt tag |
| Phase2 | 08:58:04.000 | 09:32:15.581 | Yêu cầu chuyển Phase3 |
| Phase3 | 09:32:15.581 | 10:11:09.523 | Yêu cầu chuyển Phase4 |
| Phase4 | 10:11:09.523 | 10:45:17.000 | Commit nhật ký xác nhận phát hành |
| Rà soát nộp | 10:45:17.000 | 11:01:36.852 | Trước yêu cầu audit token |

1. Chỉ đọc body log khi `session_meta.cwd` trùng đúng workspace.
2. Chỉ lấy `token_usage_record` có `payload.thread_id` đúng session, loại history kế thừa
   từ parent trong log agent con; deduplicate theo `response_id` giữa các nguồn.
3. Cộng **usage từng response**, không cộng `thread_token_usage`, `turn_token_usage` hoặc
   các event `token_count` tích lũy. Gán phase theo timestamp hoàn thành response.
4. `uncached_input = input - cached_input`; `total = input + output`. Cached input là
   tập con của input; reasoning là tập con của output. Script assert các bất biến này.

Lệnh tái tính trên máy có log nguồn, không cần API/key:

```sh
python scripts/audit-ai-usage.py --sessions-root "<Codex home>/sessions"
```

Người clone repo có thể kiểm tra tổng từ các response đã lọc trong JSON, nhưng không
thể tái đọc log gốc của máy tác giả. Snapshot hash chỉ nhận diện bản log lúc audit;
log phiên đang hoạt động có thể tiếp tục tăng sau đó. Số liệu không bảo đảm bao gồm
những lần lỗi không ghi usage, hay công cụ/phiên khác không có trong hai nguồn đã tìm.

## Chi phí và cách tiết kiệm

**Chưa xác định số tiền**: log có token nhưng không có hóa đơn/đơn giá được xác minh
cho model/tài khoản này. Không suy chi phí thuê bao thành phí API, không lấy giá model
khác để điền. Rubric cho phép ghi token **hoặc** chi phí; bảng trên cung cấp token có
nguồn thay cho ghi chung “chưa đo”. Nếu có đúng đơn giá USD/triệu token:

`chi_phí = (uncached_input × giá_input + cached_input × giá_cache + output × giá_output) / 1.000.000`.

Phase1 dùng core thuần/node:test và ít dependency; Phase2 tái dùng map/core/test, chỉ nạp
Ticket02; Phase3 dùng bảng luật thay thế và22scenario để tránh điều tra lại yêu cầu cũ;
Phase4 tái dùng hồi quy, chia research/review khỏi triển khai và giữ log benchmark.
Cache reuse cao là số quan sát được, không chứng minh tiết kiệm98,25% tiền. Context vẫn
rất lớn và gửi lại nhiều lần: nếu làm lại sẽ cắt output tool dài, tóm tắt mốc sớm hơn,
chỉ đọc phần file liên quan và gom các bước kiểm tra độc lập để giảm số lượt gọi.
