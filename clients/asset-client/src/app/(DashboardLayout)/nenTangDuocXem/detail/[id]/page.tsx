"use client";

import React, { Suspense, useEffect, useState } from "react";
import { Spin, message } from "antd";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "@/store/hooks";
import platformManageService from "@/services/platformManage/platformManage.service";
import SpecialistDetail from "../../../QLPlatform/views/Specialist/SpecialistDetail";
import { PlatformManageType } from "@/types/platformManage/dto";

const ISP_OPTIONS = [
  { value: "ViettelIDC", label: "Viettel IDC" },
  { value: "VNPT", label: "VNPT Data Center" },
  { value: "FPT", label: "FPT Telecom" },
  { value: "NhanHoa", label: "Nhân Hòa" },
  { value: "MatBao", label: "Mắt Bão" },
  { value: "CMC", label: "CMC Telecom" },
  { value: "VNGCloud", label: "VNG Cloud" },
  { value: "AWS", label: "Amazon Web Services (AWS)" },
  { value: "Azure", label: "Microsoft Azure" },
  { value: "Khac", label: "Đơn vị hosting khác" },
];

const NenTangDuocXemDetailPageContent: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const id = params.id as string;
  const allowedTabs = searchParams.get("allowedTabs") || undefined;

  const [item, setItem] = useState<PlatformManageType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const authState = useSelector((state: any) => state.auth);
  const currentUser = authState?.User;
  const userRoles: string[] = currentUser?.listRole || authState?.ListRole || [];
  const isAdmin = userRoles.includes("Admin");

  const hasRole = (roleCodes: string[]) => {
    return userRoles.some((r: string) => roleCodes.includes(r));
  };

  const userOperationCodes: string[] = (currentUser?.menuData ?? [])
    .flatMap((module: any) => module.listMenu ?? [])
    .map((op: any) => op.code as string);
  const hasPermission = (code: string) => isAdmin || userOperationCodes.includes(code);

  const roles = {
    isCV: hasRole(["ChuyenVienSo", "ChuyenVienCuc", "Admin"]),
    isTP: hasRole(["TruongPhongSo", "TruongPhongCuc", "Admin"]),
    isLD: hasRole(["LanhDaoSo", "LanhDaoCuc", "Admin"]),
    isDN: hasRole(["DoanhNghiep", "Admin"]),
    canViewTichHop: hasPermission("PLATFORM_MANAGE_DETAIL_TAB_TICHHOP"),
    canEditTichHop: hasPermission("PLATFORM_MANAGE_ACTION_TICHHOP_EDIT"),
  };

  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await platformManageService.get(id);
      if (response.status && response.data) {
        setItem(response.data);
      } else {
        message.error(response.message ?? "Không thể tải thông tin chi tiết hồ sơ");
        router.back();
      }
    } catch (error: any) {
      message.error(error.message ?? "Đã xảy ra lỗi khi tải hồ sơ");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const getFormattedDate = () => {
    const now = new Date();
    const days = [
      "Chủ nhật",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7"
    ];
    const dayName = days[now.getDay()];
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    return `${dayName} ngày ${dd}/${mm}/${yyyy}`;
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", flexDirection: "column", gap: 16 }}>
        <Spin size="large" />
        <span style={{ color: "#64748b", fontWeight: 500 }}>Đang tải thông tin chi tiết nền tảng...</span>
      </div>
    );
  }

  if (!item) return null;

  return (
    <SpecialistDetail
      item={item}
      roles={roles}
      onRefresh={fetchDetail}
      onTransitionClick={() => {}}
      getFormattedDate={getFormattedDate}
      ispOptions={ISP_OPTIONS}
      allowedTabs={allowedTabs}
      backUrl="/nenTangDuocXem"
      hideActions={true}
    />
  );
};

export default function NenTangDuocXemDetailPage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}><Spin size="large" /></div>}>
      <NenTangDuocXemDetailPageContent />
    </Suspense>
  );
}
