"use client";
import React from "react";
import {
  EnvironmentOutlined,
  ArrowUpOutlined,
  PhoneOutlined,
  MailOutlined,
  CustomerServiceFilled,
  ClockCircleOutlined,
  SafetyCertificateFilled,
} from "@ant-design/icons";
import Link from "next/link";
import { useSelector } from "@/store/hooks";
import { buildFileUrl } from "@/utils/file";

export default function PortalFooter() {
  const [showButton, setShowButton] = React.useState(false);
  const appConfig = useSelector((state: any) => state.general.appConfig);

  const appName = appConfig?.tenApp || "HỆ THỐNG QUẢN LÝ PHÒNG TRỌ";
  const doanhNghiep = appConfig?.tenDoanhNghiep || "";
  const logoSrc = appConfig?.logoLink ? buildFileUrl(appConfig.logoLink) : "/images/logo-phongtro.svg";
  const diaChi = appConfig?.diaChi || "Số 29 ngõ 1/62/46 Bùi Xương Trạch, Thanh Xuân, Hà Nội";
  const soDienThoai = appConfig?.soDienThoai || "0869 590 916";
  const email = appConfig?.email || "nthung2896@gmail.com";

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      className="text-white relative z-10 border-t border-blue-900 overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(135deg, #022045 0%, #034380 50%, #022b59 100%)`,
      }}
    >
      <div className="max-w-[1240px] mx-auto px-4 py-12">
        {/* Top bar: Brand */}
        <div className="flex flex-wrap items-center gap-4 pb-8 mb-8 border-b border-white/15">
          <img
            src={logoSrc}
            alt="logo"
            className="w-14 h-14 object-contain shrink-0 bg-white rounded-2xl p-1 shadow-lg"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/images/logo-phongtro.svg";
            }}
          />
          <div className="leading-tight text-white">
            <div className="text-xl sm:text-2xl font-black uppercase tracking-wide text-white">
              {appName}
            </div>
            <div className="text-xs sm:text-sm text-blue-200 font-semibold mt-1 tracking-wider uppercase">
              Sàn kết nối &amp; quản lý phòng trọ, căn hộ cho thuê uy tín hàng đầu
            </div>
          </div>
        </div>

        {/* 4 Cột nội dung */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* Cột 1 — Giới thiệu */}
          <div className="lg:col-span-4">
            <h3 className="text-sm font-bold uppercase mb-2 tracking-wider text-amber-300">
              Về chúng tôi
            </h3>
            <div className="w-10 h-[2px] bg-amber-300 mb-3" />
            <p className="text-sm leading-relaxed opacity-90 text-blue-100">
              {appName} là nền tảng kết nối trực tiếp giữa chủ nhà trọ và người có nhu cầu thuê phòng. Thông tin phòng trọ được xác thực minh bạch về giá thuê, điện nước và tiện ích thực tế, giúp tiết kiệm tối đa thời gian tìm kiếm.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-300">
              <SafetyCertificateFilled className="text-base" />
              <span>Tin đăng kiểm duyệt xác thực 100%</span>
            </div>
          </div>

          {/* Cột 2 — Dành cho khách thuê */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-bold uppercase mb-2 tracking-wider text-amber-300">
              Khách thuê phòng
            </h3>
            <div className="w-10 h-[2px] bg-amber-300 mb-3" />
            <ul className="space-y-2 text-sm text-blue-100">
              <li>
                <Link href="/?loai=phong-tro" className="hover:text-amber-300 transition-colors">
                  Phòng trọ giá rẻ
                </Link>
              </li>
              <li>
                <Link href="/?loai=chung-cu-mini" className="hover:text-amber-300 transition-colors">
                  Chung cư mini
                </Link>
              </li>
              <li>
                <Link href="/?loai=can-ho" className="hover:text-amber-300 transition-colors">
                  Căn hộ dịch vụ
                </Link>
              </li>
              <li>
                <Link href="/?loai=mbkd" className="hover:text-amber-300 transition-colors">
                  Mặt bằng kinh doanh
                </Link>
              </li>
              <li>
                <Link href="/cam-nang-thue-phong" className="hover:text-amber-300 transition-colors">
                  Kinh nghiệm thuê phòng
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3 — Dành cho chủ trọ */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-bold uppercase mb-2 tracking-wider text-amber-300">
              Dành cho chủ nhà
            </h3>
            <div className="w-10 h-[2px] bg-amber-300 mb-3" />
            <ul className="space-y-2 text-sm text-blue-100">
              <li>
                <Link href="/auth/login?redirect=/dashboard" className="hover:text-amber-300 transition-colors font-bold text-amber-300">
                  + Đăng tin cho thuê mới
                </Link>
              </li>
              <li>
                <Link href="/bang-gia" className="hover:text-amber-300 transition-colors">
                  Bảng giá gói tin VIP &amp; Đẩy tin
                </Link>
              </li>
              <li>
                <Link href="/huong-dan-dang-tin" className="hover:text-amber-300 transition-colors">
                  Quy chế hoạt động sàn
                </Link>
              </li>
              <li>
                <Link href="/giai-quyet-kieu-nai" className="hover:text-amber-300 transition-colors">
                  Chính sách bảo mật &amp; cọc
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4 — Liên hệ & Hỗ trợ */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-bold uppercase mb-2 tracking-wider text-amber-300">
              Hỗ trợ &amp; Liên hệ
            </h3>
            <div className="w-10 h-[2px] bg-amber-300 mb-3" />
            <div className="space-y-2.5 text-sm text-blue-100">
              <div className="flex items-start gap-2">
                <EnvironmentOutlined className="text-amber-300 mt-1 shrink-0" />
                <span>{diaChi}</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneOutlined className="text-amber-300 shrink-0" />
                <span>Hotline: <b className="text-white text-base">{soDienThoai}</b></span>
              </div>
              <div className="flex items-center gap-2">
                <MailOutlined className="text-amber-300 shrink-0" />
                <span>Email: {email}</span>
              </div>
              <div className="flex items-center gap-2">
                <ClockCircleOutlined className="text-amber-300 shrink-0" />
                <span>Hỗ trợ: 08:00 - 22:00 (Tất cả các ngày)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-blue-200">
          <div>
            © {new Date().getFullYear()} {appName}. Tất cả các quyền được bảo lưu.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dieu-khoan" className="hover:text-white transition-colors">
              Điều khoản sử dụng
            </Link>
            <span>•</span>
            <Link href="/chinh-sach-bao-mat" className="hover:text-white transition-colors">
              Chính sách bảo mật
            </Link>
            <span>•</span>
            <Link href="/auth/login" className="hover:text-white transition-colors">
              Trang quản trị
            </Link>
          </div>
        </div>
      </div>

      {/* Nút cuộn lên đầu trang */}
      {showButton && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 flex items-center justify-center w-11 h-11 rounded-full text-white bg-blue-600 hover:bg-blue-700 shadow-xl cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <ArrowUpOutlined style={{ fontSize: "18px", fontWeight: "bold" }} />
        </button>
      )}
    </footer>
  );
}
