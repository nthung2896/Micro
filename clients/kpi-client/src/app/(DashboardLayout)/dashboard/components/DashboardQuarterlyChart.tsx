"use client";

import React, { useEffect, useState } from "react";
import { Card, Select, Spin, Empty, Modal, Table, Tag, Row, Col, Typography, Button, Space } from "antd";
import { BarChartOutlined, InfoCircleOutlined, UserOutlined, ApartmentOutlined } from "@ant-design/icons";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LabelList } from "recharts";
import { apiService } from "@/services";
import { useSelector } from "react-redux";

const { Text } = Typography;

export default function DashboardQuarterlyChart() {
  const user = useSelector((state: any) => state.auth.User);
  const userDonVi = user?.donViSuDungId || user?.donViId || user?.idDonVi;

  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<any[]>([]);
  const [quy, setQuy] = useState<number>(Math.floor((new Date().getMonth()) / 3) + 1);
  const [nam, setNam] = useState<number>(new Date().getFullYear());

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);

  const quyOptions = [
    { value: 1, label: "Quý 1" },
    { value: 2, label: "Quý 2" },
    { value: 3, label: "Quý 3" },
    { value: 4, label: "Quý 4" }
  ];

  const namOptions = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i;
    return { value: year, label: `Năm ${year}` };
  });

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          quy: quy.toString(),
          nam: nam.toString(),
        });
        if (userDonVi) {
          queryParams.append("donViSuDungId", userDonVi);
        }
        const res = await apiService.get<any>(`/kPI_TieuChiChung_DiemSo/GetChartThongKeQuyToanCuc?${queryParams.toString()}`);
        if (res && res.status && res.data) {
          setData(res.data);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu thống kê quý:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchChartData();
  }, [quy, nam, userDonVi]);

  const handleBarClick = (entry: any) => {
    const dept = entry?.payload || entry;
    if (dept) {
      setSelectedDepartment(dept);
      setIsModalOpen(true);
    }
  };

  // Table columns for modal
  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center" as const,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Họ và tên",
      dataIndex: "tenNhanSu",
      key: "tenNhanSu",
      render: (text: string) => (
        <Space orientation="horizontal">
          <UserOutlined style={{ color: "#0355a2" }} />
          <Text strong>{text || "-"}</Text>
        </Space>
      ),
    },
    {
      title: "Chức vụ",
      dataIndex: "chucVu_txt",
      key: "chucVu_txt",
      render: (text: string, record: any) => text || record.chucVu || "-",
    },
    {
      title: "Điểm Tháng 1",
      dataIndex: "diemTieuChiKQNhiemVu_ThangThuNhat",
      key: "diemTieuChiKQNhiemVu_ThangThuNhat",
      align: "center" as const,
      render: (val: number | null) => (val != null ? <Text>{val}</Text> : <Text type="secondary">-</Text>),
    },
    {
      title: "Điểm Tháng 2",
      dataIndex: "diemTieuChiKQNhiemVu_ThangThuHai",
      key: "diemTieuChiKQNhiemVu_ThangThuHai",
      align: "center" as const,
      render: (val: number | null) => (val != null ? <Text>{val}</Text> : <Text type="secondary">-</Text>),
    },
    {
      title: "Điểm Tháng 3",
      dataIndex: "diemTieuChiKQNhiemVu_ThangCuoi",
      key: "diemTieuChiKQNhiemVu_ThangCuoi",
      align: "center" as const,
      render: (val: number | null) => (val != null ? <Text>{val}</Text> : <Text type="secondary">-</Text>),
    },
    {
      title: "ĐTB Nhiệm vụ",
      dataIndex: "diemTieuChiKQNhiemVu_TrungBinh",
      key: "diemTieuChiKQNhiemVu_TrungBinh",
      align: "center" as const,
      render: (val: number | null) => (
        val != null ? (
          <span style={{ color: "#0284c7", fontWeight: 600 }}>{val}</span>
        ) : (
          <Text type="secondary">-</Text>
        )
      ),
    },
    {
      title: "Tiêu chí chung",
      dataIndex: "diemTieuChiChung",
      key: "diemTieuChiChung",
      align: "center" as const,
      render: (val: number | null) => (
        val != null ? (
          <span style={{ color: "#d97706", fontWeight: 600 }}>{val}</span>
        ) : (
          <Text type="secondary">-</Text>
        )
      ),
    },
    {
      title: "Điểm Quý",
      dataIndex: "diemTheoDoiDanhGiaQuy",
      key: "diemTheoDoiDanhGiaQuy",
      align: "center" as const,
      render: (val: number | null) => (
        val != null ? (
          <Tag color="blue" style={{ fontSize: 13, fontWeight: 700, padding: "2px 8px" }}>
            {val}
          </Tag>
        ) : (
          <Tag color="default">-</Tag>
        )
      ),
    },
    {
      title: "Trạng thái",
      key: "trangThai",
      align: "center" as const,
      render: (_: any, record: any) => {
        const daDanhGia = record.daDanhGia || record.diemTheoDoiDanhGiaQuy != null || record.diemTieuChiKQNhiemVu_TrungBinh != null;
        return daDanhGia ? (
          <Tag color="success">Đã đánh giá</Tag>
        ) : (
          <Tag color="default">Chưa đánh giá</Tag>
        );
      },
    },
  ];

  return (
    <>
      <Card
        className="kpi-dashboard-card"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 4, height: 18, borderRadius: 4, background: '#1d4ed8', display: 'inline-block', flexShrink: 0 }} />
            <BarChartOutlined style={{ color: "#1d4ed8", fontSize: 18 }} />
            <span style={{ color: "#1e3a8a", fontWeight: 700, fontSize: 14, textTransform: "uppercase" }}>
              THỐNG KÊ TRUNG BÌNH ĐIỂM ĐÁNH GIÁ QUÝ CÁC ĐƠN VỊ
            </span>
          </div>
        }
        extra={
          <div style={{ display: "flex", gap: "10px" }}>
            <Select
              value={quy}
              options={quyOptions}
              onChange={(val) => setQuy(val)}
              style={{ width: 100 }}
            />
            <Select
              value={nam}
              options={namOptions}
              onChange={(val) => setNam(val)}
              style={{ width: 120 }}
            />
          </div>
        }
        headStyle={{ background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", borderBottom: "1px solid #bfdbfe", padding: "14px 20px" }}
        style={{ marginTop: "32px", marginBottom: "32px", border: "1px solid #bfdbfe", background: "#ffffff", boxShadow: "0 4px 16px rgba(30, 58, 138, 0.06)" }}
      >
        <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
          <InfoCircleOutlined style={{ color: "#0355a2" }} />
          <Text type="secondary" style={{ fontSize: 13 }}>
            Nhấp vào từng cột trên biểu đồ để xem danh sách nhân sự và chi tiết điểm số cấu thành
          </Text>
        </div>

        <Spin spinning={loading}>
          {data && data.length > 0 ? (
            <div style={{ height: 480 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 30, right: 30, left: 0, bottom: 100 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                  <XAxis
                    dataKey="tenPhongBan"
                    tick={{ fontSize: 12, fill: "#334155", fontWeight: 500 }}
                    interval={0}
                    angle={-35}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.15)]} />
                  <RechartsTooltip
                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                    formatter={(value: any) => [`${value} điểm`, 'Điểm trung bình Quý']}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar
                    dataKey="diemTrungBinhQuy"
                    name="Điểm Trung Bình Đánh Giá Quý"
                    fill="#0355a2"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                    style={{ cursor: "pointer" }}
                    onClick={handleBarClick}
                  >
                    <LabelList
                      dataKey="diemTrungBinhQuy"
                      position="top"
                      formatter={(val: any) => (val != null && val !== "" && Number(val) > 0 ? `${val}` : "")}
                      style={{ fontSize: 13, fontWeight: 700, fill: "#0355a2" }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Empty description="Không có dữ liệu cho Quý này" style={{ padding: "40px 0" }} />
          )}
        </Spin>
      </Card>

      {/* Modal chi tiết nhân sự cấu thành điểm số */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, color: "#ffffff" }}>
            <ApartmentOutlined style={{ color: "#ffffff", fontSize: 20 }} />
            <span style={{ fontSize: 16, fontWeight: 700, color: "#ffffff" }}>
              CHI TIẾT ĐIỂM ĐÁNH GIÁ QUÝ {quy}/{nam} - {selectedDepartment?.tenPhongBan?.toUpperCase()}
            </span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={1050}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsModalOpen(false)}>
            Đóng
          </Button>
        ]}
      >
        {selectedDepartment && (
          <div>
            <Row gutter={[16, 16]} style={{ marginBottom: 20, marginTop: 10 }}>
              <Col span={8}>
                <Card size="small" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Điểm TB Đánh Giá Quý</Text>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#15803d" }}>
                    {selectedDepartment.diemTrungBinhQuy ?? 0} <span style={{ fontSize: 14, fontWeight: 500 }}>điểm</span>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Tổng Số Nhân Sự</Text>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#1d4ed8" }}>
                    {selectedDepartment.soLuongNhanSu ?? selectedDepartment.listNhanSu?.length ?? 0} <span style={{ fontSize: 14, fontWeight: 500 }}>cán bộ</span>
                  </div>
                </Card>
              </Col>
              <Col span={8}>
                <Card size="small" style={{ background: "#faf5ff", border: "1px solid #e9d5ff" }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Số Cán Bộ Đã Đánh Giá</Text>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#7e22ce" }}>
                    {selectedDepartment.soLuongDaDanhGia ?? 0} / {selectedDepartment.soLuongNhanSu ?? selectedDepartment.listNhanSu?.length ?? 0} <span style={{ fontSize: 14, fontWeight: 500 }}>cán bộ</span>
                  </div>
                </Card>
              </Col>
            </Row>

            <Table
              dataSource={selectedDepartment.listNhanSu || []}
              columns={columns}
              rowKey={(record: any) => record.lyLichId || record.id || Math.random().toString()}
              pagination={{ pageSize: 8, showSizeChanger: false }}
              size="middle"
              bordered
              locale={{ emptyText: "Không có dữ liệu nhân sự" }}
            />

            <div style={{ marginTop: 14, padding: "10px 14px", background: "#f8fafc", borderRadius: 6, border: "1px dashed #cbd5e1", fontSize: 12, color: "#64748b" }}>
              💡 <strong>Công thức tính:</strong> Điểm TB Quý của đơn vị = Tổng điểm Quý của các cán bộ có đánh giá / Số cán bộ có đánh giá.
              Điểm Quý của mỗi cán bộ = Điểm trung bình nhiệm vụ các tháng (tối đa 70) + Điểm tiêu chí chung (tối đa 30).
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
