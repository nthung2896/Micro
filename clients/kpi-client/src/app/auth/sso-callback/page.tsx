"use client";
import { Result, Spin } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useDispatch } from "react-redux";
import authService from "@/services/auth/auth.service";
import { setUserInfo } from "@/store/auth/AuthSlice";
import { setMenuData } from "@/store/menu/MenuSlice";
import { AppDispatch } from "@/store/store";

const SsoCallback: React.FC = () => {
  const router = useRouter();
  const params = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const [error, setError] = useState<string | null>(null);
  // Guard chống chạy trùng: React 18 StrictMode (dev) gọi useEffect 2 lần,
  // và Keycloak `code` là dùng-một-lần nên tuyệt đối không được đổi/hydrate 2 lần.
  const redirecting = useRef(false);

  useEffect(() => {
    const token = params?.get("token");
    const idToken = params?.get("id_token");
    const code = params?.get("code");
    const err = params?.get("error");

    // Keycloak/BE trả về ?error=... -> hiển thị lỗi, dừng.
    if (err) {
      setError(err);
      return;
    }

    // =====================================================================
    // TRƯỜNG HỢP 1: Nhận `code` từ Keycloak
    // -> Đẩy sang BE (/api/SsoKeycloak/Callback) để BE đổi code lấy JWT của HỆ THỐNG MÌNH
    //    (BE sẽ tạo/đồng bộ tài khoản rồi redirect ngược lại đây kèm ?token=...).
    // =====================================================================
    if (code && !token) {
      if (redirecting.current) return;
      redirecting.current = true;
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/SsoKeycloak/Callback?code=${encodeURIComponent(code)}`;
      return;
    }

    // =====================================================================
    // TRƯỜNG HỢP 2: BE trả JWT về (?token=...)
    // -> LƯU token + SET TRẠNG THÁI "ĐÃ ĐĂNG NHẬP" vào Redux -> vào dashboard.
    //
    // Vì SSO trả JWT qua URL (KHÔNG kèm sẵn object user như login thường),
    // nên bước "set đã đăng nhập" ở đây = gọi GetInfo lấy user rồi nạp vào Redux.
    // Đây chính là phần tương đương `dispatch(setLogin(data))` của login username/password.
    // =====================================================================
    if (token) {
      if (redirecting.current) return;
      redirecting.current = true;

      // Dùng hàm async vì cần await GetInfo TRƯỚC khi điều hướng (để tránh vào
      // dashboard trong lúc Redux user còn null gây nhấp nháy / bị coi là chưa đăng nhập).
      const hydrateAndRedirect = async () => {
        try {
          // ---- B1. Lưu token vào localStorage ----
          // BẮT BUỘC lưu TRƯỚC khi gọi GetInfo: request interceptor trong
          // services/index.ts đọc localStorage["AccessToken"] để tự gắn
          // `Authorization: Bearer <token>`. Không lưu trước -> GetInfo thiếu token -> 401.
          localStorage.setItem("AccessToken", token);
          if (idToken) {
            // id_token của Keycloak: chỉ dùng cho luồng ĐĂNG XUẤT SSO (BuildLogoutUrl) sau này.
            localStorage.setItem("IdTokenHint", idToken);
          }

          // ---- B2. Gọi GetInfo lấy hồ sơ user + menu quyền ----
          const response = await authService.getInfo();

          if (response && ((response as any).data || (response as any).userName || (response as any).name)) {
            const resData = (response as any).data || response;
            const userRoles: string[] = [
              ...(resData.listRole || []),
              ...(resData.roles || []),
              ...(resData.vaiTro || []),
              resData.type || ''
            ].filter(Boolean);
            
            const hasKpiRole = userRoles.some(r => {
              const u = String(r).toUpperCase();
              return u === "ROLE_KPI" || u === "ADMIN" || u === "MANAGER";
            });
            
            if (!hasKpiRole) {
              localStorage.removeItem("AccessToken");
              localStorage.removeItem("IdTokenHint");
              setError(
                `Tài khoản @${resData.userName || ''} (${resData.name || 'Người dùng'}) chưa được phân quyền truy cập Phân hệ Đánh giá KPI (ROLE_KPI). Vui lòng quay lại Cổng SSO Portal để cấp quyền!`
              );
              return;
            }

            dispatch(setUserInfo(response)); // set state.auth.User
            dispatch(setMenuData(response)); // set state.menu.menuData
          } else {
            localStorage.removeItem("AccessToken");
            localStorage.removeItem("IdTokenHint");
            setError(
              "Đăng nhập SSO thất bại: không lấy được thông tin người dùng " +
                "(tài khoản có thể chưa được tạo/đồng bộ trên hệ thống).",
            );
            return;
          }

          // ---- B4. Điều hướng ----
          // Ưu tiên trang user định vào trước khi bị đá ra login (redirect_url do interceptor lưu),
          // mặc định về /dashboard.
          const redirect = localStorage.getItem("redirect_url");
          if (redirect) {
            localStorage.removeItem("redirect_url");
            router.replace(redirect);
          } else {
            router.replace("/dashboard");
          }
        } catch (e: any) {
          // GetInfo ném lỗi. Lưu ý: response interceptor (services/index.ts) đã "bóp" lỗi
          // thành CHUỖI (error.response.data.title) hoặc undefined, KHÔNG còn là axios error.
          // -> Dọn token để tránh trạng thái "nửa đăng nhập" rồi hiển thị lỗi.
          localStorage.removeItem("AccessToken");
          localStorage.removeItem("IdTokenHint");
          setError(
            typeof e === "string" && e
              ? e
              : "Đăng nhập SSO thất bại khi lấy thông tin người dùng.",
          );
        }
      };

      hydrateAndRedirect();
      return;
    }

    // Không có code/token/error hợp lệ.
    setError("Không nhận được mã xác thực hoặc token hợp lệ.");
  }, [params, router, dispatch]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f4f8]">
        <Result
          status="error"
          title="Đăng nhập SSO thất bại"
          subTitle={error}
          extra={
            <a href="/auth/login" className="text-blue-600 underline">
              Quay lại trang đăng nhập
            </a>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f4f8]">
      <Spin tip="Đang xử lý đăng nhập SSO..." size="large">
        <div style={{ minWidth: 240, minHeight: 80 }} />
      </Spin>
    </div>
  );
};

export default SsoCallback;
