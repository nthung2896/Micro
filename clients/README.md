# Thư Mục Clients (Frontend Multi-Client & Central Portal)

Thư mục này chứa các ứng dụng Frontend độc lập trong hệ thống Microservices:

- `portal-client/` (Cổng Đăng Nhập Tập Trung & Hub Chọn Dịch Vụ - Port 3000):
  - Đăng nhập một lần (Single Sign-On).
  - Màn hình App Launcher hiển thị các ứng dụng được cấp quyền (KPI, Phòng trọ, Quản trị, File).
  - Tự động chuyển giao Token (SSO Token Handoff) sang các phân hệ con.
- `kpi-client/` (Ứng Dụng Quản Lý & Đánh Giá KPI - Port 9696):
  - Phân hệ nghiệp vụ KPI, chấm điểm thi đua, tiến độ nhiệm vụ.
  - Có sẵn endpoint nhận token: `/auth/sso-callback?token=...`
- `asset-client/` (Ứng Dụng Quản Lý Tài Sản & Thiết Bị - Port 9797):
  - Phân hệ quản lý tài sản, cơ sở vật chất, cấp phát bàn giao, bảo dưỡng và khấu hao.
  - Có sẵn endpoint nhận token: `/auth/sso-callback?token=...`
- `room-client/` (Ứng Dụng Quản Lý Phòng Trọ & Ví Tiền - Port 4000):
  - Phân hệ quản lý đăng tin, bảng giá tin, nạp tiền ví.

---

## 🔗 Luồng Đăng Nhập & Chuyển Đổi Dịch Vụ (SSO Workflow)

1. Người dùng truy cập vào **`portal-client`** (`http://localhost:3000`).
2. Đăng nhập tài khoản ➡️ Backend `identity-service` (qua Gateway `http://localhost:5000/api/auth/login`) cấp mã Token JWT.
3. Người dùng vào màn hình **Chọn Dịch Vụ**:
   - Bấm **Hệ Thống Đánh Giá KPI**: Portal tự mở `http://localhost:9696/auth/sso-callback?token=<JWT>`.
   - `kpi-client` tự lưu token vào localStorage và đưa người dùng vào thẳng Dashboard làm việc!
