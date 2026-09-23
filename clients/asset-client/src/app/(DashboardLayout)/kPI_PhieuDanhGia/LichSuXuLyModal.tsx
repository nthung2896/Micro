"use client";
import React, { useEffect, useState } from "react";
import { Modal, Table, Tag, Spin, Space, Typography, Empty } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  HistoryOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
  FileTextOutlined,
  RollbackOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import kPI_QuaTrinhXuLyPhieuDanhGiaService from "@/services/kPI_QuaTrinhXuLyPhieuDanhGia/kPI_QuaTrinhXuLyPhieuDanhGiaService";
import { KPI_QuaTrinhXuLyPhieuDanhGiaType } from "@/types/kPI_QuaTrinhXuLyPhieuDanhGia/kPI_QuaTrinhXuLyPhieuDanhGia";

interface LichSuXuLyModalProps {
  visible: boolean;
  onClose: () => void;
  idPhieuDanhGia: string | null;
}

const LichSuXuLyModal: React.FC<LichSuXuLyModalProps> = ({
  visible,
  onClose,
  idPhieuDanhGia,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [historyList, setHistoryList] = useState<KPI_QuaTrinhXuLyPhieuDanhGiaType[]>([]);

  useEffect(() => {
    if (visible && idPhieuDanhGia) {
      fetchHistoryData();
    } else {
      setHistoryList([]);
    }
  }, [visible, idPhieuDanhGia]);

  const fetchHistoryData = async () => {
    if (!idPhieuDanhGia) return;
    setLoading(true);
    try {
      const response = await kPI_QuaTrinhXuLyPhieuDanhGiaService.getData({
        idPhieuDanhGia: idPhieuDanhGia,
        pageSize: 100,
        pageIndex: 1,
      });
      if (response && response.data?.items) {
        setHistoryList(response.data.items);
      } else {
        setHistoryList([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu lịch sử xử lý:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatStatusName = (trangThai?: string): string => {
    if (!trangThai) return "Chưa rõ";
    const statusMap: Record<string, string> = {
      KhoiTao: "Khởi tạo phiếu",
      GuiTruongPhong: "Trình Trưởng phòng",
      GuiPhoTruongPhong: "Trình Phó Trưởng phòng",
      GuiPhoCucTruong: "Trình Phó Cục trưởng",
      GuiCucTruong: "Trình Cục trưởng",
      GuiPhoVuTruong: "Trình Phó Vụ trưởng",
      GuiVuTruong: "Trình Vụ trưởng",
      GuiPhoGiamDocTT: "Trình Phó Giám đốc TT",
      GuiGiamDocTT: "Trình Giám đốc TT",
      GuiPhoChanhVanPhong: "Trình Phó Chánh Văn phòng",
      GuiChanhVanPhong: "Trình Chánh Văn phòng",
      GuiCap1: "Trình Cấp trên trực tiếp",
      GuiCap2: "Trình Lãnh đạo đơn vị",
      DaDuyet: "Đã phê duyệt",
      TuChoi: "Từ chối / Trả về",
      TraVe: "Trả về phiếu",
      ThuHoi: "Thu hồi phiếu",
    };

    if (statusMap[trangThai]) return statusMap[trangThai];

    // Tra cứu case-insensitive
    const lowerKey = trangThai.toLowerCase();
    for (const [key, val] of Object.entries(statusMap)) {
      if (key.toLowerCase() === lowerKey) return val;
    }

    if (lowerKey.includes("trave") || lowerKey.includes("trả về")) {
      return "Trả về phiếu";
    }
    if (lowerKey.includes("thuhoi") || lowerKey.includes("thu hồi")) {
      return "Thu hồi phiếu";
    }
    if (lowerKey.includes("tuchoi") || lowerKey.includes("từ chối")) {
      return "Từ chối / Trả về";
    }
    if (lowerKey.includes("daduyet") || lowerKey.includes("đã duyệt")) {
      return "Đã phê duyệt";
    }
    if (lowerKey.includes("khoitao") || lowerKey.includes("khởi tạo")) {
      return "Khởi tạo phiếu";
    }
    if (lowerKey.includes("phochanhvanphong") || lowerKey.includes("phochánhvănphòng")) {
      return "Trình Phó Chánh Văn phòng";
    }
    if (lowerKey.includes("chanhvanphong") || lowerKey.includes("chánhvănphòng")) {
      return "Trình Chánh Văn phòng";
    }
    if (lowerKey.includes("phogiamdoctt") || lowerKey.includes("phógiámđốctt") || lowerKey.includes("phogdtt")) {
      return "Trình Phó Giám đốc TT";
    }
    if (lowerKey.includes("giamdoctt") || lowerKey.includes("giámđốctt")) {
      return "Trình Giám đốc TT";
    }
    if (lowerKey.includes("phovutruong") || lowerKey.includes("phóvụtrưởng")) {
      return "Trình Phó Vụ trưởng";
    }
    if (lowerKey.includes("vutruong") || lowerKey.includes("vụtrưởng")) {
      return "Trình Vụ trưởng";
    }
    if (trangThai.startsWith("Gui")) {
      const rolePart = trangThai.substring(3).replace(/([A-Z])/g, " $1").trim();
      return `Trình ${rolePart}`;
    }
    return trangThai;
  };

  const normalizeText = (value?: string): string =>
    (value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const isReturnOrRejected = (trangThai?: string): boolean => {
    const normalizedStatus = normalizeText(trangThai);
    return normalizedStatus.includes("trave") || normalizedStatus.includes("tra ve") || normalizedStatus.includes("tuchoi") || normalizedStatus.includes("tu choi");
  };

  const isRecallRecord = (record: KPI_QuaTrinhXuLyPhieuDanhGiaType): boolean => {
    const normalizedStatus = normalizeText(record.trangThai);
    return normalizedStatus.includes("thuhoi") || normalizedStatus.includes("thu hoi");
  };

  const getRowHighlightClass = (record: KPI_QuaTrinhXuLyPhieuDanhGiaType): string => {
    if (isRecallRecord(record)) return "history-row-recall";
    if (isReturnOrRejected(record.trangThai)) return "history-row-return";
    return "";
  };

  const getStatusTag = (trangThai: string) => {
    const label = formatStatusName(trangThai);
    const normalizedStatus = normalizeText(trangThai);
    if (!trangThai) return <Tag color="default">Chưa rõ</Tag>;
    if (normalizedStatus.includes("thuhoi") || normalizedStatus.includes("thu hoi")) {
      return (
        <Tag color="error" icon={<RollbackOutlined />} style={{ fontWeight: 500, padding: "3px 10px", borderRadius: "6px" }}>
          {label}
        </Tag>
      );
    }
    if (trangThai.includes("TraVe") || trangThai.toLowerCase().includes("trả về")) {
      return (
        <Tag color="warning" icon={<RollbackOutlined />} style={{ fontWeight: 500, padding: "3px 10px", borderRadius: "6px" }}>
          {label}
        </Tag>
      );
    }
    if (trangThai.includes("TuChoi") || trangThai.toLowerCase().includes("từ chối")) {
      return (
        <Tag color="error" icon={<CloseCircleOutlined />} style={{ fontWeight: 500, padding: "3px 10px", borderRadius: "6px" }}>
          {label}
        </Tag>
      );
    }
    if (trangThai.includes("DaDuyet") || trangThai.toLowerCase().includes("đã duyệt")) {
      return (
        <Tag color="success" icon={<CheckCircleOutlined />} style={{ fontWeight: 500, padding: "3px 10px", borderRadius: "6px" }}>
          {label}
        </Tag>
      );
    }
    if (trangThai.includes("KhoiTao") || trangThai.toLowerCase().includes("khởi tạo")) {
      return (
        <Tag color="blue" icon={<FileTextOutlined />} style={{ fontWeight: 500, padding: "3px 10px", borderRadius: "6px" }}>
          {label}
        </Tag>
      );
    }
    return (
      <Tag color="processing" icon={<SendOutlined />} style={{ fontWeight: 500, padding: "3px 10px", borderRadius: "6px" }}>
        {label}
      </Tag>
    );
  };

  const columns: ColumnsType<KPI_QuaTrinhXuLyPhieuDanhGiaType> = [
    {
      title: "Bước",
      dataIndex: "index",
      key: "index",
      align: "center",
      width: 65,
      render: (_, __, index) => (
        <span
          style={{
            fontWeight: 600,
            color: "#475569",
            background: "#f1f5f9",
            padding: "4px 10px",
            borderRadius: "6px",
            fontSize: "13px",
          }}
        >
          {index + 1}
        </span>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      align: "center",
      width: 175,
      render: (trangThai, record) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
          {getStatusTag(trangThai)}
          {record.isXuLy ? (
            <span style={{ fontSize: "11.5px", color: "#10b981", fontWeight: 600 }}>
              Đã hoàn thành
            </span>
          ) : (
            <span style={{ fontSize: "11.5px", color: "#d97706", background: "#fffbeb", padding: "2px 8px", borderRadius: "10px", fontWeight: 600 }}>
              Đang chờ xử lý
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "thoiGianThaoTac",
      key: "thoiGianThaoTac",
      align: "center",
      width: 135,
      render: (val, record) => {
        const timeStr = val || record.createdDate;
        if (!timeStr) return "---";
        return (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontWeight: 600, color: "#1e293b", fontSize: "13px" }}>
              {dayjs(timeStr).format("DD/MM/YYYY")}
            </span>
            <span style={{ fontSize: "11.5px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
              <ClockCircleOutlined style={{ fontSize: "11px" }} />
              {dayjs(timeStr).format("HH:mm:ss")}
            </span>
          </div>
        );
      },
    },
    {
      title: "Luồng xử lý (Người gửi ➔ Người tiếp nhận)",
      key: "luongXuLy",
      width: 480,
      render: (_, record) => {
        const isRejected = isReturnOrRejected(record.trangThai);
        const normalizedStatus = normalizeText(record.trangThai);
        const isApproved = normalizedStatus.includes("daduyet") || normalizedStatus.includes("da duyet");
        return (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
            {/* Người gửi */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: "#e0f2fe",
                  color: "#0284c7",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: "13px",
                  flexShrink: 0,
                }}
              >
                {record.tenNguoiGui ? record.tenNguoiGui.charAt(0).toUpperCase() : <UserOutlined />}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "13.5px", lineHeight: 1.3, overflowWrap: "break-word" }} title={record.tenNguoiGui || "Chủ phiếu / Cán bộ"}>
                  {record.tenNguoiGui || "Chủ phiếu / Cán bộ"}
                </div>
                {record.nguoiGuiUserName && (
                  <div style={{ color: "#64748b", fontSize: "11.5px", lineHeight: 1.3, marginTop: "2px", overflowWrap: "anywhere" }}>
                    ({record.nguoiGuiUserName})
                  </div>
                )}
                {record.chucVuNguoiGui && (
                  <span style={{ background: "#f1f5f9", color: "#475569", fontSize: "11px", padding: "1px 8px", borderRadius: "10px", fontWeight: 500, display: "inline-block", marginTop: "3px" }}>
                    {record.chucVuNguoiGui}
                  </span>
                )}
              </div>
            </div>

            {/* Mũi tên chuyển */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, padding: "0 6px" }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: isRejected ? "#fee2e2" : "#eff6ff",
                  color: isRejected ? "#ef4444" : "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: isRejected ? "1px solid #fca5a5" : "1px solid #bfdbfe",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                }}
              >
                {isRejected ? <RollbackOutlined style={{ fontSize: "13px" }} /> : <ArrowRightOutlined style={{ fontSize: "13px" }} />}
              </div>
            </div>

            {/* Người tiếp nhận */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}>
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: isRejected ? "#fee2e2" : isApproved ? "#dcfce7" : "#f1f5f9",
                  color: isRejected ? "#dc2626" : isApproved ? "#16a34a" : "#475569",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  fontSize: "13px",
                  flexShrink: 0,
                }}
              >
                {record.tenNguoiXuLy ? record.tenNguoiXuLy.charAt(0).toUpperCase() : <UserOutlined />}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: "#1e293b", fontSize: "13.5px", lineHeight: 1.3, overflowWrap: "break-word" }} title={record.tenNguoiXuLy || "Cán bộ tiếp nhận"}>
                  {record.tenNguoiXuLy || "Cán bộ tiếp nhận"}
                </div>
                {record.nguoiXuLyUserName && (
                  <div style={{ color: "#64748b", fontSize: "11.5px", lineHeight: 1.3, marginTop: "2px", overflowWrap: "anywhere" }}>
                    ({record.nguoiXuLyUserName})
                  </div>
                )}
                {record.chucVuNguoiXuLy && (
                  <span style={{ background: "#f1f5f9", color: "#475569", fontSize: "11px", padding: "1px 8px", borderRadius: "10px", fontWeight: 500, display: "inline-block", marginTop: "3px" }}>
                    {record.chucVuNguoiXuLy}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Ghi chú / Ý kiến",
      dataIndex: "ghiChu",
      key: "ghiChu",
      render: (val, record) => {
        if (!val || val.trim() === "") return <span style={{ color: "#cbd5e1" }}>---</span>;
        const isThuHoi = isRecallRecord(record);
        const isRejected = isReturnOrRejected(record.trangThai);

        if (isThuHoi) {
          return (
            <Tag
              color="error"
              icon={<RollbackOutlined />}
              style={{
                fontWeight: 500,
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "13px",
                lineHeight: "1.4",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                maxWidth: "100%",
              }}
            >
              {val}
            </Tag>
          );
        }

        return (
          <div
            style={{
              padding: "8px 12px",
              background: isRejected ? "#fff5f5" : "#f8fafc",
              borderLeft: isRejected ? "3px solid #ef4444" : "3px solid #3b82f6",
              borderRadius: "0 6px 6px 0",
              color: isRejected ? "#b91c1c" : "#334155",
              fontSize: "13.5px",
              lineHeight: 1.45,
              whiteSpace: "pre-wrap",
            }}
          >
            {val}
          </div>
        );
      },
    },
  ];

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width={1180}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingBottom: "4px" }}>
          <div style={{ width: 36, height: 36, borderRadius: "8px", background: "rgba(255, 255, 255, 0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <HistoryOutlined style={{ color: "#ffffff", fontSize: "20px" }} />
          </div>
          <div>
            <div style={{ fontSize: "17px", fontWeight: 700, color: "#ffffff", lineHeight: 1.3 }}>
              Quá trình xử lý phiếu đánh giá
            </div>
            <div style={{ fontSize: "13px", fontWeight: 400, color: "#e0f2fe" }}>
              Lịch sử chi tiết các bước luân chuyển và phê duyệt
            </div>
          </div>
        </div>
      }
      styles={{
        body: { padding: 0 },
      }}
    >
      <style>{`
        /* Chữ và icon nút close trên header modal nổi bật rõ trên nền xanh biển */
        .ant-modal-close {
          color: #ffffff !important;
        }
        .ant-modal-close:hover {
          background: rgba(255, 255, 255, 0.15) !important;
        }

        /* Header của bảng sang màu xanh biển và chữ trắng nổi bật */
        .history-table .ant-table-thead > tr > th {
          background: #1677ff !important;
          color: #ffffff !important;
          font-weight: 600 !important;
          font-size: 14px !important;
          text-align: center !important;
          border-bottom: 2px solid #0958d9 !important;
          padding: 8px 8px !important;
        }
        .history-table .ant-table-thead > tr > th::before {
          display: none !important;
        }
        .history-table .ant-table-tbody > tr:hover > td {
          background: #f0f7ff !important;
        }

        /* Làm nổi bật các bước có sự kiện thu hồi hoặc trả về trên toàn bộ dòng */
        .history-table .ant-table-tbody > tr.history-row-recall > td,
        .history-table .ant-table-tbody > tr.history-row-return > td {
          background: #fff1f2 !important;
          border-top-color: #fecdd3 !important;
          border-bottom-color: #fecdd3 !important;
        }
        .history-table .ant-table-tbody > tr.history-row-recall > td:first-child,
        .history-table .ant-table-tbody > tr.history-row-return > td:first-child {
          border-left: 4px solid #f43f5e !important;
        }
        .history-table .ant-table-tbody > tr.history-row-recall:hover > td,
        .history-table .ant-table-tbody > tr.history-row-return:hover > td {
          background: #ffe4e6 !important;
        }

        /* Ẩn hoàn toàn thanh cuộn (scrollbar) thô cứng nhưng vẫn cho phép cuộn bằng chuột/trackpad */
        .history-table .ant-table-body::-webkit-scrollbar,
        .history-table .ant-table-content::-webkit-scrollbar,
        .ant-modal-body::-webkit-scrollbar {
          width: 0px !important;
          height: 0px !important;
          display: none !important;
        }
        .history-table .ant-table-body,
        .history-table .ant-table-content,
        .ant-modal-body {
          scrollbar-width: none !important;
          -ms-overflow-style: none !important;
        }
      `}</style>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Spin size="large" tip="Đang tải dữ liệu quá trình xử lý..." />
        </div>
      ) : historyList.length === 0 ? (
        <Empty description="Chưa có dữ liệu quá trình xử lý cho phiếu này" style={{ margin: "40px 0" }} />
      ) : (
        <Table
          className="history-table"
          columns={columns}
          dataSource={historyList}
          rowKey={(record) => record.id || `${record.idPhieuDanhGia}_${Math.random()}`}
          pagination={false}
          scroll={historyList.length > 6 ? { y: 520 } : undefined}
          bordered
          size="small"
          rowClassName={(record, index) =>
            [
              getRowHighlightClass(record),
              index === historyList.length - 1 ? "bg-blue-50/30 font-medium history-row-current" : "",
            ]
              .filter(Boolean)
              .join(" ")
          }
        />
      )}
    </Modal>
  );
};

export default LichSuXuLyModal;
