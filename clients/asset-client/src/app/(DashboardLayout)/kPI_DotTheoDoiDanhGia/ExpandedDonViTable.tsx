"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Table, Tag, Typography, Spin, Empty, Button, Space, Card, Popconfirm, Tooltip } from "antd";
import { SettingOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import kPI_DotDanhGia_DonViService from "@/services/kPI_DotDanhGia_DonVi/kPI_DotDanhGia_DonViService";
import kPI_BoTieuChiDonViService from "@/services/kPI_BoTieuChiDonVi/kPI_BoTieuChiDonViService";
import kPI_BoTieuChiChungService from "@/services/kPI_BoTieuChiChung/kPI_BoTieuChiChungService";
import { KPI_DotTheoDoiDanhGiaType } from "@/types/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGia";

import ModalSuaCauHinhDonVi from "./ModalSuaCauHinhDonVi";
import ModalXemBoTieuChi from "@/app/(DashboardLayout)/kPI_BieuChamDiem/ModalXemBoTieuChi";
import ModalXemBoTieuChiChung from "./ModalXemBoTieuChiChung";

const { Text } = Typography;

interface Props {
  item: KPI_DotTheoDoiDanhGiaType;
  onOpenCauHinh?: (item: KPI_DotTheoDoiDanhGiaType) => void;
  refreshKey?: number;
}

const ExpandedDonViTable: React.FC<Props> = ({ item, onOpenCauHinh, refreshKey }) => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [listConfig, setListConfig] = useState<any[]>([]);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [reloadingId, setReloadingId] = useState<string | null>(null);
  const isClosed = item?.trangThai === "CLOSED" || item?.trangThai === "Đã đóng/Kết thúc";

  const handleReloadBtc = async (record: any) => {
    if (!record?.id || !record?.idDonVi) return;
    setReloadingId(record.id);
    try {
      const [btcDonViRes, btcChungRes] = await Promise.all([
        kPI_BoTieuChiDonViService.getDropdown(record.idDonVi),
        kPI_BoTieuChiChungService.getDropdown(record.idDonVi, undefined, item?.type),
      ]);
      const donViBtc = btcDonViRes?.data?.find((opt) => opt.selected) || btcDonViRes?.data?.[0];
      let chungBtc = btcChungRes?.data?.find((opt) => opt.selected) || btcChungRes?.data?.[0];
      if (!chungBtc) {
        try {
          const generalChungRes = await kPI_BoTieuChiChungService.getDropdown(undefined, undefined, item?.type);
          chungBtc = generalChungRes?.data?.find((opt) => opt.selected) || generalChungRes?.data?.[0];
        } catch (err) {
          console.error("Lỗi tải bộ tiêu chí chung mặc định:", err);
        }
      }

      const payload = {
        id: record.id,
        idDotDanhGia: record.idDotDanhGia || item?.id,
        idDonVi: record.idDonVi,
        idBoChiSoNhiemVu: donViBtc?.value || null,
        idBoTieuChiChung: chungBtc?.value || null,
      };

      const res = await kPI_DotDanhGia_DonViService.update(payload as any);
      if (res?.status) {
        toast.success(`Đã cập nhật bộ tiêu chí mới nhất cho đơn vị ${record.tenDonVi || ""}`);
        await fetchConfigData();
      } else {
        toast.error(res?.message || "Cập nhật bộ tiêu chí thất bại");
      }
    } catch (err) {
      console.error("Lỗi làm mới bộ tiêu chí:", err);
      toast.error("Đã xảy ra lỗi khi lấy bộ tiêu chí mới nhất");
    } finally {
      setReloadingId(null);
    }
  };

  const [viewBoTieuChiDonViModal, setViewBoTieuChiDonViModal] = useState<{ visible: boolean; id: string | null }>({
    visible: false,
    id: null,
  });
  const [viewBoTieuChiChungModal, setViewBoTieuChiChungModal] = useState<{ visible: boolean; id: string | null; ten: string | null }>({
    visible: false,
    id: null,
    ten: null,
  });

  const fetchConfigData = async () => {
    if (!item?.id) return;
    setLoading(true);
    try {
      const res = await kPI_DotDanhGia_DonViService.getData({
        idDotDanhGia: item.id,
        pageSize: 1000,
        pageIndex: 1,
      });
      if (res?.data?.items) {
        setListConfig(res.data.items);
      } else {
        setListConfig([]);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách phòng ban đợt đánh giá:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigData();
  }, [item?.id, refreshKey]);

  const handleDeleteConfig = async (configId: string) => {
    try {
      setLoading(true);
      const res = await kPI_DotDanhGia_DonViService.delete(configId);
      if (res?.status) {
        toast.success("Xóa cấu hình đơn vị thành công");
        await fetchConfigData();
      } else {
        toast.error(res?.message || "Xóa thất bại");
      }
    } catch (err) {
      console.error("Lỗi khi xóa cấu hình đơn vị:", err);
      toast.error("Đã xảy ra lỗi khi xóa cấu hình đơn vị");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "index",
      key: "index",
      width: 55,
      align: "center" as const,
      render: (_: any, __: any, idx: number) => idx + 1,
    },
    {
      title: "Đơn vị / Phòng ban",
      dataIndex: "tenDonVi",
      key: "tenDonVi",
      width: 250,
      render: (val: string) => <span style={{ fontWeight: 600, color: "#1f2937" }}>{val || "—"}</span>,
    },
    {
      title: "Bộ tiêu chí đơn vị",
      dataIndex: "tenBoChiSoNhiemVu",
      key: "tenBoChiSoNhiemVu",
      width: 300,
      render: (val: string, record: any) =>
        val ? (
          <Tag
            color="blue"
            style={{
              whiteSpace: "normal",
              height: "auto",
              wordBreak: "break-word",
              padding: "4px 8px",
              lineHeight: "1.4",
              display: "inline-block",
              cursor: record.idBoChiSoNhiemVu ? "pointer" : "default",
            }}
            title="Nhấn để xem danh sách tiêu chí đơn vị"
            onClick={() => {
              if (record.idBoChiSoNhiemVu) {
                setViewBoTieuChiDonViModal({ visible: true, id: record.idBoChiSoNhiemVu });
              }
            }}
          >
            {val} {record.soQuyetDinhBoChiSoNhiemVu ? `(Số QĐ: ${record.soQuyetDinhBoChiSoNhiemVu})` : ""}
          </Tag>
        ) : (
          <Text type="secondary">Chưa chọn</Text>
        ),
    },
    {
      title: "Bộ tiêu chí chung",
      dataIndex: "tenBoTieuChiChung",
      key: "tenBoTieuChiChung",
      width: 300,
      render: (val: string, record: any) =>
        val ? (
          <Tag
            color="green"
            style={{
              whiteSpace: "normal",
              height: "auto",
              wordBreak: "break-word",
              padding: "4px 8px",
              lineHeight: "1.4",
              display: "inline-block",
              cursor: record.idBoTieuChiChung ? "pointer" : "default",
            }}
            title="Nhấn để xem danh sách tiêu chí chung"
            onClick={() => {
              if (record.idBoTieuChiChung) {
                setViewBoTieuChiChungModal({ visible: true, id: record.idBoTieuChiChung, ten: record.tenBoTieuChiChung });
              }
            }}
          >
            {val} {record.soQuyetDinhBoTieuChiChung ? `(Số QĐ: ${record.soQuyetDinhBoTieuChiChung})` : ""}
          </Tag>
        ) : (
          <Text type="secondary">Chưa chọn</Text>
        ),
    },
    {
      title: "Thao tác",
      dataIndex: "actions",
      key: "actions",
      width: 100,
      align: "center" as const,
      render: (_: any, record: any) => {
        const isReloading = reloadingId === record.id;
        return (
          <Space size="small">
            {!isClosed && (
              <>
                <Tooltip title="Lấy bộ tiêu chí chung và đơn vị mới nhất">
                  <Button
                    type="text"
                    size="small"
                    icon={<ReloadOutlined spin={isReloading} style={{ color: "#1890ff" }} />}
                    loading={isReloading}
                    disabled={loading}
                    onClick={() => handleReloadBtc(record)}
                  />
                </Tooltip>
                <Popconfirm
                  title="Xác nhận xóa"
                  description="Bạn có chắc chắn muốn xóa cấu hình đơn vị này?"
                  onConfirm={() => handleDeleteConfig(record.id)}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Tooltip title="Xóa cấu hình đơn vị này">
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                    />
                  </Tooltip>
                </Popconfirm>
              </>
            )}
          </Space>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: "16px 24px", textAlign: "center", backgroundColor: "#f9fafb" }}>
        <Spin tip="Đang tải danh sách phòng ban..." />
      </div>
    );
  }

  if (listConfig.length === 0) {
    return (
      <div
        style={{
          backgroundColor: "#f9fafb",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text type="secondary">Đợt đánh giá này chưa được cấu hình phòng ban & bộ tiêu chí nào.</Text>
        {onOpenCauHinh && !isClosed && (
          <Button
            type="primary"
            size="small"
            icon={<SettingOutlined />}
            onClick={() => onOpenCauHinh(item)}
          >
            Cấu hình
          </Button>
        )}
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f1f5f9", padding: "16px 20px", borderRadius: "8px", border: "1px solid #cbd5e1", margin: "8px 0", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.05)" }}>
      <div style={{ marginBottom: "12px", fontWeight: 600, color: "#334155", fontSize: "14px" }}>
        Danh sách đơn vị và bộ tiêu chí áp dụng ({listConfig.length} đơn vị)
      </div>
      <style>{`
        .nested-table .ant-table-thead > tr > th {
          background-color: #e2e8f0 !important;
          color: #1e293b !important;
          border-bottom: 1px solid #cbd5e1 !important;
        }
      `}</style>
      <Table
        className="nested-table"
        columns={columns}
        dataSource={listConfig}
        rowKey="id"
        pagination={false}
        size="small"
        bordered
      />

      {editingRecord && (
        <ModalSuaCauHinhDonVi
          record={editingRecord}
          dotType={item?.type}
          onClose={() => setEditingRecord(null)}
          onSuccess={fetchConfigData}
        />
      )}

      {viewBoTieuChiDonViModal.visible && (
        <ModalXemBoTieuChi
          visible={viewBoTieuChiDonViModal.visible}
          onClose={() => setViewBoTieuChiDonViModal({ visible: false, id: null })}
          idBoTieuChiDonVi={viewBoTieuChiDonViModal.id}
        />
      )}

      {viewBoTieuChiChungModal.visible && (
        <ModalXemBoTieuChiChung
          visible={viewBoTieuChiChungModal.visible}
          onClose={() => setViewBoTieuChiChungModal({ visible: false, id: null, ten: null })}
          idBoTieuChiChung={viewBoTieuChiChungModal.id}
          tenBoTieuChiChung={viewBoTieuChiChungModal.ten}
        />
      )}
    </div>
  );
};

export default ExpandedDonViTable;
