"use client";

import React, { Suspense, useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, Tabs, Button, Spin, message, Modal, Descriptions, Badge, Image, Divider, Space, Tag, Input, Table, Tooltip } from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  CalendarOutlined,
  PlusCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import phanAnhNenTangService from "@/services/phanAnhNenTang/phanAnhNenTang.service";
import { PhanAnhNenTangType } from "@/types/phan-anh-nen-tang/dto";
import withAuthorization from "@/libs/authentication";
import fileServerService from "@/libs/file-uploader/fileServer.service";
import taiLieuDinhKemService from "@/services/taiLieuDinhKem/taiLieuDinhKem.service";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";
import CreateCaseModal from "./CreateCaseModal";
import Link from "next/link";

const getStatusTag = (status?: number, statusText?: string) => {
  const text = statusText || "Không xác định";
  switch (status) {
    case 0:
      return <Tag color="default">{text}</Tag>;
    case 1:
      return <Tag color="processing">{text}</Tag>;
    case 2:
      return <Tag color="error">{text}</Tag>;
    case 3:
      return <Tag color="success">{text}</Tag>;
    default:
      return <Tag color="default">{text}</Tag>;
  }
};

const getStatusColor = (status?: number) => {
  switch (status) {
    case 0:
      return "default";
    case 1:
      return "processing";
    case 2:
      return "error";
    case 3:
      return "success";
    default:
      return "default";
  }
};

const DetailPageContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [item, setItem] = useState<PhanAnhNenTangType | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<TaiLieuDinhKemType[]>([]);

  // States cho Modal Từ chối
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [submittingReject, setSubmittingReject] = useState(false);

  // States cho Modal Tạo vụ việc
  const [isCreateCaseModalOpen, setIsCreateCaseModalOpen] = useState(false);

  const getLoaiTaiLieuDisplayName = (code?: string) => {
    if (!code) return "—";
    if (code === "AnhCCCD") return "Ảnh CMND/CCCD/Passport";
    if (code === "TepDinhKem") return "Tài liệu phản ánh đính kèm";
    return code;
  };

  const getFileUrl = (record: TaiLieuDinhKemType): string => {
    if (!record.duongDanFile) return "";
    const path = record.duongDanFile;
    if (/^https?:\/\//i.test(path)) return path;
    try {
      return fileServerService.getUrl(record);
    } catch {
      return path;
    }
  };

  const loadDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await phanAnhNenTangService.get(id);
      if (response?.data) {
        setItem(response.data);
        if (response.data.id) {
          try {
            const filesRes = await fileServerService.getByItemId(response.data.id);
            if (filesRes.data) {
              setAttachedFiles(filesRes.data);
            }
          } catch (err) {
            console.error("Không lấy được danh sách tệp đính kèm:", err);
          }
        }
      } else {
        message.error(response.message ?? "Không tải được chi tiết phản ánh");
        router.push("/phanAnhNenTang");
      }
    } catch (error) {
      console.error(error);
      message.error("Không tải được chi tiết phản ánh");
      router.push("/phanAnhNenTang");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (!id) {
      message.error("Không tìm thấy mã phản ánh");
      router.push("/phanAnhNenTang");
      return;
    }
    loadDetail();
  }, [id, loadDetail, router]);

  const handleChangeStatus = (newStatus: number, statusText: string) => {
    if (!item || !item.id) return;
    Modal.confirm({
      title: `Chuyển trạng thái phản ánh`,
      content: `Bạn có chắc chắn muốn chuyển trạng thái phản ánh này sang "${statusText}" không?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setLoading(true);
          const updateData: any = {
            ...item,
            trangThai: newStatus,
          };
          const response = await phanAnhNenTangService.update(updateData);
          if (response.status) {
            message.success(`Đã cập nhật trạng thái phản ánh thành "${statusText}"`);
            loadDetail();
          } else {
            message.error(response.message || "Cập nhật trạng thái thất bại");
          }
        } catch (error: any) {
          message.error(error?.message || "Cập nhật trạng thái thất bại");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleRejectSubmit = async () => {
    if (!item || !item.id || !rejectReason.trim()) return;
    setSubmittingReject(true);
    try {
      const updateData: any = {
        ...item,
        trangThai: 2, // Đã từ chối
        lyDoTuChoi: rejectReason.trim(),
      };
      const response = await phanAnhNenTangService.update(updateData);
      if (response.status) {
        message.success("Đã từ chối tiếp nhận phản ánh thành công");
        setIsRejectModalOpen(false);
        setRejectReason("");
        loadDetail();
      } else {
        message.error(response.message || "Từ chối tiếp nhận thất bại");
      }
    } catch (error: any) {
      message.error(error?.message || "Đã xảy ra lỗi");
    } finally {
      setSubmittingReject(false);
    }
  };

  const handleDelete = () => {
    if (!item || !item.id) return;
    Modal.confirm({
      title: "Xóa phản ánh",
      content: "Bạn có chắc chắn muốn xóa phản ánh nền tảng này không?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setLoading(true);
          const response = await phanAnhNenTangService.delete(item.id);
          if (response.status) {
            message.success("Xóa phản ánh thành công");
            router.push("/phanAnhNenTang");
          } else {
            message.error(response.message || "Xóa phản ánh thất bại");
          }
        } catch (error: any) {
          message.error(error?.message || "Xóa phản ánh thất bại");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  if (loading || !item) {
    return (
      <div className="flex justify-center items-center min-h-[350px] flex-col gap-4">
        <Spin size="large" />
        <span className="text-gray-500 font-medium">Đang tải dữ liệu phản ánh...</span>
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

  const tabItems = [
    {
      key: "ho-so",
      label: "Thông tin phản ánh",
      children: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Descriptions title="1. Thông tin người phản ánh" bordered column={1}>
              <Descriptions.Item label="Họ và tên">
                <strong>{item.hoTen}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{item.soDienThoai}</Descriptions.Item>
              <Descriptions.Item label="Email">{item.email}</Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                {item.ngaySinh ? dayjs(item.ngaySinh).format("DD/MM/YYYY") : ""}
              </Descriptions.Item>
              <Descriptions.Item label="Số CCCD">{item.soCCCD}</Descriptions.Item>
              <Descriptions.Item label="Ngày cấp">
                {item.ngayCap ? dayjs(item.ngayCap).format("DD/MM/YYYY") : ""}
              </Descriptions.Item>
              <Descriptions.Item label="Nơi cấp">{item.noiCap}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ thường trú">
                {item.diaChiThuongTru}
              </Descriptions.Item>
            </Descriptions>
          </div>
          <div>
            <Descriptions title="2. Thông tin nền tảng, ứng dụng bị phản ánh" bordered column={1}>
              <Descriptions.Item label="Trạng thái">
                {getStatusTag(item.trangThai, item.trangThai_txt)}
              </Descriptions.Item>
              <Descriptions.Item label="Tên nền tảng">{item.tenNenTang}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ nền tảng">{item.diaChiNenTang}</Descriptions.Item>
              <Descriptions.Item label="Tên ứng dụng">{item.tenUngDung}</Descriptions.Item>
              <Descriptions.Item label="Liên kết tải">{item.lienKetTaiUngDung}</Descriptions.Item>
              <Descriptions.Item label="Loại phản ánh">{item.tenLoaiPhanAnh}</Descriptions.Item>
              <Descriptions.Item label="Tỉnh/Thành phố">{item.tenTinh}</Descriptions.Item>
              <Descriptions.Item label="Ngày gửi">
                {item.createdDate ? dayjs(item.createdDate).format("DD/MM/YYYY HH:mm") : ""}
              </Descriptions.Item>
              {item.trangThai === 2 && item.lyDoTuChoi && (
                <Descriptions.Item label="Lý do từ chối">
                  <span style={{ color: "#ef4444", fontWeight: "bold" }}>{item.lyDoTuChoi}</span>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Nội dung phản ánh">
                <div className="whitespace-pre-wrap leading-relaxed">{item.noiDungPhanAnh}</div>
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>
      ),
    },
    {
      key: "documents",
      label: "Tài liệu đính kèm",
      children: (
        <div style={{ marginTop: 8 }}>
          <Table
            columns={[
              {
                title: "STT",
                width: 55,
                align: "center",
                render: (_: any, __: any, index: number) => index + 1,
              },
              {
                title: "Tên tài liệu",
                dataIndex: "tenTaiLieu",
                ellipsis: true,
                render: (name: string, record: TaiLieuDinhKemType) => {
                  const displayName = name || record.tenTaiLieuText || "Tài liệu";
                  const ext = record.extension?.toUpperCase();
                  return (
                    <Space size={8}>
                      {ext && (
                        <Tag color="blue" style={{ margin: 0, fontSize: 11 }}>
                          {ext}
                        </Tag>
                      )}
                      <span style={{ fontWeight: 500 }}>{displayName}</span>
                    </Space>
                  );
                },
              },
              {
                title: "Loại tài liệu",
                dataIndex: "loaiTaiLieu",
                width: 300,
                render: (code: string, record: TaiLieuDinhKemType) => (
                  <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
                    {record.loaiTaiLieuTxt || getLoaiTaiLieuDisplayName(code)}
                  </div>
                ),
              },
              {
                title: "Ký số",
                width: 120,
                align: "center",
                render: (_: any, record: TaiLieuDinhKemType) => {
                  if (record.coChuKySo && record.isKySo) {
                    return <Tag color="success">Đã ký số</Tag>;
                  }
                  if (record.coChuKySo && record.isKySo === false) {
                    return <Tag color="error">Ký số không hợp lệ</Tag>;
                  }
                  return <Tag>Chưa ký</Tag>;
                },
              },
              {
                title: "Xem",
                width: 70,
                align: "center",
                render: (_: any, record: TaiLieuDinhKemType) => {
                  const url = getFileUrl(record);
                  if (!url) return "—";
                  return (
                    <Tooltip title="Xem file">
                      <Button
                        type="text"
                        
                        icon={<EyeOutlined />}
                        onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
                      />
                    </Tooltip>
                  );
                },
              },
            ]}
            dataSource={attachedFiles}
            rowKey="id"
            bordered
            size="small"
            pagination={false}
            locale={{ emptyText: "Không có tài liệu đính kèm nào." }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="platform-detail-view" style={{ padding: "0" }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        .platform-detail-view .custom-tabs .ant-tabs-nav {
          margin-bottom: 20px !important;
        }
        .platform-detail-view .custom-tabs .ant-tabs-tab {
          font-size: 15px !important;
          font-weight: 500 !important;
          padding: 12px 16px !important;
        }
        .platform-detail-view .custom-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
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
        .reject-textarea {
          border: 1px solid #d9d9d9 !important;
          border-radius: 4px !important;
          transition: all 0.2s !important;
        }
        .reject-textarea:focus, .reject-textarea:active {
          border-color: #3b82f6 !important;
          outline: none !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
        }
      `}} />

      {/* TOP STICKY HEADER TOOLBAR */}
      <div className="sticky-header-toolbar">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "8px", gap: "12px" }}>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: "14px", color: "#64748b", fontWeight: 500 }}>
              <Link href="/dashboard" className="breadcrumb-link">Trang chủ</Link>
              <span style={{ margin: "0 8px", color: "#cbd5e1" }}>/</span>
              <span className="breadcrumb-link" style={{ cursor: "pointer" }} onClick={() => router.push("/phanAnhNenTang")}>
                Phản ánh nền tảng
              </span>
              <span style={{ margin: "0 8px", color: "#cbd5e1" }}>/</span>
              <span style={{ color: "#c2272d", fontWeight: "bold" }}>{item.hoTen}</span>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", color: "#475569", fontSize: "13px", fontWeight: 500 }}>
            <CalendarOutlined style={{ color: "#64748b", marginRight: "6px" }} />
            <span style={{ textTransform: "capitalize" }}>{getFormattedDate()}</span>
          </div>
        </div>

        <div style={{ borderBottom: "1px solid #e2e8f0", marginTop: "4px", marginBottom: "16px" }} />

        <div style={{ display: "grid", gridTemplateColumns: "5.5fr 4.5fr", gap: "12px", alignItems: "center", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/phanAnhNenTang")}
              style={{ paddingLeft: 0, color: "#64748b", fontWeight: 600 }}
            >
              Quay lại danh sách
            </Button>


          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10 }}>
            {item.trangThai === 0 && (
              <>
                <Button
                  type="primary"
                  icon={<PlayCircleOutlined />}
                  onClick={() => handleChangeStatus(1, "Đã ghi nhận")}
                  style={{ backgroundColor: "#1d4ed8", borderColor: "#1d4ed8", borderRadius: 4 }}
                >
                  Ghi nhận
                </Button>
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => {
                    setIsRejectModalOpen(true);
                    setRejectReason("");
                  }}
                  style={{ borderRadius: 4 }}
                >
                  Từ chối
                </Button>
              </>
            )}

            {item.trangThai === 1 && (
              <>
                {!item.hasVuViec ? (
                  <Button
                    type="primary"
                    icon={<PlusCircleOutlined />}
                    onClick={() => setIsCreateCaseModalOpen(true)}
                    style={{ backgroundColor: "#3b82f6", borderColor: "#3b82f6", borderRadius: 4 }}
                  >
                    Tạo vụ việc
                  </Button>
                ) : null}
              </>
            )}

            {item.hasVuViec && item.vuViecId && (
              <Button
                type="default"
                icon={<PlayCircleOutlined />}
                onClick={() => router.push(`/vuViecPhanAnh/detail?id=${item.vuViecId}`)}
                style={{ borderColor: "#10b981", color: "#10b981", borderRadius: 4 }}
              >
                Xem vụ việc xử lý
              </Button>
            )}

            {item.trangThai !== 0 && (
              <Button
                danger
                type="dashed"
                icon={<DeleteOutlined />}
                onClick={handleDelete}
                style={{ borderRadius: 4 }}
              >
                Xóa phản ánh
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <Card
        style={{ borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.03)" }}
        bodyStyle={{ padding: "24px" }}
      >
        <Tabs defaultActiveKey="ho-so" items={tabItems} className="custom-tabs" />
      </Card>

      {/* Modal Từ Chối */}
      <Modal
        open={isRejectModalOpen}
        title="TỪ CHỐI TRANH CHẤP, PHẢN ÁNH, KHIẾU NẠI"
        onCancel={() => {
          setIsRejectModalOpen(false);
          setRejectReason("");
        }}
        width={600}
        footer={
          <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
            <Button
              type="primary"
              onClick={handleRejectSubmit}
              disabled={!rejectReason.trim() || submittingReject}
              loading={submittingReject}
              style={{
                backgroundColor: !rejectReason.trim() ? "#93c5fd" : "#3b82f6",
                borderColor: !rejectReason.trim() ? "#93c5fd" : "#3b82f6",
                color: "#fff",
                width: "100px",
                borderRadius: 4
              }}
            >
              Lưu
            </Button>
            <Button
              onClick={() => {
                setIsRejectModalOpen(false);
                setRejectReason("");
              }}
              style={{
                backgroundColor: "#94a3b8",
                borderColor: "#94a3b8",
                color: "#fff",
                width: "100px",
                borderRadius: 4
              }}
            >
              Đóng
            </Button>
          </div>
        }
      >
        {/* Thông tin phản ánh */}
        <div style={{ color: "#334155", fontSize: "14px", lineHeight: "1.6", marginBottom: "20px" }}>
          <div style={{ marginBottom: "8px" }}>
            Tên miền: {item.diaChiNenTang || "—"}
          </div>
          <div style={{ marginBottom: "8px" }}>
            Nội dung: {item.noiDungPhanAnh || "—"}
          </div>
          <div style={{ marginBottom: "8px" }}>
            Người phản ánh: {item.hoTen || "—"}
          </div>
          <div style={{ marginBottom: "8px" }}>
            Ngày phản ánh: {item.createdDate ? dayjs(item.createdDate).format("DD/MM/YYYY") : "—"}
          </div>
          <div style={{ marginBottom: "8px" }}>
            Điện thoại: {item.soDienThoai || "—"}
          </div>
          <div style={{ marginBottom: "8px" }}>
            Email: {item.email || "—"}
          </div>
        </div>

        {/* Lý do từ chối */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#334155", marginBottom: "8px" }}>
            Lý do từ chối<span style={{ color: "#ef4444" }}>*</span>
          </label>
          <Input.TextArea
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Nhập lý do từ chối..."
            className="reject-textarea"
          />
        </div>
      </Modal>

      {/* Modal Xác nhận tạo mới vụ việc */}
      <CreateCaseModal
        open={isCreateCaseModalOpen}
        onCancel={() => setIsCreateCaseModalOpen(false)}
        item={item}
        onSuccess={loadDetail}
      />
    </div>
  );
};

function PhanAnhNenTangDetailPage() {
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

export default withAuthorization(PhanAnhNenTangDetailPage, "");
