"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PhanAnhNenTangCreateOrUpdate from "../createOrUpdate";

const CreateOrUpdatePageContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const handleClose = () => {
    router.push("/phanAnhNenTang");
  };

  const handleSuccess = () => {
    router.push("/phanAnhNenTang");
  };

  return (
    <PhanAnhNenTangCreateOrUpdate
      id={id}
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
