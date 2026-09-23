"use client";
import React, { Suspense } from "react";
import { Spin } from "antd";
import DanhGiaMultiCapComponent from "./DanhGiaMultiCapComponent";

export default function DanhGiaMultiCapPage({
  params,
}: {
  params: { idPhieu: string };
}) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><Spin size="large" tip="Đang tải..." /></div>}>
      <DanhGiaMultiCapComponent idPhieu={params.idPhieu} />
    </Suspense>
  );
}
