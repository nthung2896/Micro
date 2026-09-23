"use client";

import React, { useState, useEffect } from "react";
import { Card, Tabs, Button, Tag, Space, Divider, Table, message } from "antd";
import { CalendarOutlined, ArrowLeftOutlined, EyeOutlined } from "@ant-design/icons";
import { PlatformManageType } from "@/types/platformManage/dto";
import PlatformStatusConstant from "@/constants/PlatformStatusConstant";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import vuViecPhanAnhService from "@/services/vuViecPhanAnh/vuViecPhanAnh.service";
import nenTangViPhamService from "@/services/nenTangViPham/nenTangViPham.service";

// Sub-components
import DetailInfoTab from "../../components/DetailInfoTab";
import HistoryTab from "../../components/HistoryTab";
import TaiLieuDinhKemTab from "../../NenTangTrucTuyen/detail/TaiLieuDinhKemTab";
import LichSuThayDoiTab from "../../NenTangTrucTuyen/detail/LichSuThayDoiTab";
import YeuCauDoanhNghiepTab from "../../NenTangTrucTuyen/detail/YeuCauDoanhNghiepTab";
import EmptyTabPanel from "../../NenTangTrucTuyen/detail/EmptyTabPanel";
import SpecialistAction from "./SpecialistAction";
import CucSpecialistAction from "./CucSpecialistAction";
import ThongTinKySo from "../../../hop-dong/components/ThongTinKySo";
import platformManageService from "@/services/platformManage/platformManage.service";
import DvcSyncLogTab from "../../components/DvcSyncLogTab";
import EnterprisePlatformItemTab from "../../components/EnterprisePlatformItemTab";

interface SpecialistDetailProps {
  item: PlatformManageType;
  roles: any;
  onRefresh: () => void;
  onTransitionClick: (config: any) => void;
  getFormattedDate: () => string;
  ispOptions: any[];
  allowedTabs?: string;
  backUrl?: string;
  hideActions?: boolean;
}

const getKetLuanTag = (ketLuan?: number) => {
  switch (ketLuan) {
    case 1:
      return <Tag color="error" style={{ borderRadius: "4px" }}>Có vi phạm</Tag>;
    case 2:
      return <Tag color="success" style={{ borderRadius: "4px" }}>Không vi phạm</Tag>;
    default:
      return <Tag color="default" style={{ borderRadius: "4px" }}>Chưa kết luận</Tag>;
  }
};

const SpecialistDetail: React.FC<SpecialistDetailProps> = ({
  item,
  roles,
  onRefresh,
  onTransitionClick,
  getFormattedDate,
  ispOptions,
  allowedTabs,
  backUrl,
  hideActions,
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("1");
  const [vuViecs, setVuViecs] = useState<any[]>([]);
  const [loadingVuViecs, setLoadingVuViecs] = useState(false);
  const [viPhams, setViPhams] = useState<any[]>([]);
  const [loadingViPhams, setLoadingViPhams] = useState(false);

  const fetchVuViecs = async () => {
    if (!item?.id) return;
    setLoadingVuViecs(true);
    try {
      const res = await vuViecPhanAnhService.getData({
        pageIndex: 1,
        pageSize: 1000,
        nenTangLienKetId: item.id,
      } as any);
      if (res.status && res.data?.items) {
        setVuViecs(res.data.items);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingVuViecs(false);
    }
  };

  const fetchViPhams = async () => {
    if (!item?.id) return;
    setLoadingViPhams(true);
    try {
      const res = await nenTangViPhamService.getData({
        pageIndex: 1,
        pageSize: 1000,
        nenTangLienKetId: item.id,
      } as any);
      if (res.status && res.data?.items) {
        setViPhams(res.data.items);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingViPhams(false);
    }
  };

  useEffect(() => {
    if (activeTab === "5") {
      fetchVuViecs();
    } else if (activeTab === "6") {
      fetchViPhams();
    }
  }, [activeTab, item?.id]);

  const getListPageLabel = () => {
    switch (item.platformManageTypeId) {
      case "NTThongBaoKD":
        return "Nền tảng trực tuyến";
      case "NTDangKyKDNuocNgoai":
        return "Đặt hàng nước ngoài";
      case "NTTichHop":
        return "Trung gian trong nước";
      case "NTTichHopNuocNgoai":
        return "Trung gian nước ngoài";
      default:
        return "Danh sách hồ sơ";
    }
  };

  const goBackToList = () => {
    if (backUrl) {
      router.push(backUrl);
      return;
    }
    switch (item.platformManageTypeId) {
      case "NTThongBaoKD":
        router.push("/QLPlatform/NenTangTrucTuyen");
        break;
      case "NTDangKyKDNuocNgoai":
        router.push("/QLPlatform/CanBo/DatHangNuocNgoai");
        break;
      case "NTTichHop":
        router.push("/QLPlatform/CanBo/TrungGianTrongNuoc");
        break;
      case "NTTichHopNuocNgoai":
        router.push("/QLPlatform/CanBo/TrungGianNuocNgoai");
        break;
      default:
        router.back();
    }
  };

  const statusColor = PlatformStatusConstant.getColor(item.status);
  const statusName = PlatformStatusConstant.getDisplayName(item.status);
  const deadline = (roles?.isDN && item.status !== PlatformStatusConstant.CanBoSungThongTin) ? null : (roles?.isDN ? item.dateLineEnterprise : item.dateLine);

  const items = [
    {
      key: "1",
      label: "Đối soát thông tin",
      children: <DetailInfoTab item={item} ispOptions={ispOptions} />,
    },
    {
      key: "2",
      label: "Tài liệu đính kèm",
      children: <TaiLieuDinhKemTab itemId={item.id} active={activeTab === "2"} />,
    },
    {
      key: "ky-so",
      label: "Thông tin ký số",
      children: <ThongTinKySo hoSoId={item.id} signerService={platformManageService} />,
    },
    {
      key: "4",
      label: "Lịch sử xử lý",
      children: <HistoryTab platformId={item.id} companyTaxCode={item.companyTaxCode} />,
    },
    {
      key: "5",
      label: "Phản ánh",
      children: (
        <Table
          loading={loadingVuViecs}
          dataSource={vuViecs}
          rowKey="id"
          bordered
          pagination={{ pageSize: 10 }}
          columns={[
            {
              title: "STT",
              width: 70,
              align: "center",
              render: (_, __, index) => index + 1,
            },
            {
              title: "Tên nền tảng",
              dataIndex: "tenNenTang",
              key: "tenNenTang",
              render: (text, record) => (
                <div>
                  <div>{text || "—"}</div>
                  {record.tenUngDung && (
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{record.tenUngDung}</div>
                  )}
                </div>
              ),
            },
            {
              title: "Thương nhân/Tổ chức",
              dataIndex: "tenThuongNhan",
              key: "tenThuongNhan",
              render: (text) => text || "—",
            },
            {
              title: "Mã số doanh nghiệp",
              dataIndex: "maSoDoanhNghiep",
              key: "maSoDoanhNghiep",
              render: (text) => text || "—",
            },
            {
              title: "Trạng thái",
              dataIndex: "trangThai",
              key: "trangThai",
              render: (status) => {
                return status === 2 ? <Tag color="success">Đã xử lý</Tag> : <Tag color="warning">Đang xử lý</Tag>;
              }
            },
            {
              title: "Kết luận",
              dataIndex: "ketLuan",
              key: "ketLuan",
              render: (ketLuan: number) => getKetLuanTag(ketLuan),
            },
            {
              title: "Thao tác",
              align: "center",
              width: 100,
              render: (_, record) => (
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  onClick={() => router.push(`/vuViecPhanAnh/detail?id=${record.id}`)}
                >
                  Xem
                </Button>
              )
            }
          ]}
        />
      ),
    },
    {
      key: "6",
      label: "Cảnh báo và vi phạm",
      children: (
        <Table
          loading={loadingViPhams}
          dataSource={viPhams}
          rowKey="id"
          bordered
          pagination={{ pageSize: 10 }}
          columns={[
            {
              title: "STT",
              width: 70,
              align: "center",
              render: (_, __, index) => index + 1,
            },
            {
              title: "Tên nền tảng",
              dataIndex: "tenNenTang",
              key: "tenNenTang",
              render: (text, record) => (
                <div>
                  <div>{text || "—"}</div>
                  {record.tenUngDung && (
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{record.tenUngDung}</div>
                  )}
                </div>
              ),
            },
            {
              title: "Nguồn vi phạm",
              dataIndex: "tenNguon",
              key: "tenNguon",
              render: (text) => text || "—",
            },
            {
              title: "Loại vi phạm",
              dataIndex: "tenLoaiViPham",
              key: "tenLoaiViPham",
              render: (text) => text || "—",
            },
            {
              title: "Ngày bắt đầu",
              dataIndex: "ngayBatDau",
              render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "—"),
            },
            {
              title: "Ngày kết thúc",
              dataIndex: "ngayKetThuc",
              render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "—"),
            },
            {
              title: "Thao tác",
              align: "center",
              width: 100,
              render: (_, record) => (
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  onClick={() => router.push(`/nenTangViPham/detail?id=${record.id}`)}
                >
                  Xem
                </Button>
              )
            }
          ]}
        />
      ),
    },
    {
      key: "sync-log",
      label: "Lịch sử đồng bộ",
      children: <DvcSyncLogTab maHoSo={item.dvcMaHoSo} />,
    },
    ...((item.platformManageTypeId === "NTTichHop" || item.platformManageTypeId === "NTTichHopNuocNgoai") && roles?.canViewTichHop
      ? [
        {
          key: "tich-hop",
          label: "Nền tảng TMĐT tích hợp",
          children: <EnterprisePlatformItemTab platformManageId={item.id} readOnly={!roles?.canEditTichHop} />,
        },
      ]
      : []),
    /*
    {
      key: "7",
      label: "Lịch sử thay đổi",
      children: <LichSuThayDoiTab item={item} />,
    },
    */
  ];

  const tabLabelToConstantMap: Record<string, string> = {
    "Đối soát thông tin": "ThongTinHoSo",
    "Thông tin hồ sơ": "ThongTinHoSo",
    "Tài liệu đính kèm": "TaiLieuDinhKem",
    "Thông tin ký số": "ThongTinKySo",
    "Phản ánh": "PhanAnh",
    "Cảnh báo và vi phạm": "CanhBaoVaViPham",
    "Lịch sử đồng bộ": "LichSuDongBo",
    "Lịch sử thay đổi": "LichSuXuLy",
    "Lịch sử xử lý": "LichSuXuLy",
  };

  const filteredItems = allowedTabs 
    ? items.filter(t => {
        const constantVal = tabLabelToConstantMap[t.label];
        const alternativeVal = (t.label === "Đối soát thông tin" || t.label === "Thông tin hồ sơ") ? "ThongTinChung" : null;
        return (constantVal && allowedTabs.includes(constantVal)) || (alternativeVal && allowedTabs.includes(alternativeVal));
      })
    : items;

  return (
    <div className="specialist-detail-view">
      <style jsx global>{`
        .specialist-detail-view .custom-tabs .ant-tabs-nav {
          margin-bottom: 20px !important;
        }
        .specialist-detail-view .custom-tabs .ant-tabs-tab {
          font-size: 15px !important;
          font-weight: 500 !important;
          padding: 12px 16px !important;
        }
        .specialist-detail-view .custom-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          font-weight: 600 !important;
        }
        .sticky-header-toolbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(10px);
          padding: 16px 24px;
          margin: -24px -24px 20px -24px;
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
        }
        .breadcrumb-link {
          color: #64748b;
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .breadcrumb-link:hover {
          color: #0f172a;
        }
      `}</style>

      {/* TOP STICKY HEADER TOOLBAR */}
      <div className="sticky-header-toolbar">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "8px", gap: "12px" }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: "14px", color: "#64748b", fontWeight: 500 }}>
              <a href="/dashboard" className="breadcrumb-link">Trang chủ</a>
              <span style={{ margin: "0 8px", color: "#cbd5e1" }}>/</span>
              <span className="breadcrumb-link" style={{ cursor: "pointer" }} onClick={() => goBackToList()}>
                {getListPageLabel()}
              </span>
              <span style={{ margin: "0 8px", color: "#cbd5e1" }}>/</span>
              <span style={{ color: "#c2272d", fontWeight: "bold" }}>{item.name}</span>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", color: "#475569", fontSize: "13px", fontWeight: 500 }}>
            <CalendarOutlined style={{ color: "#64748b", marginRight: "6px" }} />
            <span>{getFormattedDate()}</span>
          </div>
        </div>

        <div style={{ borderBottom: "1px solid #e2e8f0", marginTop: "4px", marginBottom: "16px" }} />

        <div style={{ display: "grid", gridTemplateColumns: "5.5fr 4.5fr", gap: "12px", alignItems: "center", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => goBackToList()}
              style={{ paddingLeft: 0, color: "#64748b", fontWeight: 600 }}
            >
              Quay lại danh sách
            </Button>
            <Divider type="vertical" style={{ height: 32, borderColor: "#cbd5e1", margin: 0 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 500 }}>Trạng thái</span>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Tag color={statusColor} style={{ fontWeight: 600, borderRadius: 4, margin: 0 }}>{statusName}</Tag>
                {item.isNenTangLon && <Tag color="red" style={{ fontWeight: 600, borderRadius: 4, border: "1px solid #ef4444", margin: 0 }}>🔥 NỀN TẢNG SỐ LỚN</Tag>}
              </div>
            </div>
            {item.reviewName && (
              <>
                <Divider type="vertical" style={{ height: 32, borderColor: "#cbd5e1", margin: 0 }} />
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 500 }}>Chuyên viên</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
                    {roles?.isDN ? (item.reviewMaCanBo || "—") : item.reviewName}
                  </span>
                </div>
              </>
            )}
            {deadline && (
              <>
                <Divider type="vertical" style={{ height: 32, borderColor: "#cbd5e1", margin: 0 }} />
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 500 }}>Hạn xử lý</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#c2272d" }}>
                    {dayjs(deadline).format("DD/MM/YYYY")}
                  </span>
                </div>
              </>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
            {!hideActions && (
              item.platformManageTypeId === "NTThongBaoKD" ? (
                <SpecialistAction
                  item={item}
                  roles={roles}
                  onTransitionClick={onTransitionClick}
                  onlyButtons={true}
                  onRefresh={onRefresh}
                />
              ) : (
                <CucSpecialistAction
                  item={item}
                  roles={roles}
                  onTransitionClick={onTransitionClick}
                  onlyButtons={true}
                  onRefresh={onRefresh}
                />
              )
            )}
          </div>
        </div>
      </div>

      <Card
        style={{ borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.03)" }}
        bodyStyle={{ padding: "24px" }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={filteredItems}
          className="custom-tabs"
        />
      </Card>
    </div>
  );
};

export default SpecialistDetail;
