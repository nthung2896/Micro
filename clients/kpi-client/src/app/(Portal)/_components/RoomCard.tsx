"use client";
import React, { useState, useEffect } from "react";
import {
  EnvironmentOutlined,
  HeartOutlined,
  HeartFilled,
  CameraOutlined,
  StarFilled,
  PhoneOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { RoomListing } from "./types";
import { formatVnd, formatPriceVnd } from "./utils";
import { buildFileUrl } from "@/utils/file";

interface RoomCardProps {
  room: RoomListing;
  isVip: boolean;
  onDetailClick: () => void;
  onContactClick?: () => void;
}

export default function RoomCard({
  room,
  isVip,
  onDetailClick,
}: RoomCardProps) {
  const [liked, setLiked] = useState(false);

  // Kiểm tra trạng thái đã lưu từ localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = JSON.parse(localStorage.getItem("SAVED_ROOMS") || "[]");
        setLiked(saved.some((r: any) => r.id === room.id));
      } catch (e) {
        // ignore
      }
    }
  }, [room.id]);

  const toggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === "undefined") return;
    try {
      const saved = JSON.parse(localStorage.getItem("SAVED_ROOMS") || "[]");
      if (liked) {
        const updated = saved.filter((r: any) => r.id !== room.id);
        localStorage.setItem("SAVED_ROOMS", JSON.stringify(updated));
        setLiked(false);
      } else {
        saved.push(room);
        localStorage.setItem("SAVED_ROOMS", JSON.stringify(saved));
        setLiked(true);
      }
      window.dispatchEvent(new Event("storage"));
    } catch (err) {
      console.error(err);
    }
  };

  const imageCount = room.danhSachHinhAnh?.length || 3;

  return (
    <div
      onClick={onDetailClick}
      className={`group bg-white rounded-xl border transition-all duration-200 overflow-hidden hover:shadow-md p-3 sm:p-3.5 flex flex-col sm:flex-row gap-3.5 sm:gap-4 relative cursor-pointer ${
        isVip
          ? "border-amber-300 bg-amber-50/5 hover:border-amber-400 shadow-[0_2px_10px_rgba(245,158,11,0.06)]"
          : "border-gray-200 hover:border-blue-400"
      }`}
    >
      {/* ẢNH PHÒNG NẰM BÊN TRÁI */}
      <div className="relative w-full sm:w-[195px] md:w-[210px] h-48 sm:h-auto min-h-[160px] sm:min-h-[175px] rounded-lg overflow-hidden shrink-0 bg-gray-100">
        <img
          src={buildFileUrl(room.hinhAnhDaiDien)}
          alt={room.tieuDe}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badge VIP & Loại phòng */}
        <div className="absolute top-2 left-2 flex items-center gap-1 flex-wrap">
          {isVip && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-sm flex items-center gap-0.5">
              <StarFilled className="text-yellow-300 text-[9px]" />
              VIP
            </span>
          )}
          {room.maPhong && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white shadow-sm">
              {room.maPhong}
            </span>
          )}
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-black/60 backdrop-blur-xs text-white">
            {room.loaiPhong}
          </span>
        </div>

        {/* Số lượng ảnh góc dưới trái: 📷 3 */}
        <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white font-medium text-[10px] flex items-center gap-1">
          <CameraOutlined className="text-[10px]" />
          <span>{imageCount}</span>
        </div>
      </div>

      {/* THÔNG TIN CHI TIẾT (BÊN PHẢI) */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          {/* 1. Tiêu đề tin đăng */}
          <h3
            className={`font-bold text-xs sm:text-[14px] md:text-[14.5px] leading-snug transition-colors line-clamp-2 uppercase ${
              isVip
                ? "text-[#c62828] group-hover:text-[#ff5722]"
                : "text-[#0055b8] group-hover:text-[#ff5722]"
            }`}
          >
            {room.tieuDe}
          </h3>

          {/* 2. Dòng Giá thuê · Diện tích · Tiền cọc · Địa chỉ */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs sm:text-sm">
            <span className="font-extrabold text-base sm:text-[17px] text-[#16a34a] tracking-tight">
              {formatPriceVnd(room.giaChoThue)}
            </span>
            <span className="text-gray-300">·</span>
            <span className="font-bold text-gray-700">
              {room.dienTich > 0 ? `${room.dienTich} m²` : "Thỏa thuận"}
            </span>

            {/* Tiền cọc */}
            {room.tienCoc > 0 && (
              <>
                <span className="text-gray-300">·</span>
                <span className="text-[11px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded font-medium border border-amber-200">
                  Cọc {formatPriceVnd(room.tienCoc)}
                </span>
              </>
            )}

            <span className="text-gray-300">·</span>
            <span className="text-gray-500 flex items-center gap-1 text-xs truncate max-w-[240px]">
              <EnvironmentOutlined className="text-gray-400 text-xs shrink-0" />
              <span className="truncate">
                {room.tenHuyen ? `${room.tenHuyen}, ${room.tenTinh}` : room.diaChi}
              </span>
            </span>
          </div>

          {/* 3. DẢI GIÁ DỊCH VỤ XEM NHANH: ĐIỆN, NƯỚC, INTERNET */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[11px]">
            {/* Giá Điện */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50/80 text-blue-700 font-medium border border-blue-100">
              <ThunderboltOutlined className="text-amber-500 text-xs" />
              <span>Điện:</span>
              <strong>
                {room.giaDien > 0
                  ? `${formatVnd(room.giaDien)}/${room.donViDien || "số"}`
                  : "Bao trọn"}
              </strong>
            </span>

            {/* Giá Nước */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50/80 text-blue-700 font-medium border border-blue-100">
              <span>💧 Nước:</span>
              <strong>
                {room.giaNuoc > 0
                  ? `${formatVnd(room.giaNuoc)}/${room.donViNuoc || "khối"}`
                  : "Bao trọn"}
              </strong>
            </span>

            {/* Giá Internet */}
            {room.giaInternet !== undefined && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-50 text-slate-700 font-medium border border-slate-200">
                <span>📶 Mạng:</span>
                <strong>
                  {room.giaInternet > 0
                    ? `${formatVnd(room.giaInternet)}/${room.donViInternet || "phòng"}`
                    : "Miễn phí"}
                </strong>
              </span>
            )}
          </div>

          {/* 4. TIỆN NGHI RÚT GỌN XEM NHANH */}
          <div className="flex flex-wrap items-center gap-1 mt-1.5 text-[11px] text-gray-600">
            {room.coDieuHoa && (
              <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                ❄️ Điều hòa
              </span>
            )}
            {room.coNongLanh && (
              <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                🚿 Nóng lạnh
              </span>
            )}
            {room.coMayGiat && (
              <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                🧺 Máy giặt
              </span>
            )}
            {room.coTuLanh && (
              <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                🧊 Tủ lạnh
              </span>
            )}
            {room.coBanCong && (
              <span className="px-1.5 py-0.5 rounded bg-green-50 text-green-700 font-medium border border-green-100">
                🌿 Ban công
              </span>
            )}
            {room.gioGiacTuDo && (
              <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-medium border border-amber-100">
                ⏰ Giờ tự do
              </span>
            )}
            {room.khongChungChu && (
              <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                🔑 Không chung chủ
              </span>
            )}
            {room.coThangMay && (
              <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                🛗 Thang máy
              </span>
            )}
          </div>

          {/* 5. Đoạn trích mô tả phòng ngắn gọn 2 dòng */}
          <p className="text-xs text-gray-500 line-clamp-2 mt-1.5 leading-relaxed font-normal">
            {room.moTa
              ? room.moTa.replace(/<[^>]*>?/gm, "").trim()
              : "Phòng thoáng mát, sạch sẽ, an ninh tốt, giờ giấc tự do không chung chủ, đầy đủ tiện nghi, liên hệ xem phòng trực tiếp."}
          </p>
        </div>

        {/* 6. Hàng chân thẻ: Người đăng, SĐT gọi nhanh, Zalo, Ngày đăng, Nút Lưu tim */}
        <div className="mt-2.5 pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
          {/* Người liên hệ & Ngày đăng */}
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0">
              {room.tenLienHe?.charAt(0)?.toUpperCase() || "C"}
            </div>
            <span className="text-xs font-semibold text-gray-700 truncate max-w-[120px]">
              {room.tenLienHe}
            </span>
            <span className="text-[11px] text-gray-400">· {room.ngayDang || "Hôm nay"}</span>
          </div>

          {/* Nút Gọi & Zalo & Tim lưu tin */}
          <div className="flex items-center gap-1.5">
            {/* Nút Gọi nhanh kèm SĐT */}
            {room.soDienThoaiLienHe && (
              <a
                href={`tel:${room.soDienThoaiLienHe}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#16a34a] hover:bg-[#15803d] text-white font-bold text-xs shadow-xs transition-colors"
                title="Bấm để gọi ngay"
              >
                <PhoneOutlined className="text-xs" />
                <span>{room.soDienThoaiLienHe}</span>
              </a>
            )}

            {/* Nút Nhắn Zalo */}
            {room.zaloLienHe && (
              <a
                href={`https://zalo.me/${room.zaloLienHe}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs border border-blue-200 transition-colors"
                title="Nhắn Zalo"
              >
                Zalo
              </a>
            )}

            {/* Nút lưu tin */}
            <button
              type="button"
              onClick={toggleSave}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors cursor-pointer ml-0.5"
              title={liked ? "Bỏ lưu tin" : "Lưu tin này"}
            >
              {liked ? (
                <HeartFilled className="text-red-500 text-base" />
              ) : (
                <HeartOutlined className="text-base hover:scale-110 transition-transform" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
