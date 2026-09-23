"use client";
import React from "react";

interface RoomPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function RoomPagination({
  currentPage,
  totalPages,
  onPageChange,
}: RoomPaginationProps) {
  if (totalPages <= 1) return null;

  // Xây dựng danh sách các số trang hiển thị
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 my-8 select-none">
      {/* Nút « Trang trước */}
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-3 h-9 rounded bg-white border border-gray-300 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        « Trang trước
      </button>

      {/* Các số trang */}
      {pages.map((item, idx) => {
        if (typeof item === "string") {
          return (
            <span
              key={`ellipsis-${idx}`}
              className="w-8 h-9 flex items-center justify-center text-gray-400 font-bold text-sm"
            >
              ...
            </span>
          );
        }

        const isActive = item === currentPage;
        return (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            className={`w-9 h-9 rounded text-xs sm:text-sm font-bold flex items-center justify-center transition-all cursor-pointer ${
              isActive
                ? "bg-[#ff5722] text-white shadow-sm border border-[#ff5722]"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {item}
          </button>
        );
      })}

      {/* Nút Trang sau » */}
      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-3 h-9 rounded bg-white border border-gray-300 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        Trang sau »
      </button>
    </div>
  );
}
