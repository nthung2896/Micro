"use client";
import withAuthorization from "@/libs/authentication";
import { KPI_NhomTieuChiTreeView } from "../KPI_NhomTieuChiTreeViewComponent";

export default withAuthorization(KPI_NhomTieuChiTreeView, "");
