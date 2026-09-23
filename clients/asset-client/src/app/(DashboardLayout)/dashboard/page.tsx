"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Statistic,
  Button,
  Table,
  Tag,
  Progress,
  Space,
  Tooltip,
  Tabs,
  Badge,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
} from "antd";
import {
  ShopOutlined,
  DollarOutlined,
  PieChartOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  PlusOutlined,
  FileExcelOutlined,
  SwapOutlined,
  HomeOutlined,
  DatabaseOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  LaptopOutlined,
  DesktopOutlined,
  QrcodeOutlined,
  ArrowRightOutlined
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

interface AssetItem {
  key: string;
  maTaiSan: string;
  tenTaiSan: string;
  loaiTaiSan: string;
  nguyenGia: number;
  giaTriConLai: number;
  tinhTrang: "SAN_SANG" | "DANG_SU_DUNG" | "BAO_TRI" | "THANH_LY";
  nguoiSuDung: string;
  phongBan: string;
  ngayMua: string;
}

const INITIAL_ASSETS: AssetItem[] = [
  {
    key: "1",
    maTaiSan: "TS-IT-2024-001",
    tenTaiSan: "MacBook Pro 16 M3 Max (36GB/1TB)",
    loaiTaiSan: "Máy tính & Thiết bị CNTT",
    nguyenGia: 72990000,
    giaTriConLai: 62000000,
    tinhTrang: "DANG_SU_DUNG",
    nguoiSuDung: "Nguyễn Văn Hùng",
    phongBan: "Phòng Công Nghệ & Chuyển Đổi Số",
    ngayMua: "15/01/2024",
  },
  {
    key: "2",
    maTaiSan: "TS-IT-2024-002",
    tenTaiSan: "Màn hình Dell UltraSharp 32 4K U3223QE",
    loaiTaiSan: "Máy tính & Thiết bị CNTT",
    nguyenGia: 19500000,
    giaTriConLai: 17500000,
    tinhTrang: "DANG_SU_DUNG",
    nguoiSuDung: "Trần Thị Mai",
    phongBan: "Phòng Công Nghệ & Chuyển Đổi Số",
    ngayMua: "20/02/2024",
  },
  {
    key: "3",
    maTaiSan: "TS-NET-2023-015",
    tenTaiSan: "Máy chủ Dell PowerEdge R750xs 2x Intel Xeon",
    loaiTaiSan: "Hạ tầng Mạng & Server",
    nguyenGia: 145000000,
    giaTriConLai: 110000000,
    tinhTrang: "DANG_SU_DUNG",
    nguoiSuDung: "Lê Quốc Bảo",
    phongBan: "Trung Tâm Dữ Liệu & Hạ Tầng",
    ngayMua: "10/06/2023",
  },
  {
    key: "4",
    maTaiSan: "TS-IT-2024-089",
    tenTaiSan: "Laptop Lenovo ThinkPad T14s Gen 4 AMD",
    loaiTaiSan: "Máy tính & Thiết bị CNTT",
    nguyenGia: 28500000,
    giaTriConLai: 28500000,
    tinhTrang: "SAN_SANG",
    nguoiSuDung: "Kho lưu trữ (Chưa bàn giao)",
    phongBan: "Kho Thiết Bị Tập Trung",
    ngayMua: "05/03/2024",
  },
  {
    key: "5",
    maTaiSan: "TS-AV-2022-004",
    tenTaiSan: "Hệ thống Hội Nghị Maxhub V6 Classic 86 inch",
    loaiTaiSan: "Âm thanh & Hội nghị",
    nguyenGia: 118000000,
    giaTriConLai: 75000000,
    tinhTrang: "BAO_TRI",
    nguoiSuDung: "Ban Thư Ký Hội Đồng",
    phongBan: "Văn Phòng Hội Đồng Quản Trị",
    ngayMua: "01/11/2022",
  },
  {
    key: "6",
    maTaiSan: "TS-FURN-2021-030",
    tenTaiSan: "Ghế Công Thái Học Herman Miller Aeron Remastered",
    loaiTaiSan: "Bàn ghế & Nội thất",
    nguyenGia: 36000000,
    giaTriConLai: 21600000,
    tinhTrang: "DANG_SU_DUNG",
    nguoiSuDung: "Giám Đốc Kỹ Thuật",
    phongBan: "Ban Lãnh Đạo",
    ngayMua: "10/08/2021",
  }
];

export default function AssetDashboardPage() {
  const [assets, setAssets] = useState<AssetItem[]>(INITIAL_ASSETS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssetForQr, setSelectedAssetForQr] = useState<AssetItem | null>(null);
  const [form] = Form.useForm();

  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const handleSwitchToKpi = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("AccessToken") || "" : "";
    window.location.href = `http://localhost:9696/auth/sso-callback?token=${encodeURIComponent(token)}`;
  };

  const handleSwitchToPortal = () => {
    window.location.href = "http://localhost:3000";
  };

  const handleCreateAsset = (values: any) => {
    const newAsset: AssetItem = {
      key: `${Date.now()}`,
      maTaiSan: values.maTaiSan,
      tenTaiSan: values.tenTaiSan,
      loaiTaiSan: values.loaiTaiSan || "Máy tính & Thiết bị CNTT",
      nguyenGia: values.nguyenGia,
      giaTriConLai: values.nguyenGia,
      tinhTrang: "SAN_SANG",
      nguoiSuDung: "Kho lưu trữ (Chưa bàn giao)",
      phongBan: values.phongBan || "Kho Thiết Bị Tập Trung",
      ngayMua: new Date().toLocaleDateString("vi-VN"),
    };

    setAssets([newAsset, ...assets]);
    message.success("Khai báo tài sản mới thành công!");
    setIsModalOpen(false);
    form.resetFields();
  };

  const totalCount = assets.length;
  const totalOriginalPrice = assets.reduce((acc, curr) => acc + curr.nguyenGia, 0);
  const totalCurrentValue = assets.reduce((acc, curr) => acc + curr.giaTriConLai, 0);
  const countInUse = assets.filter((a) => a.tinhTrang === "DANG_SU_DUNG").length;
  const countAvailable = assets.filter((a) => a.tinhTrang === "SAN_SANG").length;
  const countMaintenance = assets.filter((a) => a.tinhTrang === "BAO_TRI").length;

  const renderStatusTag = (status: string) => {
    switch (status) {
      case "SAN_SANG":
        return <Tag color="success" icon={<CheckCircleOutlined />}>Sẵn Sàng Trong Kho</Tag>;
      case "DANG_SU_DUNG":
        return <Tag color="processing" icon={<ClockCircleOutlined />}>Đang Cấp Phát Sử Dụng</Tag>;
      case "BAO_TRI":
        return <Tag color="warning" icon={<ToolOutlined />}>Đang Bảo Dưỡng / Sửa</Tag>;
      case "THANH_LY":
        return <Tag color="default">Đã Thanh Lý</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns = [
    {
      title: "Mã Tài Sản",
      dataIndex: "maTaiSan",
      key: "maTaiSan",
      render: (text: string) => (
        <Text strong style={{ color: "#d97706", fontFamily: "monospace" }}>
          {text}
        </Text>
      ),
    },
    {
      title: "Tên Thiết Bị / Tài Sản",
      dataIndex: "tenTaiSan",
      key: "tenTaiSan",
      render: (text: string, record: AssetItem) => (
        <div>
          <div style={{ fontWeight: 600 }}>{text}</div>
          <div style={{ fontSize: "11px", color: "#64748b" }}>{record.loaiTaiSan}</div>
        </div>
      ),
    },
    {
      title: "Tình Trạng",
      dataIndex: "tinhTrang",
      key: "tinhTrang",
      render: (status: string) => renderStatusTag(status),
    },
    {
      title: "Người Giữ / Phòng Ban",
      key: "assignment",
      render: (_: any, record: AssetItem) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.nguoiSuDung}</div>
          <div style={{ fontSize: "12px", color: "#64748b" }}>{record.phongBan}</div>
        </div>
      ),
    },
    {
      title: "Nguyên Giá",
      dataIndex: "nguyenGia",
      key: "nguyenGia",
      render: (val: number) => <Text strong>{formatVND(val)}</Text>,
    },
    {
      title: "Giá Trị Còn Lại",
      dataIndex: "giaTriConLai",
      key: "giaTriConLai",
      render: (val: number) => (
        <Text style={{ color: "#10b981", fontWeight: 700 }}>{formatVND(val)}</Text>
      ),
    },
    {
      title: "Thao Tác",
      key: "action",
      render: (_: any, record: AssetItem) => (
        <Space size={4}>
          <Tooltip title="Xem mã định danh điện tử (QR Tag)">
            <Button
              size="small"
              icon={<QrcodeOutlined />}
              onClick={() => setSelectedAssetForQr(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "0 4px", minHeight: "100vh" }}>
      {/* Top Banner Định Danh Phân Hệ & Nút Chuyển Đổi Nhanh */}
      <Card
        style={{
          marginBottom: 20,
          borderRadius: 12,
          border: "1px solid #fed7aa",
          background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 40%, #ffffff 100%)",
          boxShadow: "0 2px 10px rgba(245, 158, 11, 0.08)",
        }}
        bodyStyle={{ padding: "18px 24px" }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={16}>
            <Space align="center" size={14}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(217, 119, 6, 0.35)",
                }}
              >
                <ShopOutlined style={{ fontSize: 26, color: "#fff" }} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <Title level={4} style={{ margin: 0, color: "#9a3412", fontWeight: 800 }}>
                    TRUNG TÂM QUẢN LÝ TÀI SẢN & THIẾT BỊ VĂN PHÒNG
                  </Title>
                  <Tag color="orange" style={{ fontWeight: 700 }}>
                    asset-service:5005
                  </Tag>
                  <Tag color="gold" style={{ fontWeight: 700 }}>
                    <DatabaseOutlined style={{ marginRight: 4 }} />
                    Database: Base_TaiSan
                  </Tag>
                </div>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  Theo dõi vòng đời tài sản, cấp phát bàn giao cho cán bộ, hạch toán hao mòn khấu hao và lịch kiểm kê bảo trì định kỳ.
                </Text>
              </div>
            </Space>
          </Col>

          <Col xs={24} md={8} style={{ textAlign: "right" }}>
            <Space size={10} wrap>
              <Tooltip title="Nhấn để chuyển tức thời sang Phân Hệ Đánh Giá KPI (Port 9696 - Database Base_DB)">
                <Button
                  type="primary"
                  icon={<SwapOutlined />}
                  onClick={handleSwitchToKpi}
                  style={{
                    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    borderColor: "#1d4ed8",
                    color: "#fff",
                    fontWeight: 700,
                    borderRadius: 8,
                    height: 38,
                    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.35)",
                  }}
                >
                  <span>Chuyển Sang KPI (:9696)</span>
                </Button>
              </Tooltip>

              <Button
                icon={<HomeOutlined />}
                onClick={handleSwitchToPortal}
                style={{ borderRadius: 8, height: 38 }}
              >
                Portal SSO
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 4 Thẻ Thống Kê Chỉ Số Trọng Tâm Tài Sản */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              borderTop: "3px solid #f59e0b",
            }}
          >
            <Statistic
              title={<span style={{ fontWeight: 600, color: "#64748b" }}>TỔNG DANH MỤC TÀI SẢN</span>}
              value={totalCount}
              suffix={<span style={{ fontSize: 13, color: "#94a3b8" }}>thiết bị</span>}
              prefix={<ShopOutlined style={{ color: "#f59e0b", marginRight: 8 }} />}
              valueStyle={{ fontWeight: 800, color: "#0f172a" }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: "#10b981", display: "flex", alignItems: "center", gap: 4 }}>
              <CheckCircleOutlined /> Đã định danh số hóa 100%
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              borderTop: "3px solid #ef4444",
            }}
          >
            <Statistic
              title={<span style={{ fontWeight: 600, color: "#64748b" }}>TỔNG NGUYÊN GIÁ ĐẦU TƯ</span>}
              value={formatVND(totalOriginalPrice)}
              valueStyle={{ fontWeight: 800, color: "#b91c1c", fontSize: 20 }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
              Cơ sở dữ liệu hạch toán: <strong style={{ color: "#d97706" }}>Base_TaiSan</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              borderTop: "3px solid #10b981",
            }}
          >
            <Statistic
              title={<span style={{ fontWeight: 600, color: "#64748b" }}>GIÁ TRỊ CÒN LẠI (SAU KHẤU HAO)</span>}
              value={formatVND(totalCurrentValue)}
              valueStyle={{ fontWeight: 800, color: "#047857", fontSize: 20 }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: "#059669" }}>
              Tỷ lệ hao mòn bình quân: <strong>18.5%/năm</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              borderTop: "3px solid #3b82f6",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 6 }}>
              TỶ LỆ KHAI THÁC & SỬ DỤNG
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              <Tag color="blue">Dùng: {countInUse}</Tag>
              <Tag color="green">Kho: {countAvailable}</Tag>
              <Tag color="warning">Bảo trì: {countMaintenance}</Tag>
            </div>
            <Progress
              percent={totalCount ? Math.round((countInUse / totalCount) * 100) : 0}
              strokeColor="#3b82f6"
              size="small"
              status="active"
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content Card: Quản Lý Danh Sách Tài Sản & Nghiệp Vụ */}
      <Card
        style={{
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
        title={
          <Space align="center" size={10}>
            <DesktopOutlined style={{ color: "#d97706" }} />
            <span style={{ fontWeight: 700, fontSize: 16 }}>DANH MỤC THIẾT BỊ VÀ TÀI SẢN DOANH NGHIỆP</span>
          </Space>
        }
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsModalOpen(true)}
              style={{
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                borderColor: "#d97706",
                fontWeight: 600,
                borderRadius: 6,
              }}
            >
              Khai Báo Tài Sản Mới
            </Button>
            <Button icon={<FileExcelOutlined />} onClick={() => message.info("Đang kết xuất biểu mẫu Excel kiểm kê...")}>
              Xuất Báo Cáo
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={assets}
          pagination={{ pageSize: 6 }}
          rowKey="key"
        />
      </Card>

      {/* Modal: Khai Báo Tài Sản Mới */}
      <Modal
        title="Khai Báo Tài Sản Mới Vào Hệ Thống (Base_TaiSan)"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreateAsset} style={{ marginTop: 16 }}>
          <Form.Item
            name="maTaiSan"
            label="Mã Tài Sản / Định Danh"
            rules={[{ required: true, message: "Vui lòng nhập mã tài sản" }]}
          >
            <Input placeholder="VD: TS-IT-2024-099" />
          </Form.Item>

          <Form.Item
            name="tenTaiSan"
            label="Tên Thiết Bị / Tài Sản"
            rules={[{ required: true, message: "Vui lòng nhập tên tài sản" }]}
          >
            <Input placeholder="VD: Laptop Dell Latitude 5440 i7" />
          </Form.Item>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="loaiTaiSan" label="Phân Loại Nhóm" initialValue="Máy tính & Thiết bị CNTT">
                <Select>
                  <Select.Option value="Máy tính & Thiết bị CNTT">Máy tính & CNTT</Select.Option>
                  <Select.Option value="Hạ tầng Mạng & Server">Hạ tầng Mạng & Server</Select.Option>
                  <Select.Option value="Bàn ghế & Nội thất">Bàn ghế & Nội thất</Select.Option>
                  <Select.Option value="Âm thanh & Hội nghị">Âm thanh & Hội nghị</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nguyenGia"
                label="Nguyên Giá Mua (VND)"
                rules={[{ required: true, message: "Nhập nguyên giá" }]}
                initialValue={20000000}
              >
                <InputNumber style={{ width: "100%" }} formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="phongBan" label="Đơn Vị / Phòng Ban Quản Lý" initialValue="Phòng Công Nghệ & Chuyển Đổi Số">
            <Select>
              <Select.Option value="Phòng Công Nghệ & Chuyển Đổi Số">Phòng Công Nghệ & Chuyển Đổi Số</Select.Option>
              <Select.Option value="Trung Tâm Dữ Liệu & Hạ Tầng">Trung Tâm Dữ Liệu & Hạ Tầng</Select.Option>
              <Select.Option value="Kho Thiết Bị Tập Trung">Kho Thiết Bị Tập Trung</Select.Option>
              <Select.Option value="Văn Phòng Hội Đồng Quản Trị">Văn Phòng Hội Đồng Quản Trị</Select.Option>
              <Select.Option value="Ban Lãnh Đạo">Ban Lãnh Đạo</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ textAlign: "right", marginTop: 24, marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" style={{ background: "#d97706", borderColor: "#d97706" }}>
                Lưu Vào Hệ Thống
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal: Thẻ Định Danh QR Code */}
      <Modal
        title="Thẻ Định Danh Tài Sản Điện Tử (QR Tag)"
        open={!!selectedAssetForQr}
        onCancel={() => setSelectedAssetForQr(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedAssetForQr(null)}>
            Đóng
          </Button>,
        ]}
      >
        {selectedAssetForQr && (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div
              style={{
                width: 140,
                height: 140,
                margin: "0 auto 16px auto",
                padding: 10,
                background: "#0f172a",
                borderRadius: 12,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              <QrcodeOutlined style={{ fontSize: 72, color: "#fbbf24" }} />
              <div style={{ fontSize: 10, marginTop: 4, fontFamily: "monospace" }}>
                {selectedAssetForQr.maTaiSan}
              </div>
            </div>

            <Title level={5} style={{ marginBottom: 4 }}>
              {selectedAssetForQr.tenTaiSan}
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {selectedAssetForQr.loaiTaiSan} • Nguyên giá: {formatVND(selectedAssetForQr.nguyenGia)}
            </Text>

            <div style={{ marginTop: 16, textAlign: "left", background: "#f8fafc", padding: 12, borderRadius: 8 }}>
              <div><strong>Người đang sử dụng:</strong> {selectedAssetForQr.nguoiSuDung}</div>
              <div><strong>Phòng ban:</strong> {selectedAssetForQr.phongBan}</div>
              <div><strong>Tình trạng:</strong> {renderStatusTag(selectedAssetForQr.tinhTrang)}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
