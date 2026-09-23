"use client";

import React, { useEffect, useState } from "react";
import { Button, Empty, Space, Spin, Table, TableProps, Tag, Tooltip } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import fileServerService from "@/libs/file-uploader/fileServer.service";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";
import LoaiTaiLieuContractConstant from "@/constants/LoaiTaiLieuContractConstant";
import LoaiTaiLieuConstant from "@/constants/LoaiTaiLieuConstant";
import { AuthenticationContractType } from "@/types/authenticationContract/dto";

interface DocumentsTabProps {
  item?: AuthenticationContractType | null;
}

const DocumentsTab: React.FC<DocumentsTabProps> = ({ item }) => {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<TaiLieuDinhKemType[]>([]);
  const [loaded, setLoaded] = useState(false);

  const itemId = item?.id;

  const getLoaiTaiLieuDisplayName = (code?: string) => {
    if (!code) return "Tài liệu đính kèm";
    
    // Check Contract constants first
    const contractName = LoaiTaiLieuContractConstant.getDisplayName(code);
    if (contractName && contractName !== code) {
      return contractName;
    }

    if (code === "Avatar") {
      return "Logo website";
    }

    // Check general constants
    const generalName = LoaiTaiLieuConstant.getDisplayName(code);
    if (generalName && generalName !== code) {
      return generalName;
    }

    return code;
  };

  useEffect(() => {
    setLoaded(false);
    setFiles([]);
  }, [itemId]);

  useEffect(() => {
    if (loaded || !itemId) return;
    const loadFiles = async () => {
      setLoading(true);
      try {
        const response = await fileServerService.getByItemId(itemId);
        if (response?.data) {
          const allowedCodes = ["DangKyChungThuc", "HuongDanDichVu", "ChungMinhTenMien"];
          const filtered = response.data.filter(
            (f) => f.loaiTaiLieu && allowedCodes.includes(f.loaiTaiLieu)
          );
          setFiles(filtered);
        }
      } catch (err) {
        console.error("DocumentsTab: Error loading files:", err);
      } finally {
        setLoading(false);
        setLoaded(true);
      }
    };
    loadFiles();
  }, [itemId, loaded]);

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

  const columns: TableProps<TaiLieuDinhKemType>["columns"] = [
    {
      title: "STT",
      width: 55,
      align: "center",
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: "Tên tài liệu",
      dataIndex: "tenTaiLieu",
      ellipsis: true,
      render: (name: string, record) => {
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
      width: 350,
      render: (code: string, record) => (
        <div style={{ whiteSpace: "normal", wordBreak: "break-word" }}>
          {record.loaiTaiLieuTxt || getLoaiTaiLieuDisplayName(code)}
        </div>
      ),
    },
    {
      title: "Ký số",
      width: 120,
      align: "center",
      render: (_: unknown, record) => {
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
      render: (_: unknown, record) => {
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
  ];

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <Spin />
      </div>
    );
  }

  if (!files.length) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Chưa có tài liệu đính kèm"
      />
    );
  }

  return (
    <Table
      columns={columns}
      dataSource={files}
      rowKey="id"
      bordered
      size="small"
      pagination={false}
    />
  );
};

export default DocumentsTab;
