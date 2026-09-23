"use client";

import React from "react";
import PlatformIndexEnterprise from "../components/PlatformIndexEnterprise";
import withAuthorization from "@/libs/authentication";

const EnterprisePlatformPage: React.FC = () => {
  return (
    <PlatformIndexEnterprise 
      platformType="All" 
      title="Danh sách Nền tảng kê khai của Doanh nghiệp" 
    />
  );
};

// Chỉ cho phép người dùng có quyền Doanh nghiệp hoặc Admin truy cập
export default withAuthorization(EnterprisePlatformPage, "");
