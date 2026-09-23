"use client";
import React from "react";
import DanhGiaComponent from "./DanhGiaComponent";

export default function DanhGiaPage(props: { params: { id: string }; searchParams?: any }) {
  return <DanhGiaComponent {...props} />;
}
