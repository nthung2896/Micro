"use client";
import React from "react";
import { RoomListing } from "./types";
import { formatPriceVnd } from "./utils";
import { buildFileUrl } from "@/utils/file";

interface RoomSidebarProps {
  rooms: RoomListing[];
  selectedPrice: string;
  onSelectPrice: (price: string) => void;
  selectedArea: string;
  onSelectArea: (area: string) => void;
  selectedType: string;
  onSelectType: (type: string) => void;
  onDetailClick: (room: RoomListing) => void;
}

export default function RoomSidebar({
  rooms,
  selectedPrice,
  onSelectPrice,
  selectedArea,
  onSelectArea,
  selectedType,
  onSelectType,
  onDetailClick,
}: RoomSidebarProps) {
  const priceItems = [
    { label: "Dưới 1 triệu", value: "<1m" },
    { label: "Từ 1 - 2 triệu", value: "1-2m" },
    { label: "Từ 2 - 3 triệu", value: "2-3m" },
    { label: "Từ 3 - 5 triệu", value: "3-5m" },
    { label: "Từ 5 - 7 triệu", value: "5-7m" },
    { label: "Từ 7 - 10 triệu", value: "7-10m" },
    { label: "Từ 10 - 15 triệu", value: "10-15m" },
    { label: "Trên 15 triệu", value: ">15m" },
  ];

  const areaItems = [
    { label: "Dưới 20 m²", value: "<20" },
    { label: "Từ 20 - 30 m²", value: "20-30" },
    { label: "Từ 30 - 50 m²", value: "30-50" },
    { label: "Từ 50 - 70 m²", value: "50-70" },
    { label: "Từ 70 - 90 m²", value: "70-90" },
    { label: "Trên 90 m²", value: ">90" },
  ];

  const categoryItems = [
    { label: "Phòng trọ cho thuê", type: "Phòng trọ" },
    { label: "Chung cư mini", type: "Chung cư mini" },
    { label: "Căn hộ dịch vụ", type: "Căn hộ dịch vụ" },
    { label: "Nhà nguyên căn", type: "Nhà nguyên căn" },
    { label: "Mặt bằng kinh doanh", type: "Mặt bằng kinh doanh" },
    { label: "Ở ghép / Ký túc xá", type: "Ở ghép / Ký túc xá" },
  ];

  return (
    <div className="space-y-5">
      {/* WIDGET 1: XEM THEO KHOẢNG GIÁ */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-tight mb-3">
          Xem theo khoảng giá
        </h3>
        <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-xs">
          {priceItems.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onSelectPrice(selectedPrice === item.value ? "ALL" : item.value)}
              className={`text-left py-1 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer ${
                selectedPrice === item.value ? "text-red-600 font-bold" : "text-gray-700"
              }`}
            >
              <span className="text-gray-400 font-mono text-sm">›</span>
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* WIDGET 2: XEM THEO DIỆN TÍCH */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-tight mb-3">
          Xem theo diện tích
        </h3>
        <div className="grid grid-cols-2 gap-x-2 gap-y-2 text-xs">
          {areaItems.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onSelectArea(selectedArea === item.value ? "ALL" : item.value)}
              className={`text-left py-1 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer ${
                selectedArea === item.value ? "text-red-600 font-bold" : "text-gray-700"
              }`}
            >
              <span className="text-gray-400 font-mono text-sm">›</span>
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* WIDGET 3: DANH MỤC CHO THUÊ */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-tight mb-3">
          Danh mục cho thuê
        </h3>
        <div className="space-y-1.5 text-xs">
          {categoryItems.map((cat) => {
            const count = rooms.filter((r) => r.loaiPhong === cat.type).length;
            return (
              <button
                key={cat.type}
                type="button"
                onClick={() => onSelectType(selectedType === cat.type ? "ALL" : cat.type)}
                className={`w-full text-left py-1 hover:text-red-600 transition-colors flex items-center justify-between cursor-pointer ${
                  selectedType === cat.type ? "text-red-600 font-bold" : "text-gray-700"
                }`}
              >
                <span className="flex items-center gap-1">
                  <span className="text-gray-400 font-mono text-sm">›</span>
                  <span>{cat.label}</span>
                </span>
                <span className="text-[11px] text-gray-400 font-medium">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* WIDGET 4: TIN MỚI ĐĂNG (MINI CARDS) */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-tight mb-3">
          Tin mới đăng
        </h3>
        <div className="space-y-3">
          {rooms.slice(0, 4).map((r) => (
            <div
              key={r.id}
              onClick={() => onDetailClick(r)}
              className="flex gap-3 cursor-pointer group pb-3 border-b border-gray-100 last:border-b-0 last:pb-0"
            >
              <img
                src={buildFileUrl(r.hinhAnhDaiDien)}
                alt={r.tieuDe}
                className="w-16 h-16 rounded-lg object-cover shrink-0 group-hover:opacity-90"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=60";
                }}
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-gray-800 group-hover:text-blue-600 line-clamp-2 leading-snug">
                  {r.tieuDe}
                </h4>
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <span className="font-black text-[#009944]">{formatPriceVnd(r.giaChoThue)}</span>
                  <span className="text-gray-400">{r.ngayDang}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
