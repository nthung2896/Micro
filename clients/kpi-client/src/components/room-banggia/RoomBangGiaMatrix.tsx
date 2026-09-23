"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Switch,
  Button,
  Modal,
  Tag,
  Tooltip,
  Spin,
  Card,
  Space,
} from "antd";
import {
  CheckCircleFilled,
  StarFilled,
  PhoneFilled,
  EyeOutlined,
  ThunderboltFilled,
  CheckOutlined,
  CrownFilled,
  InfoCircleOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import room_BangGiaService from "@/services/room_BangGia/room_BangGiaService";
import { Room_BangGiaType } from "@/types/room_BangGia/room_BangGia";

export interface PackageColumnConfig {
  key: "vip_noibat" | "vip_1" | "vip_2" | "vip_3" | "tin_thuong";
  code: string;
  name: string;
  headerBg: string;
  stars: number;
  textColor: string;
  titleStyleText: string;
  titleStyleColor: string;
  sizeText: string;
  tuDongDuyet: boolean;
  duyTriThem10Ngay: boolean;
  hienThiNutGoi: boolean;
  defaultPrices: {
    gia5Ngay: number;
    gia10Ngay: number;
    gia15Ngay: number;
    gia30NgayGoc: number;
    gia30NgayGiam: number; // percent discount (e.g. 20, 32)
    gia30NgaySauGiam: number;
    giaDayTin: number;
  };
  sampleTitle: string;
  badgeLabel: string;
}

const DEFAULT_PACKAGES: PackageColumnConfig[] = [
  {
    key: "vip_noibat",
    code: "VIP_NOIBAT",
    name: "Tin VIP Nổi Bật",
    headerBg: "#ff2a3b",
    stars: 5,
    textColor: "#ffffff",
    titleStyleText: "MÀU ĐỎ, IN HOA",
    titleStyleColor: "#ff2a3b",
    sizeText: "Rất lớn",
    tuDongDuyet: true,
    duyTriThem10Ngay: true,
    hienThiNutGoi: true,
    defaultPrices: {
      gia5Ngay: 325000,
      gia10Ngay: 650000,
      gia15Ngay: 975000,
      gia30NgayGoc: 1950000,
      gia30NgayGiam: 20,
      gia30NgaySauGiam: 1560000,
      giaDayTin: 30000,
    },
    sampleTitle: "CHO THUÊ PHÒNG CAO CẤP FULL TIỆN NGHI VIEW ĐẸP BAN CÔNG THOÁNG",
    badgeLabel: "VIP NỔI BẬT",
  },
  {
    key: "vip_1",
    code: "VIP_1",
    name: "Tin VIP 1",
    headerBg: "#ea1e8d",
    stars: 4,
    textColor: "#ffffff",
    titleStyleText: "MÀU HỒNG, IN HOA",
    titleStyleColor: "#ea1e8d",
    sizeText: "Lớn",
    tuDongDuyet: true,
    duyTriThem10Ngay: true,
    hienThiNutGoi: true,
    defaultPrices: {
      gia5Ngay: 195000,
      gia10Ngay: 390000,
      gia15Ngay: 585000,
      gia30NgayGoc: 1170000,
      gia30NgayGiam: 20,
      gia30NgaySauGiam: 936000,
      giaDayTin: 20000,
    },
    sampleTitle: "PHÒNG TRỌ KHÉP KÍN ĐẦY ĐỦ ĐỒ ĐẠC KHU TRUNG TÂM GẦN TRƯỜNG ĐẠI HỌC",
    badgeLabel: "VIP 1",
  },
  {
    key: "vip_2",
    code: "VIP_2",
    name: "Tin VIP 2",
    headerBg: "#ff5a1f",
    stars: 3,
    textColor: "#ffffff",
    titleStyleText: "MÀU CAM, IN HOA",
    titleStyleColor: "#ff5a1f",
    sizeText: "Trung bình",
    tuDongDuyet: true,
    duyTriThem10Ngay: true,
    hienThiNutGoi: true,
    defaultPrices: {
      gia5Ngay: 130000,
      gia10Ngay: 260000,
      gia15Ngay: 390000,
      gia30NgayGoc: 780000,
      gia30NgayGiam: 20,
      gia30NgaySauGiam: 624000,
      giaDayTin: 15000,
    },
    sampleTitle: "CHO THUÊ CĂN HỘ MINI AN NINH TỐT, GIỜ GIẤC TỰ DO, CÓ THANG MÁY",
    badgeLabel: "VIP 2",
  },
  {
    key: "vip_3",
    code: "VIP_3",
    name: "Tin VIP 3",
    headerBg: "#1877f2",
    stars: 2,
    textColor: "#ffffff",
    titleStyleText: "MÀU XANH, IN HOA",
    titleStyleColor: "#1877f2",
    sizeText: "Trung bình",
    tuDongDuyet: true,
    duyTriThem10Ngay: true,
    hienThiNutGoi: true,
    defaultPrices: {
      gia5Ngay: 75000,
      gia10Ngay: 150000,
      gia15Ngay: 225000,
      gia30NgayGoc: 450000,
      gia30NgayGiam: 20,
      gia30NgaySauGiam: 360000,
      giaDayTin: 10000,
    },
    sampleTitle: "PHÒNG TRỌ GIÁ RẺ TIỆN ĐI LẠI, KHÔNG CHUNG CHỦ, CÓ GÁC LỬNG",
    badgeLabel: "VIP 3",
  },
  {
    key: "tin_thuong",
    code: "TIN_THUONG",
    name: "Tin thường",
    headerBg: "#1f4e96",
    stars: 0,
    textColor: "#ffffff",
    titleStyleText: "Màu mặc định, viết thường",
    titleStyleColor: "#475569",
    sizeText: "Nhỏ",
    tuDongDuyet: false,
    duyTriThem10Ngay: false,
    hienThiNutGoi: false,
    defaultPrices: {
      gia5Ngay: 13500,
      gia10Ngay: 27000,
      gia15Ngay: 40500,
      gia30NgayGoc: 81000,
      gia30NgayGiam: 32,
      gia30NgaySauGiam: 55080,
      giaDayTin: 5000,
    },
    sampleTitle: "Cho thuê phòng trọ bình dân, vệ sinh riêng, có chỗ để xe rộng rãi",
    badgeLabel: "Tin thường",
  },
];

interface RoomBangGiaMatrixProps {
  isAdmin?: boolean;
  onEditCell?: (record: Room_BangGiaType) => void;
}

export default function RoomBangGiaMatrix({
  isAdmin = false,
  onEditCell,
}: RoomBangGiaMatrixProps) {
  const [includeVat, setIncludeVat] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [rawDbData, setRawDbData] = useState<Room_BangGiaType[]>([]);
  const [demoModalPkg, setDemoModalPkg] = useState<PackageColumnConfig | null>(null);

  // Load data from room_BangGia API
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await room_BangGiaService.getData({
        pageIndex: 1,
        pageSize: 200,
      });
      if (res && res.data && Array.isArray(res.data.items)) {
        setRawDbData(res.data.items);
      }
    } catch (err) {
      console.log("Could not load dynamic room_banggia data, using benchmark default:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Helpers to match DB records to package column and attribute
  const normalize = (val?: string) =>
    (val || "").toUpperCase().replace(/[\s_-]/g, "");

  const getDbPrice = useCallback(
    (pkgCode: string, thuocTinhKeyword: string): number | null => {
      if (!rawDbData || rawDbData.length === 0) return null;
      const targetPkg = normalize(pkgCode);
      const targetAttr = normalize(thuocTinhKeyword);

      const found = rawDbData.find((item) => {
        const itemPkg = normalize(item.loaiTin);
        const itemAttr = normalize(item.thuocTinh);
        const pkgMatch =
          itemPkg === targetPkg ||
          (targetPkg.includes("NOIBAT") && itemPkg.includes("NOIBAT")) ||
          (targetPkg.includes("THUONG") && itemPkg.includes("THUONG"));
        const attrMatch = itemAttr.includes(targetAttr) || targetAttr.includes(itemAttr);
        return pkgMatch && attrMatch;
      });

      if (found && typeof found.giaTin === "number" && found.giaTin > 0) {
        return found.giaTin;
      }
      return null;
    },
    [rawDbData]
  );

  // Format currency helper
  const formatMoney = (amount: number): string => {
    const finalAmount = includeVat ? Math.round(amount * 1.08) : amount;
    return `${new Intl.NumberFormat("vi-VN").format(finalAmount)}đ`;
  };

  return (
    <div className="w-full max-w-[1240px] mx-auto py-6 px-3 sm:px-6">
      {/* Title Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-800 tracking-tight mb-2">
          Bảng giá tin đăng
        </h1>
        <p className="text-sm sm:text-base text-slate-500 font-medium">
          Áp dụng từ 25/06/2026
        </p>
      </div>

      {/* Top Controls: VAT Switch */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-2">
        <div className="flex items-center gap-3">
          <span className="text-sm sm:text-base font-medium text-slate-700 select-none">
            Giá bao gồm 8% VAT
          </span>
          <Switch
            checked={includeVat}
            onChange={(checked) => setIncludeVat(checked)}
            className={includeVat ? "bg-blue-600" : "bg-slate-300"}
          />
          {includeVat && (
            <Tag color="cyan" className="ml-1 text-xs">
              Đã cộng 8% VAT
            </Tag>
          )}
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <Tag color="blue" icon={<InfoCircleOutlined />}>
              Chế độ Quản trị: Giá hiển thị tự động đồng bộ từ CSDL Room_BangGia
            </Tag>
            <Button size="small" onClick={loadData} loading={loading}>
              Tải lại giá
            </Button>
          </div>
        )}
      </div>

      {/* Main Matrix Table */}
      <div className="overflow-x-auto rounded-xl shadow-lg border border-slate-200 bg-white">
        <table className="w-full border-collapse text-sm">
          {/* Header row: Package names & colors */}
          <thead>
            <tr>
              <th className="w-[18%] min-w-[170px] bg-slate-50 p-4 border-b border-r border-slate-200">
                {/* Empty cell top-left */}
              </th>
              {DEFAULT_PACKAGES.map((pkg) => (
                <th
                  key={pkg.key}
                  style={{ backgroundColor: pkg.headerBg }}
                  className="w-[16.4%] min-w-[170px] p-4 text-center border-b border-r border-white/20 text-white font-bold transition-all"
                >
                  <div className="text-base sm:text-lg font-bold leading-tight">
                    {pkg.name}
                  </div>
                  {pkg.stars > 0 && (
                    <div className="flex items-center justify-center gap-1 mt-1 text-[#fadb14] text-xs">
                      {Array.from({ length: pkg.stars }).map((_, i) => (
                        <StarFilled key={i} />
                      ))}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {/* Row: Giá 5 ngày */}
            <tr className="hover:bg-slate-50/70 transition-colors">
              <td className="p-3.5 sm:p-4 font-semibold text-slate-700 bg-slate-50/60 border-r border-slate-200">
                Giá 5 ngày
              </td>
              {DEFAULT_PACKAGES.map((pkg) => {
                const dbVal = getDbPrice(pkg.code, "5");
                const price = dbVal ?? pkg.defaultPrices.gia5Ngay;
                return (
                  <td
                    key={pkg.key}
                    className="p-3.5 sm:p-4 text-center border-r border-slate-200 font-semibold text-slate-800"
                  >
                    <span className="text-base font-bold text-slate-900">
                      {formatMoney(price)}
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* Row: Giá 10 ngày */}
            <tr className="hover:bg-slate-50/70 transition-colors">
              <td className="p-3.5 sm:p-4 font-semibold text-slate-700 bg-slate-50/60 border-r border-slate-200">
                Giá 10 ngày
              </td>
              {DEFAULT_PACKAGES.map((pkg) => {
                const dbVal = getDbPrice(pkg.code, "10");
                const price = dbVal ?? pkg.defaultPrices.gia10Ngay;
                return (
                  <td
                    key={pkg.key}
                    className="p-3.5 sm:p-4 text-center border-r border-slate-200 font-medium text-slate-800"
                  >
                    <span className="text-base font-bold text-slate-900">
                      {formatMoney(price)}
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* Row: Giá 15 ngày */}
            <tr className="hover:bg-slate-50/70 transition-colors">
              <td className="p-3.5 sm:p-4 font-semibold text-slate-700 bg-slate-50/60 border-r border-slate-200">
                Giá 15 ngày
              </td>
              {DEFAULT_PACKAGES.map((pkg) => {
                const dbVal = getDbPrice(pkg.code, "15");
                const price = dbVal ?? pkg.defaultPrices.gia15Ngay;
                return (
                  <td
                    key={pkg.key}
                    className="p-3.5 sm:p-4 text-center border-r border-slate-200 font-medium text-slate-800"
                  >
                    <span className="text-base font-bold text-slate-900">
                      {formatMoney(price)}
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* Row: Giá 30 ngày (with discount) */}
            <tr className="hover:bg-slate-50/70 transition-colors bg-amber-50/20">
              <td className="p-3.5 sm:p-4 font-semibold text-slate-700 bg-slate-50/60 border-r border-slate-200">
                Giá 30 ngày
              </td>
              {DEFAULT_PACKAGES.map((pkg) => {
                const dbVal = getDbPrice(pkg.code, "30");
                const finalPrice = dbVal ?? pkg.defaultPrices.gia30NgaySauGiam;
                const originalPrice = pkg.defaultPrices.gia30NgayGoc;
                const discount = pkg.defaultPrices.gia30NgayGiam;

                return (
                  <td
                    key={pkg.key}
                    className="p-3 sm:p-4 text-center border-r border-slate-200"
                  >
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className="text-xs text-slate-400 line-through">
                        {formatMoney(originalPrice)}
                      </span>
                      <span className="inline-block px-2 py-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-100 rounded-full border border-emerald-300">
                        Giảm {discount}%
                      </span>
                      <span className="text-base font-extrabold text-slate-900">
                        {formatMoney(finalPrice)}
                      </span>
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* Row: Giá đẩy tin */}
            <tr className="hover:bg-slate-50/70 transition-colors">
              <td className="p-3.5 sm:p-4 font-semibold text-slate-700 bg-slate-50/60 border-r border-slate-200">
                Giá đẩy tin
              </td>
              {DEFAULT_PACKAGES.map((pkg) => {
                const dbVal = getDbPrice(pkg.code, "DAY");
                const price = dbVal ?? pkg.defaultPrices.giaDayTin;
                return (
                  <td
                    key={pkg.key}
                    className="p-3.5 sm:p-4 text-center border-r border-slate-200 font-bold text-slate-800"
                  >
                    <span className="text-base text-slate-900 font-bold">
                      {formatMoney(price)}
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* Row: Màu sắc tiêu đề */}
            <tr className="hover:bg-slate-50/70 transition-colors">
              <td className="p-3.5 sm:p-4 font-semibold text-slate-700 bg-slate-50/60 border-r border-slate-200">
                Màu sắc tiêu đề
              </td>
              {DEFAULT_PACKAGES.map((pkg) => (
                <td
                  key={pkg.key}
                  className="p-3.5 sm:p-4 text-center border-r border-slate-200 text-xs sm:text-sm"
                >
                  <span
                    style={{ color: pkg.titleStyleColor }}
                    className={
                      pkg.key === "tin_thuong" ? "font-normal" : "font-extrabold"
                    }
                  >
                    {pkg.titleStyleText}
                  </span>
                </td>
              ))}
            </tr>

            {/* Row: Kích thước tin */}
            <tr className="hover:bg-slate-50/70 transition-colors">
              <td className="p-3.5 sm:p-4 font-semibold text-slate-700 bg-slate-50/60 border-r border-slate-200">
                Kích thước tin
              </td>
              {DEFAULT_PACKAGES.map((pkg) => (
                <td
                  key={pkg.key}
                  className="p-3.5 sm:p-4 text-center border-r border-slate-200 text-slate-700 font-medium text-xs sm:text-sm"
                >
                  {pkg.sizeText}
                </td>
              ))}
            </tr>

            {/* Row: Tự động duyệt (*) */}
            <tr className="hover:bg-slate-50/70 transition-colors">
              <td className="p-3.5 sm:p-4 font-semibold text-slate-700 bg-slate-50/60 border-r border-slate-200">
                Tự động duyệt (*)
              </td>
              {DEFAULT_PACKAGES.map((pkg) => (
                <td
                  key={pkg.key}
                  className="p-3.5 sm:p-4 text-center border-r border-slate-200"
                >
                  {pkg.tuDongDuyet ? (
                    <CheckCircleFilled className="text-emerald-500 text-xl" />
                  ) : (
                    <span className="text-slate-300 font-bold">—</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Row: Duy trì thêm 10 ngày tin thường */}
            <tr className="hover:bg-slate-50/70 transition-colors">
              <td className="p-3.5 sm:p-4 font-semibold text-slate-700 bg-slate-50/60 border-r border-slate-200">
                Duy trì thêm 10 ngày tin thường
              </td>
              {DEFAULT_PACKAGES.map((pkg) => (
                <td
                  key={pkg.key}
                  className="p-3.5 sm:p-4 text-center border-r border-slate-200"
                >
                  {pkg.duyTriThem10Ngay ? (
                    <CheckCircleFilled className="text-emerald-500 text-xl" />
                  ) : (
                    <span className="text-slate-300 font-bold">—</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Row: Hiển thị nút gọi điện */}
            <tr className="hover:bg-slate-50/70 transition-colors">
              <td className="p-3.5 sm:p-4 font-semibold text-slate-700 bg-slate-50/60 border-r border-slate-200">
                Hiển thị nút gọi điện
              </td>
              {DEFAULT_PACKAGES.map((pkg) => (
                <td
                  key={pkg.key}
                  className="p-3.5 sm:p-4 text-center border-r border-slate-200"
                >
                  {pkg.hienThiNutGoi ? (
                    <CheckCircleFilled className="text-emerald-500 text-xl" />
                  ) : (
                    <span className="text-slate-300 font-bold">—</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Action Row: Xem demo */}
            <tr className="bg-slate-50/40">
              <td className="p-4 border-r border-slate-200">
                {/* Empty cell */}
              </td>
              {DEFAULT_PACKAGES.map((pkg) => (
                <td
                  key={pkg.key}
                  className="p-4 text-center border-r border-slate-200"
                >
                  <Button
                    type="primary"
                    onClick={() => setDemoModalPkg(pkg)}
                    className="bg-[#1877f2] hover:bg-blue-600 text-white font-medium px-4 h-9 shadow-sm"
                  >
                    Xem demo
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footnote */}
      <div className="mt-4 text-xs sm:text-sm text-slate-500 italic leading-relaxed">
        (*) Các tin VIP sẽ được hiển thị ngay sau khi khách hàng đăng tin mà không cần chờ kiểm duyệt. Tin đăng sẽ được kiểm duyệt nội dung sau.
      </div>

      {/* Demo Modal Preview */}
      {demoModalPkg && (
        <Modal
          title={
            <div className="flex items-center gap-2 text-base font-bold text-slate-800">
              <EyeOutlined className="text-blue-500" />
              <span>Mô phỏng hiển thị: {demoModalPkg.name}</span>
            </div>
          }
          open={true}
          onCancel={() => setDemoModalPkg(null)}
          footer={[
            <Button key="close" onClick={() => setDemoModalPkg(null)}>
              Đóng
            </Button>,
            <Link
              key="post"
              href={`/dang-tin?loaiTin=${demoModalPkg.code}`}
              className="inline-block"
            >
              <Button type="primary" className="bg-blue-600">
                Đăng tin loại này ngay
              </Button>
            </Link>,
          ]}
          width={720}
        >
          <div className="p-2 sm:p-4 space-y-4">
            <p className="text-sm text-slate-600">
              Dưới đây là cách tin đăng gói <strong>{demoModalPkg.name}</strong> sẽ xuất hiện trên trang chủ và danh sách tìm kiếm:
            </p>

            {/* Simulated Post Card */}
            <div
              className={`p-4 rounded-xl border-2 transition-all shadow-md bg-white ${
                demoModalPkg.key === "vip_noibat"
                  ? "border-red-400 ring-2 ring-red-100"
                  : demoModalPkg.key === "vip_1"
                  ? "border-pink-400 ring-2 ring-pink-100"
                  : demoModalPkg.key === "vip_2"
                  ? "border-orange-400 ring-2 ring-orange-100"
                  : demoModalPkg.key === "vip_3"
                  ? "border-blue-400 ring-2 ring-blue-100"
                  : "border-slate-300"
              }`}
            >
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Mock Image */}
                <div className="relative w-full sm:w-48 h-36 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <div className="text-slate-400 text-xs text-center p-2">
                    [Hình ảnh thực tế phòng trọ]
                  </div>
                  {/* Badge */}
                  <div
                    style={{ backgroundColor: demoModalPkg.headerBg }}
                    className="absolute top-2 left-2 px-2 py-0.5 rounded text-[11px] font-bold text-white shadow-sm flex items-center gap-1"
                  >
                    {demoModalPkg.badgeLabel}
                    {demoModalPkg.stars > 0 && (
                      <span className="text-amber-300">
                        {Array.from({ length: demoModalPkg.stars }).map(
                          (_, i) => "★"
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    {/* Title */}
                    <h3
                      style={{ color: demoModalPkg.titleStyleColor }}
                      className={`line-clamp-2 leading-snug mb-2 ${
                        demoModalPkg.key === "tin_thuong"
                          ? "text-sm font-semibold normal-case"
                          : demoModalPkg.key === "vip_noibat"
                          ? "text-base font-extrabold uppercase"
                          : "text-sm sm:text-base font-bold uppercase"
                      }`}
                    >
                      {demoModalPkg.sampleTitle}
                    </h3>

                    {/* Price and Area */}
                    <div className="flex items-center gap-3 text-sm mb-2">
                      <span className="text-emerald-600 font-extrabold text-base">
                        3.5 triệu/tháng
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-600 font-medium">25 m²</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500">
                        Bình Thạnh, TP.HCM
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2">
                      Phòng mới xây 100%, trang bị đầy đủ máy lạnh, tủ lạnh, giường nệm cao cấp. Giờ giấc tự do không chung chủ, bảo vệ 24/7.
                    </p>
                  </div>

                  {/* Actions & Call Button */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-400">
                      Đăng 15 phút trước
                    </span>
                    {demoModalPkg.hienThiNutGoi ? (
                      <Button
                        type="primary"
                        icon={<PhoneFilled />}
                        className="bg-emerald-600 hover:bg-emerald-500 text-xs h-8 px-3 font-semibold"
                      >
                        0988.123.456 - Gọi ngay
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-500">
                        Xem chi tiết tin
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Features summary table */}
            <div className="bg-slate-50 p-3 rounded-lg text-xs space-y-1.5 border border-slate-200">
              <div className="font-semibold text-slate-700 mb-1">
                Quyền lợi nổi bật của gói:
              </div>
              <div className="flex items-center gap-2">
                <CheckOutlined className="text-emerald-500" />
                <span>Kích thước tin: <strong>{demoModalPkg.sizeText}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckOutlined className="text-emerald-500" />
                <span>
                  Tự động duyệt tin ngay khi đăng:{" "}
                  <strong>{demoModalPkg.tuDongDuyet ? "Có" : "Không (kiểm duyệt thủ công)"}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckOutlined className="text-emerald-500" />
                <span>
                  Tặng thêm 10 ngày hiển thị tin thường khi hết hạn:{" "}
                  <strong>{demoModalPkg.duyTriThem10Ngay ? "Có" : "Không"}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckOutlined className="text-emerald-500" />
                <span>
                  Hiển thị nút bấm số điện thoại trực tiếp trên danh sách:{" "}
                  <strong>{demoModalPkg.hienThiNutGoi ? "Có" : "Không"}</strong>
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
