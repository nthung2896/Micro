"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import VuViecPhanAnhDetail from "../detail";

const DetailPageContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const handleClose = () => {
    router.push("/vuViecPhanAnh");
  };

  const handleEdit = (editId: string) => {
    router.push(`/vuViecPhanAnh/createOrUpdate?id=${editId}`);
  };

  const handleSuccess = () => {
    // Refresh page or handle success
  };

  return (
    <VuViecPhanAnhDetail
      id={id}
      onClose={handleClose}
      onEdit={handleEdit}
      onSuccess={handleSuccess}
    />
  );
};

const DetailPage: React.FC = () => {
  return (
    <Suspense fallback={<div style={{ padding: 24, textAlign: "center" }}>Đang tải...</div>}>
      <DetailPageContent />
    </Suspense>
  );
};

export default DetailPage;
