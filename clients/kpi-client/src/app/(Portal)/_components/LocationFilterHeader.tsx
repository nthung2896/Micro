"use client";
import React from "react";
import Link from "next/link";
import { PROVINCE_PILLS } from "./constants";

interface LocationFilterHeaderProps {
  selectedTinh?: string;
  tinhOptions: { label: string; value: string }[];
  totalRooms: number;
  onSelectTinh: (code?: string) => void;
}

export default function LocationFilterHeader({
  selectedTinh,
  tinhOptions,
  totalRooms,
  onSelectTinh,
}: LocationFilterHeaderProps) {
  const currentTinhLabel = selectedTinh
    ? tinhOptions.find((t) => t.value === selectedTinh)?.label ||
      (selectedTinh === "01" ? "Hà Nội" : selectedTinh)
    : "Hà Nội";

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 mb-6 border border-gray-200 shadow-sm">
      {/* Breadcrumb */}
      <div className="text-xs text-gray-500 mb-2 flex items-center gap-1.5 font-medium flex-wrap">
        <Link href="/" className="hover:text-blue-600">
          Trang chủ
        </Link>
        <span>/</span>
        <span className="text-blue-600 font-semibold">Cho thuê phòng trọ</span>
        {selectedTinh && (
          <>
            <span>/</span>
            <span className="text-gray-800 font-bold">{currentTinhLabel}</span>
          </>
        )}
      </div>

      <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
        Cho Thuê Phòng Trọ {currentTinhLabel}, Giá Rẻ, Tiện Nghi, Mới Nhất 2026
      </h1>
      <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
        Có <b className="text-red-600 font-bold">{totalRooms}</b> tin đăng cho thuê.
      </p>

      {/* TỈNH THÀNH PILLS */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
          TỈNH THÀNH
        </div>
        <div className="flex flex-wrap gap-2">
          {PROVINCE_PILLS.map((p) => {
            const isActive =
              (p.code === undefined && !selectedTinh) || selectedTinh === p.code;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => onSelectTinh(p.code)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 border cursor-pointer ${
                  isActive
                    ? "border-red-500 bg-red-50 text-red-600 shadow-sm"
                    : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 hover:border-gray-300"
                }`}
              >
                {p.label}
                {isActive && <span className="ml-1 text-[10px]">✓</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
