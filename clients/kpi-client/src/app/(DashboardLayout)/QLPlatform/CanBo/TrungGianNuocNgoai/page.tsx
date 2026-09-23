"use client";
import React from "react";
import PlatformIndexTemplate from "../../PlatformIndexTemplate";
import withAuthorization from "@/libs/authentication";

const CanBoTrungGianNuocNgoaiPage: React.FC = () => {
  return (
    <PlatformIndexTemplate
      platformType="NTTichHopNuocNgoai"
      title="Nền tảng trung gian nước ngoài (Cán bộ xử lý)"
      specialistRole="ChuyenVienSo"
    />
  );
};

export default withAuthorization(CanBoTrungGianNuocNgoaiPage, "");
