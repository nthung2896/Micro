"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CreateOrUpdate from "../createOrUpdate";

const CreateOrUpdatePageContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const handleRedirect = (type?: string) => {
    switch (type) {
      case "NTThongBaoKD":
        router.push("/QLPlatform/NenTangTrucTuyen");
        break;
      case "NTDangKyKDNuocNgoai":
        router.push("/QLPlatform/DoanhNghiep/DatHangNuocNgoai");
        break;
      case "NTTichHop":
        router.push("/QLPlatform/DoanhNghiep/TrungGianTrongNuoc");
        break;
      case "NTTichHopNuocNgoai":
        router.push("/QLPlatform/DoanhNghiep/TrungGianNuocNgoai");
        break;
      default:
        router.push("/QLPlatform/NenTangTrucTuyen");
        break;
    }
  };

  const handleClose = (type?: string) => {
    handleRedirect(type);
  };

  const handleSuccess = (type?: string) => {
    handleRedirect(type);
  };

  return (
    <CreateOrUpdate
      isOpen={true}
      item={id ? { id } : null}
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  );
};

const CreateOrUpdatePage: React.FC = () => {
  return (
    <Suspense fallback={<div style={{ padding: 24, textAlign: "center" }}>Đang tải...</div>}>
      <CreateOrUpdatePageContent />
    </Suspense>
  );
};

export default CreateOrUpdatePage;
