"use client";
import React from "react";
import Link from "next/link";
import { PlusCircleOutlined } from "@ant-design/icons";

interface RoomCtaBannerProps {
  appName: string;
}

export default function RoomCtaBanner({ appName }: RoomCtaBannerProps) {
  return (
    <section className="mt-12 rounded-3xl bg-gradient-to-r from-[#0355a2] via-[#0560b3] to-[#0e6fbf] text-white p-6 sm:p-10 shadow-xl relative overflow-hidden">
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        <div className="lg:col-span-2">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 font-bold text-xs uppercase tracking-wider mb-2 border border-amber-400/30">
            Dành cho chủ trọ &amp; người cho thuê
          </span>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-black leading-tight text-white">
            Bạn có phòng trọ, mặt bằng cần cho thuê?
          </h3>
          <p className="mt-2 text-sm sm:text-base text-blue-100 max-w-xl">
            Đăng tin ngay hôm nay trên sàn {appName}. Quản lý hình ảnh trên MinIO, chỉnh sửa mô tả chuyên nghiệp và tiếp cận người thuê nhanh chóng!
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-blue-200">
            <span>✓ Đăng tin nhanh chóng</span>
            <span>✓ Hỗ trợ gói VIP đẩy tin</span>
            <span>✓ Quản lý phòng trực quan</span>
          </div>
        </div>

        <div className="lg:text-right">
          <Link
            href="/phongTro"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-black text-base text-blue-900 bg-gradient-to-r from-amber-300 to-yellow-400 hover:from-amber-400 hover:to-yellow-500 shadow-[0_8px_20px_rgba(251,191,36,0.35)] hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <PlusCircleOutlined className="text-lg" />
            <span>VÀO QUẢN LÝ PHÒNG TRỌ</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
