"use client";
import React from "react";
import { SearchOutlined } from "@ant-design/icons";

interface KeywordSuggestionsProps {
  onKeywordClick: (kw: string) => void;
}

const POPULAR_KEYWORDS = [
  "Thuê nhà nguyên căn giá 4 triệu TPHCM",
  "Thuê phòng trọ Cầu Giấy Hà Nội",
  "Thuê chung cư mini Đống Đa full đồ",
  "Phòng trọ gần Bách - Kinh - Xây",
  "Thuê phòng trọ Quận 7 giá rẻ",
  "Căn hộ dịch vụ Bình Thạnh",
  "Phòng trọ sinh viên giá 2 triệu",
  "Thuê nhà nguyên căn Hà Nội",
];

export default function KeywordSuggestions({
  onKeywordClick,
}: KeywordSuggestionsProps) {
  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <h3 className="font-bold text-gray-800 text-sm sm:text-base mb-3">
        Tìm kiếm theo từ khóa
      </h3>
      <div className="flex flex-wrap gap-2 mb-8">
        {POPULAR_KEYWORDS.map((kw) => (
          <button
            key={kw}
            type="button"
            onClick={() => onKeywordClick(kw)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 text-blue-700 text-xs sm:text-[13px] font-medium transition-all hover:scale-[1.02] cursor-pointer"
          >
            <SearchOutlined className="text-blue-500 text-xs" />
            <span>{kw}</span>
          </button>
        ))}
      </div>

      {/* Khối giới thiệu chuẩn SEO theo mẫu chân trang */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 sm:p-6 text-gray-600 leading-relaxed text-xs sm:text-sm">
        <h4 className="font-black text-gray-900 text-base sm:text-lg mb-2 uppercase text-center sm:text-left">
          CHO THUÊ PHÒNG TRỌ, NHÀ NGUYÊN CĂN, CĂN HỘ GIÁ RẺ
        </h4>
        <p className="text-gray-500 mb-2">
          Kênh thông tin kết nối phòng trọ, nhà nguyên căn, căn hộ mini xác thực
          hàng đầu. Hỗ trợ hàng triệu người tìm kiếm chỗ ở ưng ý, nhanh chóng, an
          toàn với thông tin minh bạch về giá cả, tiện nghi và liên hệ trực tiếp
          chính chủ không qua trung gian.
        </p>
        <p className="text-gray-500">
          Tất cả tin đăng đều được kiểm duyệt kỹ càng về địa chỉ thực tế, hình ảnh
          chân thực và chi phí dịch vụ rõ ràng, giúp bạn an tâm tuyệt đối khi lựa
          chọn nơi an cư lập nghiệp.
        </p>
      </div>
    </div>
  );
}
