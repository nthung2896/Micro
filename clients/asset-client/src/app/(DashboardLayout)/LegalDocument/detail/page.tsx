"use client";

import {
  Card,
  Spin,
  Button,
  Row,
  Col,
  Tag,
  Space,
  Divider,
  message
} from "antd";
import React, { useEffect, useState } from "react";
import { ArrowLeftOutlined, FilePdfOutlined, EditOutlined } from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import legalDocumentService from "@/services/legalDocument/legalDocument.service";
import { LegalDocumentDto } from "@/types/legalDocument";
import formatDate from "@/utils/formatDate";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import Flex from "@/components/shared-components/Flex";
import SingleFileUploader from "@/components/upload-file/SingleFileUploader";
import FileCategoryConstant from "@/constants/FileCategoryConstant";

const staticUrl = process.env.NEXT_PUBLIC_STATIC_FILE_BASE_URL || "";

const InfoItem: React.FC<{
  label: string;
  value: React.ReactNode;
  span?: number;
}> = ({ label, value, span = 8 }) => {
  return (
    <Col xs={24} sm={span} className="mb-4">
      <div style={{ color: "#64748b", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>{label}:</div>
      <div style={{ color: "#1e293b", fontSize: "14px", fontWeight: 600, wordBreak: "break-word" }}>
        {value !== undefined && value !== null && value !== "" ? (
          value
        ) : (
          <span style={{ color: "#94a3b8", fontWeight: 400, fontStyle: "italic" }}>Không có</span>
        )}
      </div>
    </Col>
  );
};

const LegalDocumentDetailPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [data, setData] = useState<LegalDocumentDto | null>(null);
  const [file, setFile] = useState<any>(null);

  const fetchDetails = async () => {
    if (!id) return;
    try {
      setPageLoading(true);
      const res = await legalDocumentService.getById(id);
      if (res?.status && res.data) {
        setData(res.data);
        // const fetchedData = res.data;
        // if (fetchedData.dinhKem && fetchedData.dinhKem.length > 0) {
        //   const mainFile = fetchedData.dinhKem[0];
        //   setFile({
        //     id: mainFile.id,
        //     tenTaiLieu: mainFile.tenTaiLieu || "Tài liệu đính kèm",
        //     duongDanFile: mainFile.duongDanFile || "",
        //     extension: mainFile.extension || "",
        //     isXoaFile: false,
        //     tenTaiLieuText: mainFile.tenTaiLieu || "Tài liệu đính kèm",
        //     duongDanFilePDF: "",
        //   } as any);
        // }
      }
    } catch (e) {
      message.error("Không thể tải thông tin văn bản chi tiết.");
      console.error(e);
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const getStatusTag = (status: string | null | undefined) => {
    switch (status) {
      case "Approved":
        return <Tag color="green">Đã duyệt</Tag>;
      case "Removed":
        return <Tag color="red">Gỡ bỏ</Tag>;
      case "Draft":
      default:
        return <Tag color="default">Bản nháp</Tag>;
    }
  };

  if (pageLoading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" tip="Đang tải chi tiết văn bản..." />
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <h3>Không tìm thấy dữ liệu văn bản pháp lý.</h3>
        <Button type="primary" onClick={() => router.push("/LegalDocument")}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 8px" }}>
      <AutoBreadcrumb
        items={[
          { title: "Quản lý văn bản pháp lý", href: "/LegalDocument" },
          { title: "Chi tiết văn bản" }
        ]}
      />


      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "#1e3a8a" }}>
              📄 Chi tiết văn bản pháp lý: {data.code}
            </span>
            {getStatusTag(data.status)}
          </div>
        }
        extra={
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/LegalDocument")}>
              Quay lại
            </Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => router.push(`/LegalDocument/createOrUpdate?id=${data.id}`)}
            >
              Chỉnh sửa
            </Button>
          </Space>
        }
        style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)", borderRadius: "10px" }}
      >
        <h3 style={{ color: "#1e3a8a", borderBottom: "2px solid #e2e8f0", paddingBottom: "6px", marginBottom: "16px" }}>
          Thông tin chung
        </h3>
        <Row gutter={16}>
          <InfoItem label="Số hiệu văn bản" value={data.code} span={8} />
          <InfoItem label="Loại văn bản" value={data.loaiVanBan} span={8} />
          <InfoItem label="Loại hệ thống" value={data.loaiHeThongName} span={8} />
        </Row>
        <Row gutter={16}>
          <InfoItem label="Ngày ban hành" value={data.publicDate ? formatDate(new Date(data.publicDate), false) : "-"} span={8} />
          <InfoItem label="Ngày có hiệu lực" value={data.activedDate ? formatDate(new Date(data.activedDate), false) : "-"} span={8} />
          <InfoItem label="Ngày hết hạn" value={data.expiredDate ? formatDate(new Date(data.expiredDate), false) : "-"} span={8} />
        </Row>
        <Row gutter={16}>
          <InfoItem label="Cơ quan ban hành" value={data.publicBy} span={8} />
          <InfoItem label="Người ký" value={data.signedBy} span={8} />
          <InfoItem label="Ngày tạo" value={data.createdDate ? formatDate(new Date(data.createdDate), false) : "-"} span={8} />
        </Row>

        <Divider />

        <h3 style={{ color: "#1e3a8a", borderBottom: "2px solid #e2e8f0", paddingBottom: "6px", marginBottom: "16px" }}>
          Mô tả ngắn / Trích yếu
        </h3>
        <p style={{ fontSize: "14px", color: "#334155", whiteSpace: "pre-line" }}>
          {data.description || <span style={{ fontStyle: "italic", color: "#94a3b8" }}>Không có mô tả</span>}
        </p>

        <Divider />

        <h3 style={{ color: "#1e3a8a", borderBottom: "2px solid #e2e8f0", paddingBottom: "6px", marginBottom: "16px" }}>
          File đính kèm
        </h3>
        <SingleFileUploader
          readOnly
          value={file}
          onChange={setFile}
          category={FileCategoryConstant.General}
          itemId={id || undefined}
          loaiTaiLieu="LegalDocument_File"
          taxCode="LegalDocument"
        />

        <Divider />

        <h3 style={{ color: "#1e3a8a", borderBottom: "2px solid #e2e8f0", paddingBottom: "6px", marginBottom: "16px" }}>
          Nội dung văn bản chi tiết
        </h3>
        <div
          style={{
            padding: "20px",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            minHeight: "200px",
            background: "#fff",
            boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.02)"
          }}
          className="quill-content"
          dangerouslySetInnerHTML={{ __html: data.content || '<p style="font-style: italic; color: #94a3b8;">Không có nội dung chi tiết</p>' }}
        />
      </Card>
    </div>
  );
};

export default LegalDocumentDetailPage;
