"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Radio,
  InputNumber,
  Tag,
  Modal,
  message,
  Spin,
  Table,
  Divider,
  Alert,
  Tooltip,
} from "antd";
import {
  WalletOutlined,
  QrcodeOutlined,
  CreditCardOutlined,
  BankOutlined,
  HistoryOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  GiftOutlined,
  CopyOutlined,
  ArrowRightOutlined,
  UserOutlined,
  PhoneOutlined,
  TagOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
  CrownOutlined,
  RocketOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import withAuthorization from "@/libs/authentication";
import viTienService from "@/services/viTien/viTienService";
import {
  ViTienType,
  GiaoDichNapTienType,
  LichSuThanhToanType,
  CauHinhKhuyenMaiType,
  ThongTinNganHangType,
} from "@/types/viTien/viTien";
import { useSelector } from "@/store/hooks";
import { buildFileUrl } from "@/utils/file";

const QUICK_AMOUNTS = [
  { value: 100000, label: "100.000 đ" },
  { value: 200000, label: "200.000 đ" },
  { value: 500000, label: "500.000 đ" },
  { value: 1000000, label: "1.000.000 đ", badge: "+10%" },
  { value: 2000000, label: "2.000.000 đ", badge: "+15%" },
  { value: 5000000, label: "5.000.000 đ", badge: "+25%" },
  { value: 10000000, label: "10.000.000 đ", badge: "+30%" },
];

const QuanLyGiaoDichPage: React.FC = () => {
  const currentUser = useSelector((state) => state.auth.User);
  const [activeTab, setActiveTab] = useState<"NAP_TIEN" | "LICHSU_NAP" | "LICHSU_THANHTOAN">("NAP_TIEN");

  const [loading, setLoading] = useState<boolean>(true);
  const [wallet, setWallet] = useState<ViTienType | null>(null);
  const [promotions, setPromotions] = useState<CauHinhKhuyenMaiType[]>([]);
  const [bankInfo, setBankInfo] = useState<ThongTinNganHangType | null>(null);
  const [depositHistory, setDepositHistory] = useState<GiaoDichNapTienType[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<LichSuThanhToanType[]>([]);

  // Form nạp tiền
  const [phuongThuc, setPhuongThuc] = useState<"VIETQR" | "MOMO" | "VNPAY" | "BANK_TRANSFER">("VIETQR");
  const [soTienNap, setSoTienNap] = useState<number>(500000);
  const [submittingDeposit, setSubmittingDeposit] = useState<boolean>(false);

  // Modal hiển thị mã QR thanh toán
  const [modalQrVisible, setModalQrVisible] = useState<boolean>(false);
  const [currentGiaoDich, setCurrentGiaoDich] = useState<GiaoDichNapTienType | null>(null);
  const [confirmingDeposit, setConfirmingDeposit] = useState<boolean>(false);

  // Tải dữ liệu ban đầu
  const loadData = async () => {
    try {
      setLoading(true);
      const [walletRes, promoRes, bankRes] = await Promise.all([
        viTienService.getThongTinVi(),
        viTienService.getKhuyenMai(),
        viTienService.getThongTinNganHang(),
      ]);

      if (walletRes && walletRes.status && walletRes.data) {
        setWallet(walletRes.data);
      }
      if (promoRes && promoRes.status && promoRes.data) {
        setPromotions(promoRes.data);
      }
      if (bankRes && bankRes.status && bankRes.data) {
        setBankInfo(bankRes.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin ví tiền:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadLichSuNap = async () => {
    try {
      const res = await viTienService.getLichSuNap();
      if (res && res.status && res.data) {
        setDepositHistory(res.data);
      }
    } catch (err) {
      console.error("Lỗi tải lịch sử nạp:", err);
    }
  };

  const loadLichSuThanhToan = async () => {
    try {
      const res = await viTienService.getLichSuThanhToan();
      if (res && res.status && res.data) {
        setPaymentHistory(res.data);
      }
    } catch (err) {
      console.error("Lỗi tải lịch sử thanh toán:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === "LICHSU_NAP") {
      loadLichSuNap();
    } else if (activeTab === "LICHSU_THANHTOAN") {
      loadLichSuThanhToan();
    }
  }, [activeTab]);

  // Tính khuyến mãi ước tính theo số tiền đang chọn
  const calculateEstimatedBonus = (amount: number) => {
    let bonus = 0;
    // Kiểm tra nạp lần đầu nếu chưa nạp lần nào
    if (!wallet || wallet.tongNap === 0) {
      if (amount >= 100000) {
        bonus += 50000;
      }
    }
    // Tính bậc thang
    if (amount >= 10000000) {
      bonus += amount * 0.3;
    } else if (amount >= 5000000) {
      bonus += amount * 0.25;
    } else if (amount >= 2000000) {
      bonus += amount * 0.15;
    } else if (amount >= 1000000) {
      bonus += amount * 0.1;
    }
    return bonus;
  };

  const estimatedBonus = calculateEstimatedBonus(soTienNap || 0);
  const totalReceived = (soTienNap || 0) + estimatedBonus;

  // Xử lý tạo lệnh nạp tiền
  const handleCreateDeposit = async () => {
    if (!soTienNap || soTienNap < 10000) {
      message.error("Số tiền nạp tối thiểu là 10.000 đ");
      return;
    }

    try {
      setSubmittingDeposit(true);
      const res = await viTienService.taoYeuCauNap({
        soTienNap,
        phuongThuc,
      });

      if (res && res.status && res.data) {
        setCurrentGiaoDich(res.data);
        setModalQrVisible(true);
        message.success("Đã tạo yêu cầu nạp tiền! Vui lòng quét mã để chuyển khoản.");
      } else {
        message.error(res?.message || "Không thể tạo yêu cầu nạp tiền");
      }
    } catch (err: any) {
      console.error("Lỗi tạo yêu cầu nạp:", err);
      message.error(err?.response?.data?.message || "Lỗi kết nối máy chủ");
    } finally {
      setSubmittingDeposit(false);
    }
  };

  // Xác nhận nạp tiền (giả lập / xác nhận giao dịch)
  const handleConfirmDeposit = async (maGiaoDich: string) => {
    try {
      setConfirmingDeposit(true);
      const res = await viTienService.xacNhanNapTien(maGiaoDich);
      if (res && res.status) {
        message.success("Thanh toán thành công! Tiền đã được cộng vào số dư ví.");
        setModalQrVisible(false);
        await loadData();
        if (activeTab === "LICHSU_NAP") {
          await loadLichSuNap();
        }
      } else {
        message.error(res?.message || "Xác nhận nạp tiền thất bại");
      }
    } catch (err: any) {
      message.error("Có lỗi khi xác nhận giao dịch");
    } finally {
      setConfirmingDeposit(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      message.success(`Đã sao chép ${label}!`);
    }
  };

  const userAvatar = currentUser?.picture
    ? buildFileUrl(currentUser.picture)
    : "/images/default-avatar.svg";

  return (
    <div className="w-full py-4 px-3 sm:px-6">
      {/* Layout 2 cột: Sidebar trái & Nội dung chính chuẩn phongtro123 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ===================== CỘT TRÁI: SIDEBAR THÔNG TIN ===================== */}
        <div className="lg:col-span-3 space-y-4">
          {/* Card Thông tin người dùng & Số dư */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 text-center">
            <div className="relative inline-block mx-auto mb-3">
              <div className="w-20 h-20 rounded-full ring-4 ring-blue-50 border-2 border-white shadow-md overflow-hidden bg-slate-100 flex items-center justify-center">
                <img
                  src={userAvatar}
                  alt={currentUser?.name || "User"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/default-avatar.svg";
                  }}
                />
              </div>
              <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>

            <h3 className="font-bold text-gray-800 text-base mb-0.5">
              {currentUser?.name || currentUser?.userName || "Khách hàng"}
            </h3>
            <div className="text-xs text-gray-500 flex items-center justify-center gap-1.5 mb-2">
              <PhoneOutlined className="text-gray-400" />
              <span>{currentUser?.phoneNumber || "Chưa cập nhật SĐT"}</span>
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full mb-4">
              <span>Mã tài khoản:</span>
              <span className="text-[#0355a2]">#{currentUser?.userName || currentUser?.id?.slice(0, 8) || "168079"}</span>
            </div>

            {/* Box Số dư tài khoản nổi bật chuẩn Phongtro123 */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 rounded-xl p-4 text-left shadow-xs">
              <div className="text-xs text-amber-800 font-medium mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <WalletOutlined className="text-amber-600" /> Số dư tài khoản
                </span>
                <button
                  type="button"
                  onClick={loadData}
                  className="text-amber-700 hover:text-amber-900 transition-colors p-1"
                  title="Làm mới số dư"
                >
                  <ReloadOutlined className={loading ? "animate-spin" : ""} />
                </button>
              </div>

              <div className="text-2xl font-black text-amber-900 tracking-tight mb-2">
                {wallet ? (wallet.soDuChinh + wallet.soDuKhuyenMai).toLocaleString("vi-VN") : "0"} <span className="text-base font-bold">đ</span>
              </div>

              {wallet && wallet.soDuKhuyenMai > 0 && (
                <div className="text-[11px] text-amber-700 mb-3 bg-white/70 px-2 py-1 rounded border border-amber-200/60">
                  <span>Chính: <b>{wallet.soDuChinh.toLocaleString("vi-VN")} đ</b></span>
                  <span className="mx-1">•</span>
                  <span>KM: <b className="text-emerald-700">+{wallet.soDuKhuyenMai.toLocaleString("vi-VN")} đ</b></span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setActiveTab("NAP_TIEN")}
                className="w-full py-2 px-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-900 font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <ThunderboltOutlined /> Nạp tiền ngay
              </button>
            </div>
          </div>

          {/* Menu Điều hướng nhanh phongtro123 */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-3 space-y-1 text-sm font-medium">
            <Link
              href="/phongTro/dangtinmienphi"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-[#0355a2] transition-colors"
            >
              <RocketOutlined className="text-gray-400" /> Đăng tin mới
            </Link>

            <Link
              href="/phongTro/danhsachtindang"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-[#0355a2] transition-colors"
            >
              <CalendarOutlined className="text-gray-400" /> Danh sách tin đăng
            </Link>

            <button
              type="button"
              onClick={() => setActiveTab("NAP_TIEN")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-colors cursor-pointer border-none outline-none ${
                activeTab === "NAP_TIEN"
                  ? "bg-[#0355a2] !text-white font-bold shadow-xs"
                  : "bg-transparent text-gray-700 hover:bg-blue-50 hover:text-[#0355a2]"
              }`}
            >
              <WalletOutlined className={activeTab === "NAP_TIEN" ? "!text-white text-base" : "text-gray-400 text-base"} />
              <span className={activeTab === "NAP_TIEN" ? "!text-white font-bold" : ""}>
                Nạp tiền vào tài khoản
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("LICHSU_NAP")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-colors cursor-pointer border-none outline-none ${
                activeTab === "LICHSU_NAP"
                  ? "bg-[#0355a2] !text-white font-bold shadow-xs"
                  : "bg-transparent text-gray-700 hover:bg-blue-50 hover:text-[#0355a2]"
              }`}
            >
              <HistoryOutlined className={activeTab === "LICHSU_NAP" ? "!text-white text-base" : "text-gray-400 text-base"} />
              <span className={activeTab === "LICHSU_NAP" ? "!text-white font-bold" : ""}>
                Lịch sử nạp tiền
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("LICHSU_THANHTOAN")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-colors cursor-pointer border-none outline-none ${
                activeTab === "LICHSU_THANHTOAN"
                  ? "bg-[#0355a2] !text-white font-bold shadow-xs"
                  : "bg-transparent text-gray-700 hover:bg-blue-50 hover:text-[#0355a2]"
              }`}
            >
              <CreditCardOutlined className={activeTab === "LICHSU_THANHTOAN" ? "!text-white text-base" : "text-gray-400 text-base"} />
              <span className={activeTab === "LICHSU_THANHTOAN" ? "!text-white font-bold" : ""}>
                Lịch sử thanh toán
              </span>
            </button>

            <Link
              href="/bang-gia"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-[#0355a2] transition-colors"
            >
              <TagOutlined className="text-gray-400" /> Bảng giá dịch vụ
            </Link>

            <Link
              href="/taikhoannguoidung"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-[#0355a2] transition-colors"
            >
              <UserOutlined className="text-gray-400" /> Quản lý tài khoản
            </Link>
          </div>
        </div>

        {/* ===================== CỘT PHẢI: NỘI DUNG CHÍNH ===================== */}
        <div className="lg:col-span-9 space-y-5">
          {/* Header tiêu đề và các tab switch */}
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 pb-0">
            <h1 className="text-2xl font-black text-gray-800 tracking-tight mb-2">
              Quản lý giao dịch
            </h1>
            <p className="text-xs text-gray-500 mb-5">
              Nạp tiền trực tuyến tự động 24/7, quản lý lịch sử giao dịch và theo dõi biến động số dư tài khoản
            </p>

            {/* 3 Tabs Điều Hướng */}
            <div className="flex items-center gap-8 border-b border-gray-200 overflow-x-auto select-none">
              <button
                type="button"
                onClick={() => setActiveTab("NAP_TIEN")}
                className={`pb-3.5 font-bold text-sm transition-all border-b-2 cursor-pointer whitespace-nowrap outline-none flex items-center gap-2 ${
                  activeTab === "NAP_TIEN"
                    ? "border-[#0355a2] text-[#0355a2]"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <WalletOutlined /> Nạp tiền vào tài khoản
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("LICHSU_NAP")}
                className={`pb-3.5 font-bold text-sm transition-all border-b-2 cursor-pointer whitespace-nowrap outline-none flex items-center gap-2 ${
                  activeTab === "LICHSU_NAP"
                    ? "border-[#0355a2] text-[#0355a2]"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <HistoryOutlined /> Lịch sử nạp tiền
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("LICHSU_THANHTOAN")}
                className={`pb-3.5 font-bold text-sm transition-all border-b-2 cursor-pointer whitespace-nowrap outline-none flex items-center gap-2 ${
                  activeTab === "LICHSU_THANHTOAN"
                    ? "border-[#0355a2] text-[#0355a2]"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                <CreditCardOutlined /> Lịch sử thanh toán
              </button>
            </div>
          </div>

          {/* ===================== TAB 1: NẠP TIỀN VÀO TÀI KHOẢN ===================== */}
          {activeTab === "NAP_TIEN" && (
            <div className="space-y-5">
              {/* Banner 1: Ưu đãi thành viên mới (Mô phỏng chuẩn ảnh 1 Phongtro123) */}
              <div className="bg-gradient-to-r from-cyan-50 via-sky-50 to-blue-50 border border-sky-200/80 rounded-2xl p-5 shadow-xs relative overflow-hidden">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 text-white flex items-center justify-center text-2xl shrink-0 shadow-sm">
                    🎉
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-black text-sky-950 tracking-tight">
                        Ưu đãi thành viên mới
                      </h3>
                      <Tag color="cyan" className="font-semibold">Hot</Tag>
                    </div>
                    <p className="text-xs sm:text-sm text-sky-900 leading-relaxed">
                      Tặng ngay <b className="text-red-600 font-bold">50.000đ</b> khi nạp lần đầu từ{" "}
                      <b className="text-gray-900 font-bold">100.000đ</b> trở lên. Chỉ áp dụng trong 72 giờ đầu kể từ khi đăng ký tài khoản.
                    </p>
                    <div className="mt-2.5 flex items-center gap-2 text-xs text-emerald-800 font-medium">
                      <CheckCircleOutlined className="text-emerald-600" />
                      <span>Được áp dụng đồng thời với chương trình ưu đãi nạp tiền hiện hành.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Banner 2: Bảng Mốc Ưu Đãi Nạp Tiền (10%, 15%, 25%, 30%) */}
              <div className="bg-gradient-to-r from-blue-50/60 to-indigo-50/60 border border-blue-200/70 rounded-2xl p-5 shadow-xs">
                <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <GiftOutlined className="text-[#0355a2]" /> Ưu đãi nạp tiền:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white/80 border border-blue-100 p-2.5 rounded-xl shadow-2xs">
                    <span className="text-gray-500 block">Nạp từ 1M - dưới 2M</span>
                    <span className="font-black text-[#0355a2] text-sm">Tặng 10%</span>
                  </div>
                  <div className="bg-white/80 border border-blue-100 p-2.5 rounded-xl shadow-2xs">
                    <span className="text-gray-500 block">Nạp từ 2M - dưới 5M</span>
                    <span className="font-black text-indigo-600 text-sm">Tặng 15%</span>
                  </div>
                  <div className="bg-white/80 border border-blue-100 p-2.5 rounded-xl shadow-2xs">
                    <span className="text-gray-500 block">Nạp từ 5M - dưới 10M</span>
                    <span className="font-black text-violet-600 text-sm">Tặng 25%</span>
                  </div>
                  <div className="bg-white/80 border border-blue-100 p-2.5 rounded-xl shadow-2xs">
                    <span className="text-gray-500 block">Từ 10M trở lên</span>
                    <span className="font-black text-rose-600 text-sm">Tặng 30%</span>
                  </div>
                </div>
              </div>

              {/* Box Chọn Phương thức nạp tiền */}
              <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-6 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span>1. Chọn phương thức nạp tiền</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Option 1: VietQR */}
                    <div
                      onClick={() => setPhuongThuc("VIETQR")}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        phuongThuc === "VIETQR"
                          ? "border-[#0355a2] bg-blue-50/40 shadow-xs"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 text-[#0355a2] flex items-center justify-center text-xl">
                          <QrcodeOutlined />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-gray-800">Quét mã QRCode (VietQR)</div>
                          <div className="text-[11px] text-gray-500">Tự động duyệt 24/7, mọi ngân hàng</div>
                        </div>
                      </div>
                      <Tag color="blue" className="font-bold">Khuyên dùng</Tag>
                    </div>

                    {/* Option 2: Ví MoMo */}
                    <div
                      onClick={() => setPhuongThuc("MOMO")}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        phuongThuc === "MOMO"
                          ? "border-[#a50064] bg-pink-50/40 shadow-xs"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-pink-100 text-[#a50064] flex items-center justify-center text-xl font-black">
                          M
                        </div>
                        <div>
                          <div className="font-bold text-sm text-gray-800">Ví điện tử MOMO</div>
                          <div className="text-[11px] text-gray-500">Quét mã MoMo thanh toán tức thì</div>
                        </div>
                      </div>
                      <Tag color="magenta">Nhanh</Tag>
                    </div>

                    {/* Option 3: Thẻ ATM / VNPay */}
                    <div
                      onClick={() => setPhuongThuc("VNPAY")}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        phuongThuc === "VNPAY"
                          ? "border-[#0355a2] bg-blue-50/40 shadow-xs"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl">
                          <CreditCardOutlined />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-gray-800">Thẻ ATM nội địa (VNPay / Napas)</div>
                          <div className="text-[11px] text-gray-500">Internet Banking tất cả các ngân hàng</div>
                        </div>
                      </div>
                    </div>

                    {/* Option 4: Chuyển khoản trực tiếp */}
                    <div
                      onClick={() => setPhuongThuc("BANK_TRANSFER")}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        phuongThuc === "BANK_TRANSFER"
                          ? "border-[#0355a2] bg-blue-50/40 shadow-xs"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xl">
                          <BankOutlined />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-gray-800">Chuyển khoản thủ công</div>
                          <div className="text-[11px] text-gray-500">Chuyển đến STK ngân hàng hệ thống</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Divider className="my-2" />

                {/* Bước 2: Chọn số tiền nạp */}
                <div>
                  <h3 className="text-base font-bold text-gray-800 mb-3">
                    2. Chọn số tiền muốn nạp
                  </h3>

                  {/* Nút chọn nhanh */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                    {QUICK_AMOUNTS.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setSoTienNap(item.value)}
                        className={`p-3 rounded-xl border font-bold text-sm transition-all cursor-pointer relative ${
                          soTienNap === item.value
                            ? "border-[#0355a2] bg-[#0355a2] !text-white shadow-sm"
                            : "border-gray-200 hover:border-blue-300 bg-white text-gray-700 hover:bg-blue-50/30"
                        }`}
                      >
                        <span className={soTienNap === item.value ? "!text-white font-bold" : ""}>
                          {item.label}
                        </span>
                        {item.badge && (
                          <span
                            className={`absolute -top-2 -right-1 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                              soTienNap === item.value
                                ? "bg-amber-300 text-amber-950"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Ô nhập số tiền tùy ý */}
                  <div className="space-y-1.5 max-w-md">
                    <label className="text-xs font-semibold text-gray-600">Hoặc nhập số tiền khác (tối thiểu 10.000 đ):</label>
                    <div className="relative">
                      <InputNumber
                        value={soTienNap}
                        onChange={(val) => setSoTienNap(Number(val))}
                        min={10000}
                        step={50000}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        parser={(value) => value?.replace(/\$\s?|(,*)/g, "") as any}
                        className="w-full text-base font-bold py-1"
                        addonAfter="VNĐ"
                      />
                    </div>
                  </div>
                </div>

                {/* Box Tính toán tổng tiền nhận vào ví */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Số tiền nạp:</span>
                      <span className="font-bold text-gray-800">{soTienNap?.toLocaleString("vi-VN")} đ</span>
                    </div>
                    {estimatedBonus > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Khuyến mãi tặng thêm:</span>
                        <span className="font-bold text-emerald-600">+{estimatedBonus.toLocaleString("vi-VN")} đ</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm pt-1">
                      <span className="font-bold text-gray-700">Tổng nhận vào ví:</span>
                      <span className="text-lg font-black text-[#0355a2]">
                        {totalReceived.toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCreateDeposit}
                    disabled={submittingDeposit || !soTienNap || soTienNap < 10000}
                    className="w-full sm:w-auto px-8 py-3 bg-[#0355a2] hover:bg-[#024380] active:bg-[#013566] !text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submittingDeposit ? (
                      <Spin size="small" className="text-white" />
                    ) : (
                      <>
                        <span className="!text-white font-bold">Tiếp tục thanh toán</span>
                        <ArrowRightOutlined className="!text-white" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 2: LỊCH SỬ NẠP TIỀN ===================== */}
          {activeTab === "LICHSU_NAP" && (
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                  <HistoryOutlined className="text-[#0355a2]" /> Danh sách giao dịch nạp tiền
                </h3>
                <Button icon={<ReloadOutlined />} onClick={loadLichSuNap}>
                  Làm mới
                </Button>
              </div>

              <Table
                dataSource={depositHistory}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                locale={{ emptyText: "Chưa có giao dịch nạp tiền nào" }}
                columns={[
                  {
                    title: "Mã giao dịch",
                    dataIndex: "maGiaoDich",
                    key: "maGiaoDich",
                    render: (text) => <span className="font-bold text-[#0355a2]">{text}</span>,
                  },
                  {
                    title: "Phương thức",
                    dataIndex: "tenPhuongThuc",
                    key: "tenPhuongThuc",
                    render: (text) => <Tag color="blue">{text || "VietQR"}</Tag>,
                  },
                  {
                    title: "Số tiền nạp",
                    dataIndex: "soTienNap",
                    key: "soTienNap",
                    render: (val) => <span className="font-bold text-gray-800">{val?.toLocaleString("vi-VN")} đ</span>,
                  },
                  {
                    title: "Khuyến mãi",
                    dataIndex: "tienKhuyenMai",
                    key: "tienKhuyenMai",
                    render: (val) => (
                      <span className="font-bold text-emerald-600">
                        {val > 0 ? `+${val.toLocaleString("vi-VN")} đ` : "0 đ"}
                      </span>
                    ),
                  },
                  {
                    title: "Thực nhận",
                    dataIndex: "tongNhan",
                    key: "tongNhan",
                    render: (val) => (
                      <span className="font-black text-[#0355a2]">{val?.toLocaleString("vi-VN")} đ</span>
                    ),
                  },
                  {
                    title: "Thời gian tạo",
                    dataIndex: "createdDate",
                    key: "createdDate",
                    render: (val) => (
                      <span className="text-xs text-gray-500">
                        {val ? new Date(val).toLocaleString("vi-VN") : "--"}
                      </span>
                    ),
                  },
                  {
                    title: "Trạng thái",
                    dataIndex: "trangThai",
                    key: "trangThai",
                    render: (status) => {
                      if (status === 1) return <Tag color="success" icon={<CheckCircleOutlined />}>Thành công</Tag>;
                      if (status === 2) return <Tag color="error">Thất bại</Tag>;
                      if (status === 3) return <Tag color="default">Đã hủy</Tag>;
                      return <Tag color="warning" icon={<ClockCircleOutlined />}>Chờ thanh toán</Tag>;
                    },
                  },
                  {
                    title: "Thao tác",
                    key: "action",
                    render: (_, record) => {
                      if (record.trangThai === 0) {
                        return (
                          <Button
                            size="small"
                            type="primary"
                            onClick={() => {
                              setCurrentGiaoDich(record);
                              setModalQrVisible(true);
                            }}
                          >
                            Quét QR
                          </Button>
                        );
                      }
                      return <span className="text-xs text-gray-400">Hoàn tất</span>;
                    },
                  },
                ]}
              />
            </div>
          )}

          {/* ===================== TAB 3: LỊCH SỬ THANH TOÁN ===================== */}
          {activeTab === "LICHSU_THANHTOAN" && (
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                  <CreditCardOutlined className="text-[#0355a2]" /> Nhật ký biến động số dư & thanh toán dịch vụ
                </h3>
                <Button icon={<ReloadOutlined />} onClick={loadLichSuThanhToan}>
                  Làm mới
                </Button>
              </div>

              <Table
                dataSource={paymentHistory}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                locale={{ emptyText: "Chưa có lịch sử thanh toán nào" }}
                columns={[
                  {
                    title: "Mã GD",
                    dataIndex: "maGiaoDich",
                    key: "maGiaoDich",
                    render: (text) => <span className="font-bold text-gray-700 text-xs">{text}</span>,
                  },
                  {
                    title: "Loại giao dịch",
                    dataIndex: "loaiGiaoDich",
                    key: "loaiGiaoDich",
                    render: (type, record) => {
                      if (type === 1) return <Tag color="green">Nạp tiền</Tag>;
                      if (type === 2) return <Tag color="cyan">Khuyến mãi</Tag>;
                      return <Tag color="volcano">{record.tenLoaiDichVu || "Dịch vụ phòng trọ"}</Tag>;
                    },
                  },
                  {
                    title: "Nội dung diễn giải",
                    dataIndex: "noiDung",
                    key: "noiDung",
                    render: (text, record) => (
                      <div>
                        <div className="font-medium text-xs text-gray-800">{text}</div>
                        {record.tieuDeTin && (
                          <div className="text-[11px] text-gray-500 truncate max-w-xs">{record.tieuDeTin}</div>
                        )}
                      </div>
                    ),
                  },
                  {
                    title: "Số tiền",
                    dataIndex: "soTien",
                    key: "soTien",
                    render: (val) => {
                      const isPositive = val > 0;
                      return (
                        <span className={`font-bold text-sm ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
                          {isPositive ? `+${val.toLocaleString("vi-VN")}` : val.toLocaleString("vi-VN")} đ
                        </span>
                      );
                    },
                  },
                  {
                    title: "Số dư sau GD",
                    dataIndex: "soDuSauTong",
                    key: "soDuSauTong",
                    render: (val) => (
                      <span className="font-semibold text-xs text-gray-700">
                        {val?.toLocaleString("vi-VN")} đ
                      </span>
                    ),
                  },
                  {
                    title: "Thời gian",
                    dataIndex: "createdDate",
                    key: "createdDate",
                    render: (val) => (
                      <span className="text-xs text-gray-500">
                        {val ? new Date(val).toLocaleString("vi-VN") : "--"}
                      </span>
                    ),
                  },
                ]}
              />
            </div>
          )}
        </div>
      </div>

      {/* ===================== MODAL MÃ QR THANH TOÁN VIETQR ===================== */}
      <Modal
        open={modalQrVisible}
        onCancel={() => setModalQrVisible(false)}
        footer={null}
        width={500}
        destroyOnClose
        centered
      >
        {currentGiaoDich && (
          <div className="p-2 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-[#0355a2] text-2xl mb-1">
              <QrcodeOutlined />
            </div>

            <div>
              <h2 className="text-lg font-black text-gray-800">Quét mã QR để nạp tiền</h2>
              <p className="text-xs text-gray-500">
                Sử dụng app ngân hàng hoặc MoMo quét mã QR bên dưới để chuyển khoản tự động
              </p>
            </div>

            {/* Khung ảnh QR VietQR */}
            <div className="bg-gradient-to-b from-blue-50 to-white p-4 rounded-2xl border border-blue-200 inline-block shadow-inner">
              {currentGiaoDich.qrCodeUrl ? (
                <img
                  src={currentGiaoDich.qrCodeUrl}
                  alt="VietQR Code"
                  className="w-64 h-64 mx-auto object-contain rounded-lg shadow-sm"
                />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                  <Spin tip="Đang tải mã QR..." />
                </div>
              )}
            </div>

            {/* Chi tiết chuyển khoản & Nút sao chép */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs text-left space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Ngân hàng thụ hưởng:</span>
                <span className="font-bold text-gray-800">{bankInfo?.tenNganHang || "MBBank"}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">Số tài khoản:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base text-[#0355a2] tracking-wider">
                    {bankInfo?.soTaiKhoan || "0869590916"}
                  </span>
                  <Tooltip title="Sao chép STK">
                    <Button
                      size="small"
                      type="text"
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipboard(bankInfo?.soTaiKhoan || "0869590916", "Số tài khoản")}
                    />
                  </Tooltip>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">Chủ tài khoản:</span>
                <span className="font-bold text-gray-800">{bankInfo?.chuTaiKhoan || "NGUYEN VAN HUNG"}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500">Số tiền nạp:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-red-600 text-sm">
                    {currentGiaoDich.soTienNap.toLocaleString("vi-VN")} đ
                  </span>
                  <Tooltip title="Sao chép số tiền">
                    <Button
                      size="small"
                      type="text"
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipboard(currentGiaoDich.soTienNap.toString(), "Số tiền")}
                    />
                  </Tooltip>
                </div>
              </div>

              <div className="flex items-center justify-between bg-amber-50 p-2 rounded-lg border border-amber-200">
                <span className="text-amber-900 font-semibold">Nội dung chuyển khoản:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-amber-900 tracking-wider">
                    {currentGiaoDich.noiDungChuyenKhoan}
                  </span>
                  <Tooltip title="Sao chép nội dung">
                    <Button
                      size="small"
                      type="text"
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipboard(currentGiaoDich.noiDungChuyenKhoan, "Nội dung")}
                    />
                  </Tooltip>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-gray-400 italic">
              * Lưu ý: Nhập chính xác nội dung chuyển khoản để hệ thống tự động cộng tiền vào ví trong vòng 1-3 phút.
            </p>

            {/* Nút xác nhận thanh toán (Giả lập / Demo ngay) */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <Button onClick={() => setModalQrVisible(false)}>
                Đóng
              </Button>
              <Button
                type="primary"
                className="bg-[#0355a2] hover:bg-[#024380]"
                loading={confirmingDeposit}
                onClick={() => handleConfirmDeposit(currentGiaoDich.maGiaoDich)}
              >
                Tôi đã chuyển tiền xong
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default withAuthorization(QuanLyGiaoDichPage, "");
