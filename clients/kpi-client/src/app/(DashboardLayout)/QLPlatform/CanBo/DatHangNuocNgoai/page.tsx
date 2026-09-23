"use client";
import React from "react";
import PlatformIndexTemplate from "../../PlatformIndexTemplate";
import withAuthorization from "@/libs/authentication";

const CanBoDatHangNuocNgoaiPage: React.FC = () => {
  return (
    <PlatformIndexTemplate
      platformType="NTDangKyKDNuocNgoai"
      title="Nền tảng đặt hàng trực tuyến nước ngoài (Cán bộ xử lý)"
      specialistRole="ChuyenVienSo"
    />
  );
};

export default withAuthorization(CanBoDatHangNuocNgoaiPage, "");
