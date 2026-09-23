"use client";
import React, { useState } from "react";
import { Breadcrumb, Button, Card, Col, Row, Space, Table, Typography, Upload, Alert } from "antd";
import { UploadOutlined, DownloadOutlined, LeftOutlined, InboxOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import kPI_NhomTieuChiService from "@/services/kPI_NhomTieuChi/kPI_NhomTieuChiService";
import { ImportResponseType } from "@/types/kPI_NhomTieuChi/kPI_NhomTieuChi";

import KPI_NhomTieuChiImportModal from "../importModal";

const { Title, Text } = Typography;
const { Dragger } = Upload;

export default function ImportKPINhomTieuChiPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importResult, setImportResult] = useState<ImportResponseType | null>(null);

  const handleUpload = () => {
    if (!file) {
      toast.error("Vui lòng chọn file Excel để import");
      return;
    }
    setIsModalOpen(true);
  };

  const handleDownloadOriginalFile = () => {
    if (file) {
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Original_" + file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const columns = [
    {
      title: "Dòng",
      dataIndex: "row",
      key: "row",
      width: 80,
    },
    {
      title: "Tên nhóm",
      dataIndex: "tenNhom",
      key: "tenNhom",
    },
    {
      title: "Công việc",
      dataIndex: "congViec",
      key: "congViec",
    },
    {
      title: "Lý do thất bại",
      dataIndex: "reason",
      key: "reason",
      render: (text: string) => <Text type="danger">{text}</Text>
    }
  ];

  return (
    <div className="p-4">
      <Space direction="vertical" style={{ width: "100%" }} size="large">
        <Breadcrumb
          items={[
            { title: <a onClick={() => router.push("/kPI_NhomTieuChi")}>Danh sách Nhóm Tiêu Chí KPI</a> },
            { title: "Import Excel" }
          ]}
        />

        <div className="flex justify-between items-center">
          <Title level={4} style={{ margin: 0 }}>Import dữ liệu Nhóm Tiêu Chí</Title>
          <Button icon={<LeftOutlined />} onClick={() => router.push("/kPI_NhomTieuChi")}>
            Quay lại
          </Button>
        </div>

        <Card>
          <Row gutter={24}>
            <Col span={8}>
              <Dragger
                accept=".xlsx, .xls"
                beforeUpload={(f) => {
                  setFile(f);
                  setImportResult(null);
                  return false; // Prevent auto upload
                }}
                fileList={file ? [file as any] : []}
                onRemove={() => {
                  setFile(null);
                  setImportResult(null);
                }}
                maxCount={1}
              >
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click hoặc kéo thả file Excel vào khu vực này</p>
                <p className="ant-upload-hint">Chỉ hỗ trợ file có định dạng .xlsx, .xls</p>
              </Dragger>

              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={handleUpload}
                disabled={!file}
                style={{ marginTop: 16, width: "100%" }}
              >
                Cấu hình & Thực hiện Import
              </Button>
            </Col>

            <Col span={16}>
              {importResult && (
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Alert
                    message="Kết quả Import"
                    description={
                      <div>
                        <div>Thành công: <b>{importResult.totalSuccess}</b> bản ghi.</div>
                        <div>Thất bại: <b>{importResult.totalFailed}</b> bản ghi.</div>
                      </div>
                    }
                    type={importResult.totalFailed > 0 ? "warning" : "success"}
                    showIcon
                  />

                  {importResult.totalFailed > 0 && (
                    <Card
                      title="Danh sách bản ghi lỗi"

                      extra={
                        <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownloadOriginalFile}>
                          Tải file gốc
                        </Button>
                      }
                    >
                      <Table
                        columns={columns}
                        dataSource={importResult.lstFalse}
                        rowKey="row"
                        pagination={{ pageSize: 10 }}

                        bordered
                      />
                    </Card>
                  )}
                </Space>
              )}
            </Col>
          </Row>
        </Card>

        <KPI_NhomTieuChiImportModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            router.push("/kPI_NhomTieuChi");
          }}
          initialFile={file}
        />
      </Space>
    </div>
  );
}
