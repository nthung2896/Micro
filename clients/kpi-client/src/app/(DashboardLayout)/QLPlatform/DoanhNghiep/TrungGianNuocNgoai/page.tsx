"use client";
import React from "react";
import PlatformIndexEnterprise from "../../components/PlatformIndexEnterprise";
import withAuthorization from "@/libs/authentication";

const DoanhNghiepTrungGianNuocNgoaiPage: React.FC = () => {
  return (
    <PlatformIndexEnterprise
      platformType="NTTichHopNuocNgoai"
      title="Đăng ký Nền tảng trung gian nước ngoài"
    />
  );
};

export default withAuthorization(DoanhNghiepTrungGianNuocNgoaiPage, "");
