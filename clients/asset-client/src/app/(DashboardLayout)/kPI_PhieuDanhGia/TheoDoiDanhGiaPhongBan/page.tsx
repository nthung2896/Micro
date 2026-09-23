"use client";

import React from "react";
import withAuthorization from "@/libs/authentication";
import { TheoDoiDanhGiaPhongBanComponent } from "./TheoDoiDanhGiaPhongBanComponent";

const TheoDoiDanhGiaPhongBanPage: React.FC = () => (
  <TheoDoiDanhGiaPhongBanComponent defaultDashboardMode={true} />
);

export default withAuthorization(TheoDoiDanhGiaPhongBanPage, "");
