"use client";

import React, { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, Button, Spin, message, Modal, Descriptions, Badge, Select, Tag } from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EditOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import nenTangViPhamService from "@/services/nenTangViPham/nenTangViPham.service";
import { NenTangViPhamType } from "@/types/nen-tang-vi-pham/dto";
import withAuthorization from "@/libs/authentication";
import Link from "next/link";
import platformManageService from "@/services/platformManage/platformManage.service";

const DetailPageContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<NenTangViPhamType | null>(null);
  const [isSelectNenTangOpen, setIsSelectNenTangOpen] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await nenTangViPhamService.get(id);
      if (response?.data) {
        setItem(response.data);
      } else {
        message.error(response.message ?? "Không tải được chi tiết nền tảng vi phạm");
        router.push("/nenTangViPham");
      }
    } catch (error) {
      console.error(error);
      message.error("Không tải được chi tiết nền tảng vi phạm");
      router.push("/nenTangViPham");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (!id) {
      message.error("Không tìm thấy mã nền tảng");
      router.push("/nenTangViPham");
      return;
    }
    loadDetail();
  }, [id, loadDetail, router]);

  const handleDelete = () => {
    if (!item || !item.id) return;
    Modal.confirm({
      title: "Xóa nền tảng vi phạm",
      content: "Bạn có chắc chắn muốn xóa nền tảng vi phạm này không?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setLoading(true);
          const response = await nenTangViPhamService.delete(item.id);
          if (response.status) {
            message.success("Xóa nền tảng vi phạm thành công");
            router.push("/nenTangViPham");
          } else {
            message.error(response.message || "Xóa thất bại");
          }
        } catch (error: any) {
          message.error(error?.message || "Xóa thất bại");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleSelectNenTang = async (ntId: string) => {
    if (!item) return;
    try {
      const payload = {
        ...item,
        nenTangLienKetId: ntId,
      };
      const res = await nenTangViPhamService.update(payload);
      if (res.status) {
        message.success("Gán nền tảng liên kết thành công");
        setIsSelectNenTangOpen(false);
        loadDetail();
      } else {
        message.error(res.message || "Gán nền tảng liên kết thất bại");
      }
    } catch (e) {
      console.error(e);
      message.error("Đã xảy ra lỗi");
    }
  };

  if (loading || !item) {
    return (
      <div className="flex justify-center items-center min-h-[350px] flex-col gap-4">
        <Spin size="large" />
        <span className="text-gray-500 font-medium">Đang tải dữ liệu nền tảng vi phạm...</span>
      </div>
    );
  }

  const getFormattedDate = () => {
    return new Date().toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="platform-detail-view" style={{ padding: "0" }}>
      <style dangerouslySetInnerHTML={{
        __html: `
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
      `}} />

      {/* TOP STICKY HEADER TOOLBAR */}
      <div className="sticky-header-toolbar">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "8px", gap: "12px" }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: "14px", color: "#64748b", fontWeight: 500 }}>
              <Link href="/dashboard" className="breadcrumb-link">Trang chủ</Link>
              <span style={{ margin: "0 8px", color: "#cbd5e1" }}>/</span>
              <span className="breadcrumb-link" style={{ cursor: "pointer" }} onClick={() => router.push("/nenTangViPham")}>
                Nền tảng vi phạm
              </span>
              <span style={{ margin: "0 8px", color: "#cbd5e1" }}>/</span>
              <span style={{ color: "#c2272d", fontWeight: "bold" }}>{item.tenNenTang}</span>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", color: "#475569", fontSize: "13px", fontWeight: 500 }}>
            <CalendarOutlined style={{ color: "#64748b", marginRight: "6px" }} />
            <span style={{ textTransform: "capitalize" }}>{getFormattedDate()}</span>
          </div>
        </div>

        <div style={{ borderBottom: "1px solid #e2e8f0", marginTop: "4px", marginBottom: "16px" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/nenTangViPham")}
              style={{ paddingLeft: 0, color: "#64748b", fontWeight: 600 }}
            >
              Quay lại danh sách
            </Button>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10 }}>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => router.push(`/nenTangViPham/createOrUpdate?id=${item.id}`)}
              style={{ backgroundColor: "#0143DF", borderColor: "#0143DF", borderRadius: 4 }}
            >
              Chỉnh sửa
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              style={{ borderRadius: 4 }}
            >
              Xóa bản ghi
            </Button>
          </div>
        </div>
      </div>

      <Card
        style={{ borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.03)" }}
        bodyStyle={{ padding: "24px" }}
      >
        <Descriptions title="Chi tiết nền tảng, ứng dụng vi phạm" bordered column={2}>
          <Descriptions.Item label="Tên nền tảng" span={2}>
            <strong>{item.tenNenTang}</strong>
          </Descriptions.Item>
          <Descriptions.Item label="Tên ứng dụng" span={2}>
            {item.tenUngDung || <span style={{ color: "#8c8c8c", fontStyle: "italic" }}>Chưa xác định</span>}
          </Descriptions.Item>
          <Descriptions.Item label="Nguồn vi phạm">
            {item.tenNguon || <span style={{ color: "#8c8c8c", fontStyle: "italic" }}>Trống</span>}
          </Descriptions.Item>
          <Descriptions.Item label="Loại vi phạm">
            {item.tenLoaiViPham || <span style={{ color: "#8c8c8c", fontStyle: "italic" }}>Trống</span>}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày bắt đầu">
            {item.ngayBatDau ? dayjs(item.ngayBatDau).format("DD/MM/YYYY") : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Ngày kết thúc">
            {item.ngayKetThuc ? dayjs(item.ngayKetThuc).format("DD/MM/YYYY") : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái hiển thị" span={2}>
            {item.isHienThi ? (
              <Tag color="success">Hiển thị</Tag>
            ) : (
              <Tag color="default">Ẩn</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Nội dung vi phạm" span={2}>
            <div className="whitespace-pre-wrap leading-relaxed">{item.noiDung || "Không có nội dung mô tả chi tiết."}</div>
          </Descriptions.Item>
          <Descriptions.Item label="Nền tảng liên kết" span={2}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", width: "100%" }}>
              <span>
                {item.nenTangLienKetId ? (
                  <span
                    style={{ color: "#0143DF", fontWeight: "bold", cursor: "pointer", textDecoration: "underline" }}
                    onClick={() => router.push(`/QLPlatform/detail/${item.nenTangLienKetId}`)}
                  >
                    {item.tenNenTangLienKet}
                  </span>
                ) : (
                  item.tenNenTangLienKet || <span style={{ color: "#8c8c8c", fontStyle: "italic" }}>Chưa liên kết</span>
                )}
              </span>
              <Button  type="primary" ghost onClick={() => setIsSelectNenTangOpen(true)}>
                {item.tenNenTangLienKet ? "Thay đổi" : "Gán nền tảng"}
              </Button>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày tạo">
            {item.createdDate ? dayjs(item.createdDate).format("DD/MM/YYYY HH:mm") : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Người tạo">
            {item.createdBy || "—"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* MODAL CHỌN NỀN TẢNG LIÊN KẾT */}
      <SelectNenTangModal
        visible={isSelectNenTangOpen}
        onClose={() => setIsSelectNenTangOpen(false)}
        onSelect={handleSelectNenTang}
        currentId={item.nenTangLienKetId}
      />
    </div>
  );
};

// COMPONENT CHỌN NỀN TẢNG LIÊN KẾT
interface SelectNenTangModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
  currentId?: string;
}

const SelectNenTangModal: React.FC<SelectNenTangModalProps> = ({ visible, onClose, onSelect, currentId }) => {
  const [options, setOptions] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>(currentId);
  const [loading, setLoading] = useState(false);

  const fetchNenTang = async () => {
    setLoading(true);
    try {
      const res = await platformManageService.getData({
        pageIndex: 1,
        pageSize: 1000,
        query: "",
      } as any);
      if (res.status && res.data?.items) {
        setOptions(res.data.items.map((x: any) => ({
          label: x.name ? `${x.name} (${x.domain || x.appOS || ""})` : x.domain || "Nền tảng",
          value: x.id,
        })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      setSelectedId(currentId);
      fetchNenTang();
    }
  }, [visible, currentId]);

  const handleOk = () => {
    if (!selectedId) {
      message.warning("Vui lòng chọn nền tảng");
      return;
    }
    onSelect(selectedId);
  };

  return (
    <Modal
      title="Chọn nền tảng liên kết"
      open={visible}
      onOk={handleOk}
      onCancel={onClose}
      okText="Xác nhận"
      cancelText="Hủy"
    >
      <div style={{ padding: "12px 0" }}>
        <Select
          showSearch
          placeholder="Nhập tên hoặc tên miền nền tảng để tìm kiếm..."
          value={selectedId}
          onChange={(val) => setSelectedId(val)}
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          loading={loading}
          style={{ width: "100%" }}
          options={options}
        />
      </div>
    </Modal>
  );
};

function NenTangViPhamDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[350px] flex-col gap-4">
        <Spin size="large" />
        <span className="text-gray-500 font-medium">Đang tải...</span>
      </div>
    }>
      <DetailPageContent />
    </Suspense>
  );
}

export default withAuthorization(NenTangViPhamDetailPage, "");
