"use client";
import React from "react";
import PlatformIndexTemplate from "../../PlatformIndexTemplate";
import withAuthorization from "@/libs/authentication";

const CanBoTrungGianTrongNuocPage: React.FC = () => {
  return (
    <PlatformIndexTemplate
      platformType="NTTichHop"
      title="Nền tảng trung gian trong nước (Cán bộ xử lý)"
      specialistRole="ChuyenVienSo"
    />
  );
};

export default withAuthorization(CanBoTrungGianTrongNuocPage, "");
