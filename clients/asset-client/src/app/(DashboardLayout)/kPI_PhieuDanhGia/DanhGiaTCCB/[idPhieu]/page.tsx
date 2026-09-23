"use client";
import React, { Suspense } from "react";
import { Spin } from "antd";
import DanhGiaTCCBComponent from "./DanhGiaTCCBComponent";

export default function DanhGiaTCCBPage({
  params,
}: {
  params: { idPhieu: string };
}) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><Spin size="large" tip="Đang tải..." /></div>}>
      <DanhGiaTCCBComponent idPhieu={params.idPhieu} />
    </Suspense>
  );
}
