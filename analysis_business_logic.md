# Phân tích Thiết kế Cơ sở Dữ liệu & Nghiệp vụ (Node.js)

Để đáp ứng đầy đủ yêu cầu nghiệp vụ phức tạp của bạn (vay trả góp, xét duyệt tín dụng, nợ xấu, ưu đãi khách quen), hệ thống cần được mở rộng như sau:

### 1. Phân tích Cấu trúc Dữ liệu (Database Schema)

**A. Nâng cấp Bảng Khách Hàng (User)**
- Thêm `credit_score` (Điểm tín dụng CIC, từ 0 - 850). Điểm dưới 500 được xem là có rủi ro.
- Thêm `has_bad_debt` (Có nợ xấu hay không). Nếu `true` -> Cấm vay.
- Thêm `total_purchases` (Tổng số tiền đã mua). Dùng để phân hạng.
- Thêm `tier` (Hạng thành viên: Mới, Bạc, Vàng, Kim Cương). Khách hàng hạng cao sẽ được giảm giá % hoặc miễn lãi suất.

**B. Bảng Hợp đồng Vay (Installment)**
- Quản lý các khoản vay của khách hàng.
- Lưu trữ: Số tiền vay, Lãi suất, Kỳ hạn (tháng), Trạng thái (Đang trả, Đã tất toán, Chậm trả).
- *Quy tắc:* Khách hàng có 1 hợp đồng "Đang trả" mà muốn vay tiếp sẽ phải xét duyệt gắt gao hơn.

**C. Bảng Mã Ưu Đãi (Promotion)**
- Quản lý các chương trình khuyến mãi.
- Lưu trữ: Mã giảm giá, % giảm, Đối tượng áp dụng (Chỉ áp dụng cho Khách mua lần đầu, hoặc Khách Vàng).

### 2. Phân tích Luồng Nghiệp vụ (Workflow)

1. **Khách hàng Mới (Mua lần đầu):**
   - Hạng: `new`.
   - Ưu đãi: Chỉ được dùng mã "NEW_MOTO" (giảm 1 triệu).
   - Vay vốn: Xét duyệt bình thường dựa trên điểm tín dụng.

2. **Khách hàng Cũ (Mua lần sau):**
   - Hạng: `silver`, `gold` (do đã tích lũy `total_purchases`).
   - Ưu đãi: Được giảm giá trực tiếp (ví dụ Gold giảm 2%, Kim Cương giảm 5%) mà không cần nhập mã.

3. **Luồng Xét duyệt Vay (Loan Approval):**
   - Khách yêu cầu vay mua xe. Hệ thống tự động quét 3 điều kiện:
     1. Lịch sử `has_bad_debt` == true? -> ❌ TỪ CHỐI NGAY.
     2. Đang có Hợp đồng vay nào ở trạng thái `active` không? -> Nếu đang gánh nợ 1 xe khác thì ❌ TỪ CHỐI hoặc giảm hạn mức.
     3. Điểm tín dụng `credit_score` < 500? -> ❌ TỪ CHỐI.
     4. Nếu thỏa mãn hết -> ✅ DUYỆT.
