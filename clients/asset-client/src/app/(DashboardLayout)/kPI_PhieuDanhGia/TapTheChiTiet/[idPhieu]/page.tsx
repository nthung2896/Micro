"use client";
import React, { Suspense } from "react";
import { Spin } from "antd";
import DanhGiaTapTheMultiCapComponent from "./DanhGiaMultiCapTapTheComponent";

export default function DanhGiaMultiCapPage({
  params,
}: {
  params: { idPhieu: string };
}) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><Spin size="large" tip="Đang tải..." /></div>}>
      <DanhGiaTapTheMultiCapComponent idPhieu={params.idPhieu} />
    </Suspense>
  );
}
