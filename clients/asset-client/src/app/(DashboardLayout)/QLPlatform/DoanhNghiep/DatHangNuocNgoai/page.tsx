"use client";
import React from "react";
import PlatformIndexEnterprise from "../../components/PlatformIndexEnterprise";
import withAuthorization from "@/libs/authentication";

const DoanhNghiepDatHangNuocNgoaiPage: React.FC = () => {
  return (
    <PlatformIndexEnterprise
      platformType="NTDangKyKDNuocNgoai"
      title="Đăng ký Nền tảng đặt hàng trực tuyến nước ngoài"
    />
  );
};

export default withAuthorization(DoanhNghiepDatHangNuocNgoaiPage, "");
