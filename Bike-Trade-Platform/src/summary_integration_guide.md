# Escrow Flow Integration Guide (FE & Mobile)
*Cập nhật: 15-16/03/2026*

Tài liệu này tổng hợp lại toàn bộ các thay đổi về luồng **Thanh toán (Payment)** và **Đặt cọc (Escrow)** ở phía Backend trong 2 ngày qua, đồng thời hướng dẫn team Frontend (Web) và Mobile App cách tích hợp.

---

## I. Tổng hợp các thay đổi ở Backend

### 1. Luồng Payment / Escrow (4 Giai đoạn)
- **Hỗ trợ cọc 10%:** Cho phép mọi order trả trước 10% thay vì trả 100%. (Bỏ điều kiện giá xe > 2 triệu mới được cọc).
- **Phase 1 (Lock):** Khi buyer thanh toán thành công khoản tiền cọc (DEPOSIT) qua PayOS, Order chuyển sang `DEPOSITED` và xe (Listing) tự động chuyển sang `RESERVED` (khóa không cho người khác mua).
- **Phase 2 (Seller Confirm):** Seller có quyền `Confirm` hoặc `Reject` order.
    - Confirm: Order -> `CONFIRMED`.
    - Reject: Order -> `CANCELLED_BY_SELLER`, Listing -> `ACTIVE`, và trigger hoàn tiền cọc (Refund).
- **Phase 3 (Remainder Payment):** Buyer trả nốt 90% còn lại (REMAINING). Khi thanh toán thành công, Order chuyển sang `PAID` (Đã thanh toán đủ, chờ giao dịch thực tế để `COMPLETED`).
- **Phase 4 (SLA Timeout - CronJob):** Khởi tạo SLA 3 phút (dùng cho test) ép buyer phải thanh toán khoản REMAINING trong vòng 3 phút kể từ khi Seller Confirm. Nếu quá hạn, Order -> `FORFEITED` (Mất cọc) và hệ thống trả xe về `ACTIVE`. Mất cọc sẽ được Admin xử lý thủ công qua Transfer module.

### 2. Xử lý Chuyển hướng thanh toán (Redirect) theo Nền tảng
- API tạo link PayOS (`POST /payment/create-for-order` và `createPaymentLinkForListing` v.v.) nay nhận thêm body parameter rẽ nhánh `platform`: `'WEB' | 'MOBILE'`.
- Backend tự động render `returnUrl` và `cancelUrl` an toàn theo `platform` dựa vào biến môi trường (`WEB_URL_BASE` và `MOBILE_DEEP_LINK_BASE`).

---

## II. Hướng dẫn Tích hợp cho Frontend (Web) & Mobile App

### 1. Tạo Link Thanh Toán
Khi gọi API tạo Order hoặc Payment Link (`POST /payment/create-for-order`), FE/Mobile **phải** truyền thêm trường `platform`. Tùy theo giai đoạn mà chọn `paymentStage`.

**Ví dụ Payload (Tạo link Đặt cọc hoặc Trả thẳng)**
```json
{
  "orderId": "uuid-cua-order",
  "paymentStage": "DEPOSIT", // Trả lần 1 (Cọc)
  "platform": "WEB"          // Gửi từ FE Web (hoặc "MOBILE" nếu gọi từ App)
}
```

**Ví dụ Payload (Tạo link Trả Nốt 90% khi Order đã CONFIRMED)**
```json
{
  "orderId": "uuid-cua-order",
  "paymentStage": "REMAINING", // Trả phần còn lại
  "platform": "MOBILE"         // Gửi từ App
}
```
*Lưu ý: Nếu không gửi `platform`, hệ thống sẽ mặc định tính là `MOBILE`.*

### 2. Xử lý Callback (Return URL / Cancel URL)
Dựa vào `platform` bạn gửi, PayOS sẽ redirect về đúng luồng môi trường của bạn sau khi User quét mã QR xong:

**Dành cho FE (WEB):**
PayOS sẽ redirect trình duyệt của user về Web URL (dựa trên config `WEB_URL_BASE` của Backend). Bạn cần cấu hình React Router đón URL này.
- **Thành công:** `http://localhost:3000/payment/success?orderCode=123&id=...`
- **Hủy bỏ:** `http://localhost:3000/payment/cancel?orderCode=123&id=...`

**Dành cho Mobile App:**
PayOS sẽ redirect qua Deep Link của App (dựa trên config `MOBILE_DEEP_LINK_BASE` của Backend, thường là format Custom Scheme `biketrade://` hoặc Universal Link).
- **Thành công:** `biketrade://payment/success?orderCode=123&id=...`
- **Hủy bỏ:** `biketrade://payment/cancel?orderCode=123&id=...`
*(Lắng nghe `Linking` (React Native) hoặc `uni.onAppShow` (UniApp) để bóc tách query param).*

### 3. API Seller Xử lý Đơn Hàng (Chỉ áp dụng các Order đã DEPOSITED)
Sau khi buyer cọc xong, ở màn hình Quản lý của Seller sẽ cần 2 nút:

**Nút Xác Nhận (Confirm)**
- Endpoint: `PATCH /orders/:id/seller-confirm`
- Hệ quả: Order chuyển trạng thái `CONFIRMED`. Kích hoạt countdown đếm ngược 3 phút (Test Mode).

**Nút Từ chối (Reject)**
- Endpoint: `PATCH /orders/:id/seller-reject`
- Body: `{ "reason": "Lý do hủy" }`
- Hệ quả: Hủy order, trả lại xe lên sàn (`ACTIVE`), Admin nhận ticket báo hoàn cọc.

### 4. Luồng xử lý UI gợi ý cho Buyer
1. Check `order.status`:
    - Nếu là `PENDING`: Hiện thị nút thanh toán cọc (`paymentStage: 'DEPOSIT'`).
    - Nếu là `DEPOSITED`: Hiện thông báo "Đang chờ người bán xác nhận".
    - Nếu là `CONFIRMED`: **Đếm ngược thời gian (hiện tại là 3 phút)**. Hiển thị UI Cảnh Báo khẩn cấp: Nút "Thanh toán nốt 90%" (`paymentStage: 'REMAINING'`).
    - Nếu quá hạn 3 phút (cron job chạy): Màn hình sẽ thấy trạng thái Order bị đổi sang `FORFEITED` (Mất cọc).
    - Nếu là `PAID`: Hiện giao diện "Đã thanh toán đủ, vui lòng nhận xe". Nút "Hoàn tất giao dịch" để chuyển sang `COMPLETED` sẽ dùng endpoint [completeOrder](file:///e:/FPT/WDP301/Backend/src/modules/Order/order.service.ts#718-759) bình thường.
