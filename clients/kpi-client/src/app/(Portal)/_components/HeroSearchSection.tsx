"use client";
import React from "react";
import { Input, Select, Button } from "antd";
import { SearchOutlined, ClearOutlined } from "@ant-design/icons";
import { FilterAmenities } from "./types";
import { PRICE_RANGES, ROOM_TYPES } from "./constants";

interface HeroSearchSectionProps {
  appName: string;
  keyword: string;
  onKeywordChange: (kw: string) => void;
  selectedTinh?: string;
  onTinhChange: (val?: string) => void;
  tinhOptions: { label: string; value: string }[];
  selectedPrice: string;
  onPriceChange: (val: string) => void;
  selectedType: string;
  onTypeChange: (val: string) => void;
  filterAmenities: FilterAmenities;
  onToggleAmenity: (key: keyof FilterAmenities) => void;
  onResetFilter: () => void;
  foundCount: number;
}

export default function HeroSearchSection({
  appName,
  keyword,
  onKeywordChange,
  selectedTinh,
  onTinhChange,
  tinhOptions,
  selectedPrice,
  onPriceChange,
  selectedType,
  onTypeChange,
  filterAmenities,
  onToggleAmenity,
  onResetFilter,
  foundCount,
}: HeroSearchSectionProps) {
  const amenityList: { key: keyof FilterAmenities; label: string }[] = [
    { key: "dieuHoa", label: "❄️ Điều hòa" },
    { key: "nongLanh", label: "🚿 Nóng lạnh" },
    { key: "mayGiat", label: "🧺 Máy giặt" },
    { key: "gioTuDo", label: "⏰ Giờ tự do" },
    { key: "tuLanh", label: "🧊 Tủ lạnh" },
    { key: "banCong", label: "🌿 Ban công" },
  ];

  return (
    <section className="relative text-white py-12 lg:py-16 overflow-hidden min-h-[380px] flex items-center">
      {/* Background Image với Gradient Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-700"
        style={{
          backgroundImage: "url('/images/hero-bg.jpg')",
          backgroundPosition: "center 40%",
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#01254a]/90 via-[#034480]/85 to-[#052b52]/95 backdrop-blur-[2px]" />

      <div className="max-w-[1240px] mx-auto px-4 relative z-10 w-full">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-semibold mb-3 border border-white/15 shadow-sm">
            <span>⚡ CỔNG THÔNG TIN &amp; SÀN TÌM KIẾM PHÒNG TRỌ CHÍNH CHỦ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Tìm phòng trọ, căn hộ ưng ý cùng {appName}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-blue-100/90 font-medium">
            Khám phá phòng trọ, chung cư mini xác thực, minh bạch giá điện nước và liên hệ trực tiếp chủ nhà!
          </p>
        </div>

        {/* Khung Bộ Lọc & Tìm Kiếm */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 sm:p-6 shadow-2xl border border-white/40 w-full text-gray-800">
          {/* Hàng 1: Ô tìm kiếm từ khóa rộng */}
          <div className="mb-3">
            <Input
              size="large"
              prefix={<SearchOutlined className="text-gray-400 mr-1 text-base" />}
              placeholder="Tìm theo tên phòng, đường phố, khu vực (VD: P.302, Trần Thái Tông, Cầu Giấy, Hà Nội...)"
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              allowClear
              className="rounded-xl text-sm"
            />
          </div>

          {/* Hàng 2: Bộ chọn Tỉnh / Mức giá / Loại phòng */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                Tỉnh / Thành phố
              </label>
              <Select
                className="w-full"
                size="large"
                placeholder="Chọn Tỉnh / TP"
                value={selectedTinh}
                onChange={onTinhChange}
                allowClear
                showSearch
                options={tinhOptions}
                filterOption={(input, option) =>
                  (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                Khoảng giá thuê
              </label>
              <Select
                className="w-full"
                size="large"
                value={selectedPrice}
                onChange={onPriceChange}
                options={PRICE_RANGES}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">
                Loại bất động sản
              </label>
              <Select
                className="w-full"
                size="large"
                value={selectedType}
                onChange={onTypeChange}
                options={ROOM_TYPES}
              />
            </div>
          </div>

          {/* Hàng 3: Tiện nghi lọc nhanh */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-xs font-bold text-gray-600 mr-1">Tiện nghi:</span>
              {amenityList.map((item) => {
                const isActive = filterAmenities[item.key];
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onToggleAmenity(item.key)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-200 border cursor-pointer ${
                      isActive
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={onResetFilter}
                icon={<ClearOutlined />}
                size="middle"
                className="text-xs text-gray-500 hover:text-red-500"
              >
                Xóa lọc
              </Button>
              <div className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                Tìm thấy <b>{foundCount}</b> phòng
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
