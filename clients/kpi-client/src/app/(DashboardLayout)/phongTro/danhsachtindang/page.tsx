"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Input,
  Pagination,
  Tag,
  Modal,
  Space,
  Tooltip,
  Empty,
  Spin,
  Radio,
} from "antd";
import {
  SearchOutlined,
  PlusCircleOutlined,
  CameraOutlined,
  EditOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  CalendarOutlined,
  TagOutlined,
  EyeInvisibleOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleFilled,
  ClockCircleFilled,
  ExclamationCircleOutlined,
  BulbOutlined,
  CrownOutlined,
  FireOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import withAuthorization from "@/libs/authentication";
import phongTroService from "@/services/phongTro/phongTroService";
import {
  PhongTroSearchType,
  PhongTroType,
  ThongKeTinDangType,
} from "@/types/phongTro/phongTro";
import { buildFileUrl } from "@/utils/file";
import PhongTroCreateOrUpdate from "../createOrUpdate";
import PhongTroDetail from "../detail";

function formatGiaChoThue(price?: number): string {
  if (!price || price <= 0) return "Thỏa thuận";
  if (price >= 1000000) {
    const trieu = (price / 1000000).toFixed(1).replace(/\.0$/, "");
    return `${trieu} triệu/tháng`;
  }
  return `${(price / 1000).toLocaleString("vi-VN")} nghìn/tháng`;
}

const DanhsachTinDangPage: React.FC = () => {
  const router = useRouter();

  // Dữ liệu danh sách
  const [data, setData] = useState<PhongTroType[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // Phân trang & Tìm kiếm & Tab
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("ALL"); // ALL, ACTIVE, NORMAL, VIP, PENDING, HIDDEN

  // Thống kê tin đăng từ Backend
  const [stats, setStats] = useState<ThongKeTinDangType>({
    tatCa: 0,
    dangHienThi: 0,
    tinThuong: 0,
    tinVip: 0,
    choDuyet: 0,
    hetHan: 0,
    daThue: 0,
  });

  // Modal Sửa & Chi tiết & Xóa
  const [isOpenModal, setIsOpenModal] = useState<boolean>(false);
  const [currentItem, setCurrentItem] = useState<PhongTroType | null>(null);
  const [isOpenDetail, setIsOpenDetail] = useState<boolean>(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Modal Nâng cấp VIP
  const [vipModalItem, setVipModalItem] = useState<PhongTroType | null>(null);
  const [selectedGoiVip, setSelectedGoiVip] = useState<number>(1);
  const [vipDays, setVipDays] = useState<number>(30);
  const [loadingVip, setLoadingVip] = useState<boolean>(false);

  // Modal Gia hạn / Thêm ngày
  const [extendModalItem, setExtendModalItem] = useState<PhongTroType | null>(null);
  const [extendDays, setExtendDays] = useState<number>(30);
  const [loadingExtend, setLoadingExtend] = useState<boolean>(false);

  // Action loading cho từng tin (đẩy tin, gắn nhãn, đổi trạng thái)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Tải thống kê
  const loadStats = useCallback(async () => {
    try {
      const res: any = await phongTroService.getThongKe();
      if (res?.status && res?.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error("Lỗi khi tải thống kê tin đăng:", err);
    }
  }, []);

  // Load danh sách tin từ API
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const searchObj: PhongTroSearchType = {
        pageIndex,
        pageSize,
        tieuDe: searchKeyword.trim() || undefined,
      };

      if (activeTab === "ACTIVE") {
        searchObj.trangThai = 0;
        searchObj.trangThaiDuyet = 1;
      } else if (activeTab === "NORMAL") {
        searchObj.goiTin = 0;
      } else if (activeTab === "VIP") {
        searchObj.isNoiBat = true;
      } else if (activeTab === "PENDING") {
        searchObj.trangThaiDuyet = 0;
      } else if (activeTab === "HIDDEN") {
        searchObj.trangThai = 1;
      }

      const res: any = await phongTroService.getData(searchObj);
      if (res?.status && res?.data) {
        const items = res.data.items || [];
        const count = res.data.totalCount ?? res.data.totalItem ?? items.length;
        setData(items);
        setTotalItems(count);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách tin:", err);
      toast.error("Không tải được danh sách tin đăng");
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize, searchKeyword, activeTab]);

  useEffect(() => {
    loadData();
    loadStats();
  }, [loadData, loadStats]);

  // Các thao tác Modals
  const handleOpenEdit = (item: PhongTroType) => {
    setCurrentItem(item);
    setIsOpenModal(true);
  };

  const handleOpenDetail = (item: PhongTroType) => {
    setCurrentItem(item);
    setIsOpenDetail(true);
  };

  // 1. ĐẨY TIN (API thật)
  const handlePushNews = async (item: PhongTroType) => {
    setActionLoadingId(item.id);
    try {
      const res: any = await phongTroService.dayTin(item.id);
      if (res?.status) {
        const newCount = res.data?.soLuotDayTin ?? item.soLuotDayTin + 1;
        toast.success(
          `Đã đẩy tin "${item.tieuDe.substring(0, 30)}..." lên đầu trang! (Lượt đẩy: ${newCount})`
        );
        loadData();
        loadStats();
      } else {
        toast.error(res?.message || "Đẩy tin thất bại");
      }
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi đẩy tin lên đầu");
    } finally {
      setActionLoadingId(null);
    }
  };

  // 2. GIA HẠN TIN / THÊM NGÀY (API thật)
  const handleOpenExtend = (item: PhongTroType) => {
    setExtendModalItem(item);
    setExtendDays(30);
  };

  const handleConfirmExtend = async () => {
    if (!extendModalItem) return;
    setLoadingExtend(true);
    try {
      const res: any = await phongTroService.giaHan(extendModalItem.id, extendDays);
      if (res?.status) {
        toast.success(res?.message || `Đã gia hạn tin đăng thêm ${extendDays} ngày!`);
        setExtendModalItem(null);
        loadData();
        loadStats();
      } else {
        toast.error(res?.message || "Gia hạn tin thất bại");
      }
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi gia hạn tin");
    } finally {
      setLoadingExtend(false);
    }
  };

  // 3. NÂNG CẤP VIP (API thật)
  const handleOpenUpgradeVip = (item: PhongTroType) => {
    setVipModalItem(item);
    setSelectedGoiVip(item.goiTin > 0 ? item.goiTin : 1);
    setVipDays(30);
  };

  const handleConfirmUpgradeVip = async () => {
    if (!vipModalItem) return;
    setLoadingVip(true);
    try {
      const res: any = await phongTroService.nangCapVip(
        vipModalItem.id,
        selectedGoiVip,
        vipDays
      );
      if (res?.status) {
        const tenGoi =
          selectedGoiVip === 3
            ? "VIP Nổi Bật (Kim Cương)"
            : selectedGoiVip === 2
            ? "VIP 2 (Vàng)"
            : "VIP 1 (Bạc)";
        toast.success(`Đã nâng cấp tin đăng lên ${tenGoi} thành công!`);
        setVipModalItem(null);
        loadData();
        loadStats();
      } else {
        toast.error(res?.message || "Nâng cấp VIP thất bại");
      }
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi nâng cấp VIP");
    } finally {
      setLoadingVip(false);
    }
  };

  // 4. GẮN NHÃN NỔI BẬT (API thật)
  const handleToggleLabel = async (item: PhongTroType) => {
    setActionLoadingId(item.id);
    try {
      const res: any = await phongTroService.ganNhan(item.id);
      if (res?.status) {
        toast.success(res?.message || "Đã cập nhật nhãn tin đăng!");
        loadData();
        loadStats();
      } else {
        toast.error(res?.message || "Cập nhật nhãn thất bại");
      }
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi cập nhật nhãn");
    } finally {
      setActionLoadingId(null);
    }
  };

  // 5. ẨN TIN / HIỆN TIN (API thật)
  const handleToggleStatus = async (item: PhongTroType) => {
    setActionLoadingId(item.id);
    try {
      const res: any = await phongTroService.doiTrangThai(item.id);
      if (res?.status) {
        toast.success(res?.message || "Đã thay đổi trạng thái tin đăng!");
        loadData();
        loadStats();
      } else {
        toast.error(res?.message || "Đổi trạng thái thất bại");
      }
    } catch (err: any) {
      toast.error(err?.message || "Lỗi khi đổi trạng thái");
    } finally {
      setActionLoadingId(null);
    }
  };

  // 6. XÓA TIN ĐĂNG (API thật)
  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      const res: any = await phongTroService.delete(confirmDeleteId);
      if (res?.status) {
        toast.success("Xóa tin đăng thành công");
        setConfirmDeleteId(null);
        loadData();
        loadStats();
      } else {
        toast.error(res?.message || "Xóa thất bại");
      }
    } catch (e) {
      toast.error("Lỗi khi xóa tin đăng");
    }
  };

  return (
    <div className="bg-[#f4f6f9] min-h-screen py-6 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header Title & Nút đăng tin */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-gray-200 gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 m-0">Danh sách tin đăng</h1>
            <p className="text-gray-500 text-sm mt-1 mb-0">
              Quản lý toàn bộ tin cho thuê phòng trọ, căn hộ, chung cư mini của bạn
            </p>
          </div>

          <Button
            type="primary"
            size="large"
            icon={<PlusCircleOutlined />}
            onClick={() => router.push("/phongTro/dangtinmienphi")}
            className="bg-[#0355a2] hover:bg-[#02478a] border-none font-semibold shadow-sm flex items-center gap-1.5"
          >
            Đăng tin miễn phí
          </Button>
        </div>

        {/* Tab Filters (Phong cách Phongtro123) */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-6 px-6 pt-3 border-b border-gray-200 overflow-x-auto select-none">
            <button
              type="button"
              onClick={() => {
                setActiveTab("ALL");
                setPageIndex(1);
              }}
              className={`pb-3 font-semibold text-sm transition-all border-b-2 cursor-pointer whitespace-nowrap outline-none focus:outline-none ${
                activeTab === "ALL"
                  ? "border-[#0355a2] text-[#0355a2]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Tất cả ({stats.tatCa})
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("ACTIVE");
                setPageIndex(1);
              }}
              className={`pb-3 font-semibold text-sm transition-all border-b-2 cursor-pointer whitespace-nowrap outline-none focus:outline-none ${
                activeTab === "ACTIVE"
                  ? "border-[#0355a2] text-[#0355a2]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Đang hiển thị ({stats.dangHienThi})
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("NORMAL");
                setPageIndex(1);
              }}
              className={`pb-3 font-semibold text-sm transition-all border-b-2 cursor-pointer whitespace-nowrap outline-none focus:outline-none ${
                activeTab === "NORMAL"
                  ? "border-[#0355a2] text-[#0355a2]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Tin thường ({stats.tinThuong})
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("VIP");
                setPageIndex(1);
              }}
              className={`pb-3 font-semibold text-sm transition-all border-b-2 cursor-pointer whitespace-nowrap outline-none focus:outline-none ${
                activeTab === "VIP"
                  ? "border-[#0355a2] text-[#0355a2]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Tin VIP ({stats.tinVip})
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("PENDING");
                setPageIndex(1);
              }}
              className={`pb-3 font-semibold text-sm transition-all border-b-2 cursor-pointer whitespace-nowrap outline-none focus:outline-none ${
                activeTab === "PENDING"
                  ? "border-[#0355a2] text-[#0355a2]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Chờ duyệt ({stats.choDuyet})
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("HIDDEN");
                setPageIndex(1);
              }}
              className={`pb-3 font-semibold text-sm transition-all border-b-2 cursor-pointer whitespace-nowrap outline-none focus:outline-none ${
                activeTab === "HIDDEN"
                  ? "border-[#0355a2] text-[#0355a2]"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Đã thuê / Ẩn ({stats.daThue})
            </button>
          </div>

          {/* Search bar */}
          <div className="p-4 bg-gray-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:max-w-md">
              <Input
                size="large"
                prefix={<SearchOutlined className="text-gray-400" />}
                placeholder="Tìm theo mã tin hoặc tiêu đề tin đăng..."
                allowClear
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onPressEnter={() => setPageIndex(1)}
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 self-end sm:self-center">
              <span>Đang lọc: </span>
              <Tag color="orange" className="mr-0 font-medium">
                {activeTab === "ALL" && `Tất cả (${stats.tatCa})`}
                {activeTab === "ACTIVE" && `Đang hiển thị (${stats.dangHienThi})`}
                {activeTab === "NORMAL" && `Tin thường (${stats.tinThuong})`}
                {activeTab === "VIP" && `Tin VIP (${stats.tinVip})`}
                {activeTab === "PENDING" && `Chờ duyệt (${stats.choDuyet})`}
                {activeTab === "HIDDEN" && `Đã thuê / Ẩn (${stats.daThue})`}
              </Tag>
            </div>
          </div>
        </div>

        {/* Danh sách Tin Đăng Dạng Thẻ Ngang (Card View Phongtro123) */}
        {loading ? (
          <div className="py-20 text-center bg-white rounded-xl shadow-xs">
            <Spin size="large" tip="Đang tải danh sách tin đăng..." />
          </div>
        ) : data.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-xs border border-gray-200">
            <Empty
              description="Không tìm thấy tin đăng nào phù hợp"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button
                type="primary"
                onClick={() => router.push("/phongTro/dangtinmienphi")}
                className="bg-[#0355a2] hover:bg-[#02478a] border-none"
              >
                Đăng tin ngay
              </Button>
            </Empty>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((item) => {
              // Phân tích hình ảnh
              const photos: string[] = [];
              if (item.hinhAnhDaiDien) {
                photos.push(buildFileUrl(item.hinhAnhDaiDien));
              }
              if (item.danhSachHinhAnh) {
                const arr = item.danhSachHinhAnh
                  .split(";")
                  .map((p) => buildFileUrl(p.trim()))
                  .filter((p) => p && !photos.includes(p));
                photos.push(...arr);
              }
              const mainPhoto =
                photos[0] ||
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80";

              const isVip = (item.goiTin || 0) > 0 || item.isNoiBat;
              const isVipNoiBat = item.goiTin === 3 || (item.goiTin === 0 && item.isNoiBat);
              const isVip2 = item.goiTin === 2;
              const isVip1 = item.goiTin === 1;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-xl border transition-all duration-200 hover:shadow-md p-4 flex flex-col lg:flex-row gap-5 relative overflow-hidden ${
                    isVipNoiBat
                      ? "border-red-400 ring-1 ring-red-100"
                      : isVip2
                      ? "border-amber-400 ring-1 ring-amber-100"
                      : isVip1
                      ? "border-blue-300"
                      : "border-gray-200"
                  }`}
                >
                  {/* CỘT 1: HÌNH ẢNH & BADGE SỐ ẢNH (Left side) */}
                  <div className="relative w-full lg:w-48 h-48 sm:h-44 shrink-0 rounded-lg overflow-hidden bg-gray-100 group">
                    <img
                      src={mainPhoto}
                      alt={item.tieuDe}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80";
                      }}
                    />

                    {/* Badge số ảnh */}
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-xs font-medium">
                      <CameraOutlined />
                      <span>{photos.length || 1}</span>
                    </div>

                    {/* Badge VIP Overlay */}
                    {isVip && (
                      <div className="absolute top-2 left-2">
                        {isVipNoiBat ? (
                          <span className="bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-sm shadow-xs uppercase tracking-wider flex items-center gap-1">
                            <FireOutlined /> VIP NỔI BẬT
                          </span>
                        ) : isVip2 ? (
                          <span className="bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-sm shadow-xs uppercase tracking-wider flex items-center gap-1">
                            <CrownOutlined /> VIP 2
                          </span>
                        ) : (
                          <span className="bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-sm shadow-xs uppercase tracking-wider flex items-center gap-1">
                            <CrownOutlined /> VIP 1
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* CỘT 2: THÔNG TIN CHI TIẾT TIN ĐĂNG (Center) */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      {/* Huy hiệu loại tin & Gói tin */}
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {item.loaiPhong || "Phòng trọ, nhà trọ"}
                        </span>

                        {item.maPhong && (
                          <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            #{item.maPhong}
                          </span>
                        )}

                        {item.isNoiBat && (
                          <Tag color="magenta" className="m-0 text-xs font-medium">
                            ★ Nổi bật
                          </Tag>
                        )}
                      </div>

                      {/* Tiêu đề tin đăng */}
                      <h3
                        onClick={() => handleOpenDetail(item)}
                        className={`text-base font-bold line-clamp-2 cursor-pointer transition-colors leading-snug mb-2 ${
                          isVipNoiBat
                            ? "text-red-600 hover:text-red-700 uppercase"
                            : isVip2
                            ? "text-[#0355a2] hover:text-[#02478a]"
                            : "text-[#0355a2] hover:text-blue-700"
                        }`}
                        title={item.tieuDe}
                      >
                        {item.tieuDe}
                      </h3>

                      {/* Giá, Diện tích & Địa chỉ */}
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mb-3">
                        <span className="text-emerald-600 font-extrabold text-base">
                          {formatGiaChoThue(item.giaChoThue)}
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-700 font-semibold text-sm">
                          {item.dienTich ? `${item.dienTich} m²` : "Chưa rõ diện tích"}
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="text-gray-600 text-sm truncate max-w-xs" title={item.diaChi}>
                          📍 {item.tenHuyen || item.tenTinh ? `${item.tenHuyen || ""}, ${item.tenTinh || ""}` : item.diaChi || "Hà Nội"}
                        </span>
                      </div>

                      {/* Bảng Metadata: Ngày bắt đầu, Ngày hết hạn, Lượt xem, Đẩy tin */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-gray-50/90 rounded-lg p-2.5 text-xs text-gray-600 border border-gray-100">
                        <div>
                          <span className="text-gray-400 block text-[11px]">Ngày đăng:</span>
                          <strong className="text-gray-700 font-medium">
                            {item.ngayBatDau
                              ? dayjs(item.ngayBatDau).format("DD/MM/YYYY")
                              : dayjs(item.createdDate).format("DD/MM/YYYY")}
                          </strong>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px]">Hết hạn:</span>
                          <strong
                            className={`font-medium ${
                              item.ngayHetHan && dayjs(item.ngayHetHan).isBefore(dayjs())
                                ? "text-red-600"
                                : "text-gray-700"
                            }`}
                          >
                            {item.ngayHetHan
                              ? dayjs(item.ngayHetHan).format("DD/MM/YYYY")
                              : "Không thời hạn"}
                          </strong>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px]">Lượt xem:</span>
                          <strong className="text-blue-600 font-medium">
                            {item.luotXem || 0} lượt
                          </strong>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[11px]">Lượt đẩy tin:</span>
                          <strong className="text-amber-600 font-medium">
                            {item.soLuotDayTin || 0} lần
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CỘT 3: TRẠNG THÁI & BẢNG THAO TÁC (Right side) - Chuẩn Phongtro123, khoảng cách rộng rãi */}
                  <div className="lg:w-[365px] shrink-0 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-gray-100 pt-3 lg:pt-0 lg:pl-6">
                    <div>
                      {/* Trạng thái duyệt & hiển thị (Căn giữa như Phongtro123) */}
                      <div className="text-center mb-3">
                        {item.trangThai === 1 ? (
                          <span className="text-gray-600 font-bold text-sm inline-flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                            Đã thuê / Tạm ẩn
                          </span>
                        ) : item.trangThaiDuyet === 1 ? (
                          <span className="text-emerald-600 font-bold text-sm inline-flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            Đang hiển thị
                          </span>
                        ) : item.trangThaiDuyet === 0 ? (
                          <span className="text-amber-600 font-bold text-sm inline-flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            Chờ duyệt
                          </span>
                        ) : (
                          <span className="text-red-500 font-bold text-sm inline-flex items-center gap-1.5 bg-red-50 px-3 py-1 rounded-full">
                            <span className="w-2 h-2 rounded-full bg-red-400"></span>
                            Hết hạn
                          </span>
                        )}
                      </div>

                      {/* Callout box Nâng cấp VIP */}
                      <div className="bg-[#eef5fc] border border-[#d6e8fa] rounded-lg p-2.5 mb-3 text-xs text-[#1e6091] flex items-start gap-2">
                        <BulbOutlined className="text-amber-500 text-sm mt-0.5 shrink-0" />
                        <span className="leading-snug">
                          Nâng cấp lên Tin VIP để tin đăng của bạn nổi bật và thu hút người xem.
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons Grid - Bố cục chuẩn Phongtro123, khoảng cách thoáng đãng */}
                    <div className="space-y-2.5 mt-2">
                      {/* Hàng 1: Nâng cấp VIP | Sửa tin | Đẩy tin */}
                      <div className="grid grid-cols-[1.15fr_1fr_1fr] gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenUpgradeVip(item)}
                          style={{ backgroundColor: "#0066cc", color: "#ffffff" }}
                          className="w-full h-[34px] px-2 hover:!bg-[#0052a3] !text-white text-[12px] font-semibold rounded-md shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap select-none active:scale-[0.98]"
                        >
                          <RocketOutlined className="shrink-0 !text-white" style={{ color: "#ffffff" }} />
                          <span style={{ color: "#ffffff" }} className="!text-white">Nâng cấp VIP</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="w-full h-[34px] px-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[12px] font-medium rounded-md border border-gray-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap select-none active:scale-[0.98]"
                        >
                          <EditOutlined className="shrink-0 text-gray-500" /> Sửa tin
                        </button>
                        <button
                          type="button"
                          disabled={actionLoadingId === item.id}
                          onClick={() => handlePushNews(item)}
                          className="w-full h-[34px] px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 text-[12px] font-medium rounded-md border border-amber-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap select-none active:scale-[0.98]"
                        >
                          <ThunderboltOutlined className="shrink-0 text-amber-600" /> Đẩy tin
                        </button>
                      </div>

                      {/* Hàng 2: Thêm ngày | Gắn nhãn | Ẩn tin */}
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenExtend(item)}
                          className="w-full h-[34px] px-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[12px] font-medium rounded-md border border-gray-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap select-none active:scale-[0.98]"
                        >
                          <CalendarOutlined className="shrink-0 text-gray-500" /> Thêm ngày
                        </button>
                        <button
                          type="button"
                          disabled={actionLoadingId === item.id}
                          onClick={() => handleToggleLabel(item)}
                          className={`w-full h-[34px] px-2 text-[12px] font-medium rounded-md border flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap select-none active:scale-[0.98] ${
                            item.isNoiBat
                              ? "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-300"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
                          }`}
                        >
                          <TagOutlined className="shrink-0 text-purple-500" /> {item.isNoiBat ? "Gỡ nhãn" : "Gắn nhãn"}
                        </button>
                        <button
                          type="button"
                          disabled={actionLoadingId === item.id}
                          onClick={() => handleToggleStatus(item)}
                          className={`w-full h-[34px] px-2 text-[12px] font-medium rounded-md border flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap select-none active:scale-[0.98] ${
                            item.trangThai === 1
                              ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
                          }`}
                        >
                          {item.trangThai === 1 ? <EyeOutlined className="shrink-0 text-emerald-600" /> : <EyeInvisibleOutlined className="shrink-0 text-gray-500" />}
                          {item.trangThai === 1 ? "Hiện tin" : "Ẩn tin"}
                        </button>
                      </div>

                      {/* Hàng 3: Xem trước | Xóa tin */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(item)}
                          className="w-full h-[32px] px-2 bg-white hover:bg-gray-50 text-gray-600 text-xs font-medium rounded-md border border-gray-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap select-none active:scale-[0.98]"
                        >
                          <EyeOutlined className="shrink-0 text-gray-400" /> Xem trước
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(item.id)}
                          className="w-full h-[32px] px-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded-md border border-red-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap select-none active:scale-[0.98]"
                        >
                          <DeleteOutlined className="shrink-0 text-red-500" /> Xóa tin
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Phân trang */}
            <div className="bg-white rounded-xl p-4 shadow-xs border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-gray-500">
                Hiển thị trang <strong>{pageIndex}</strong> / Tổng <strong>{totalItems}</strong> tin
              </span>
              <Pagination
                current={pageIndex}
                pageSize={pageSize}
                total={totalItems}
                onChange={(page, size) => {
                  setPageIndex(page);
                  setPageSize(size);
                }}
                showSizeChanger
                pageSizeOptions={["10", "20", "50"]}
                size="small"
              />
            </div>
          </div>
        )}
      </div>

      {/* Modal Nâng cấp VIP */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-bold text-gray-800">
            <RocketOutlined className="text-amber-500" /> Nâng cấp gói tin VIP
          </div>
        }
        open={!!vipModalItem}
        onCancel={() => setVipModalItem(null)}
        footer={[
          <Button key="back" onClick={() => setVipModalItem(null)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loadingVip}
            onClick={handleConfirmUpgradeVip}
            className="bg-[#0355a2] hover:bg-[#02478a] border-none font-semibold"
          >
            Xác nhận nâng cấp
          </Button>,
        ]}
        width={580}
      >
        {vipModalItem && (
          <div className="py-2 space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-xs text-gray-500 block">Tin đăng được chọn:</span>
              <strong className="text-sm text-gray-800 line-clamp-2">
                {vipModalItem.tieuDe}
              </strong>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                1. Chọn gói tin VIP mong muốn:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Gói VIP 1 */}
                <div
                  onClick={() => setSelectedGoiVip(1)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedGoiVip === 1
                      ? "border-blue-600 bg-blue-50/60 shadow-xs"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-blue-700 text-sm">VIP 1</span>
                    <Radio checked={selectedGoiVip === 1} />
                  </div>
                  <span className="text-xs text-gray-500 block mb-1">2.000đ / ngày</span>
                  <p className="text-[11px] text-gray-600 leading-tight m-0">
                    Ưu tiên trên tin thường, hiển thị viền xanh nhẹ.
                  </p>
                </div>

                {/* Gói VIP 2 */}
                <div
                  onClick={() => setSelectedGoiVip(2)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedGoiVip === 2
                      ? "border-amber-500 bg-amber-50/60 shadow-xs"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-amber-600 text-sm">VIP 2</span>
                    <Radio checked={selectedGoiVip === 2} />
                  </div>
                  <span className="text-xs text-gray-500 block mb-1">5.000đ / ngày</span>
                  <p className="text-[11px] text-gray-600 leading-tight m-0">
                    Vị trí ưu tiên cao, tiêu đề cam bắt mắt, tiếp cận gấp đôi.
                  </p>
                </div>

                {/* Gói VIP Nổi bật */}
                <div
                  onClick={() => setSelectedGoiVip(3)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedGoiVip === 3
                      ? "border-red-500 bg-red-50/60 shadow-xs"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-red-600 text-sm">VIP Nổi Bật</span>
                    <Radio checked={selectedGoiVip === 3} />
                  </div>
                  <span className="text-xs text-gray-500 block mb-1">10.000đ / ngày</span>
                  <p className="text-[11px] text-gray-600 leading-tight m-0">
                    Vị trí độc quyền trên cùng, huy hiệu HOT, tiếp cận tối đa.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                2. Chọn thời hạn nâng cấp:
              </label>
              <div className="flex flex-wrap gap-2">
                {[7, 15, 30, 60, 90].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setVipDays(days)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                      vipDays === days
                        ? "bg-[#0355a2] text-white border-[#0355a2]"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {days} ngày {days === 30 && "(Phổ biến)"}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-amber-50/80 p-3 rounded-lg border border-amber-200 text-xs text-amber-900 flex justify-between items-center">
              <span>Chi phí dự kiến ({vipDays} ngày):</span>
              <strong className="text-sm text-red-600 font-bold">
                {(
                  (selectedGoiVip === 3 ? 10000 : selectedGoiVip === 2 ? 5000 : 2000) *
                  vipDays
                ).toLocaleString("vi-VN")}{" "}
                VNĐ
              </strong>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Thêm ngày / Gia hạn tin */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-base font-bold text-gray-800">
            <CalendarOutlined className="text-emerald-600" /> Gia hạn tin đăng
          </div>
        }
        open={!!extendModalItem}
        onCancel={() => setExtendModalItem(null)}
        footer={[
          <Button key="back" onClick={() => setExtendModalItem(null)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loadingExtend}
            onClick={handleConfirmExtend}
            className="bg-emerald-600 hover:bg-emerald-700 border-none font-semibold"
          >
            Xác nhận gia hạn
          </Button>,
        ]}
        width={480}
      >
        {extendModalItem && (
          <div className="py-2 space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs space-y-1">
              <strong className="text-sm text-gray-800 line-clamp-1 block mb-1">
                {extendModalItem.tieuDe}
              </strong>
              <div className="flex justify-between text-gray-600">
                <span>Hạn hiện tại:</span>
                <strong className="text-gray-800">
                  {extendModalItem.ngayHetHan
                    ? dayjs(extendModalItem.ngayHetHan).format("DD/MM/YYYY")
                    : "Chưa thiết lập"}
                </strong>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Chọn số ngày gia hạn thêm:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[7, 15, 30, 60, 90, 180].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setExtendDays(days)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold cursor-pointer text-center transition-all ${
                      extendDays === days
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    +{days} ngày
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 flex justify-between items-center">
              <span>Ngày hết hạn mới dự kiến:</span>
              <strong className="text-emerald-700 text-sm font-bold">
                {dayjs(
                  extendModalItem.ngayHetHan && dayjs(extendModalItem.ngayHetHan).isAfter(dayjs())
                    ? extendModalItem.ngayHetHan
                    : new Date()
                )
                  .add(extendDays, "day")
                  .format("DD/MM/YYYY")}
              </strong>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Sửa tin đăng */}
      {isOpenModal && (
        <PhongTroCreateOrUpdate
          item={currentItem}
          onClose={() => {
            setIsOpenModal(false);
            setCurrentItem(null);
          }}
          onSuccess={() => {
            setIsOpenModal(false);
            setCurrentItem(null);
            loadData();
            loadStats();
          }}
        />
      )}

      {/* Modal Xem chi tiết */}
      {isOpenDetail && (
        <PhongTroDetail
          item={currentItem}
          onClose={() => {
            setIsOpenDetail(false);
            setCurrentItem(null);
          }}
        />
      )}

      {/* Modal Xác nhận xóa */}
      <Modal
        title={
          <span className="text-red-600 flex items-center gap-2">
            <ExclamationCircleOutlined /> Xác nhận xóa tin đăng
          </span>
        }
        open={!!confirmDeleteId}
        onOk={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
        okText="Xóa tin"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p className="text-gray-600 my-2">
          Bạn có chắc chắn muốn xóa tin đăng này không? Thao tác này không thể hoàn tác.
        </p>
      </Modal>
    </div>
  );
};

export default withAuthorization(DanhsachTinDangPage, "");
