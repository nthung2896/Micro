"use client";
import React from "react";
import PlatformIndexEnterprise from "../../components/PlatformIndexEnterprise";
import withAuthorization from "@/libs/authentication";

const DoanhNghiepTrungGianTrongNuocPage: React.FC = () => {
  return (
    <PlatformIndexEnterprise
      platformType="NTTichHop"
      title="Đăng ký Nền tảng trung gian trong nước"
    />
  );
};

export default withAuthorization(DoanhNghiepTrungGianTrongNuocPage, "");
