import React, { useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Drawer,
  Modal,
  Space,
  Table,
  Tabs,
  Typography,
  Upload,
  message,
} from "antd";
import {
  CheckCircleOutlined,
  FileExcelOutlined,
  SaveOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { downloadFileFromBase64 } from "@/utils/fileDownload";
import { DataImport } from "@/types/general";
import { ImportAdapter } from "@/types/ImportExcel/import";

const { Text, Title } = Typography;

interface Props {
  service: ImportAdapter;
  collectionName: string;
  onSuccess?: () => void;
  buttonText?: string;
  modalTitle?: string;
  templateFileName?: string;
  notes?: React.ReactNode;
}

type ImportColumn = {
  order: number;
  columnName: string;
  displayName: string;
};

const excelButtonStyle = {
  background: "#217346",
  borderColor: "#217346",
  color: "#fff",
};

const panelStyle: React.CSSProperties = {
  borderRadius: 14,
  border: "1px solid #d9e7da",
  background:
    "linear-gradient(180deg, rgba(242,249,244,0.95) 0%, rgba(255,255,255,1) 100%)",
  boxShadow: "0 10px 28px rgba(33, 115, 70, 0.08)",
};

const dropzoneStyle: React.CSSProperties = {
  border: "1px dashed #6fb188",
  borderRadius: 12,
  background: "#f7fbf8",
  padding: 24,
  textAlign: "center",
};

const resolveColumnValue = (
  record: Record<string, unknown>,
  columnName: string,
) => {
  if (!record || !columnName) return undefined;

  if (columnName in record) return record[columnName];

  const camelCaseKey = columnName.charAt(0).toLowerCase() + columnName.slice(1);
  if (camelCaseKey in record) return record[camelCaseKey];

  const matchedKey = Object.keys(record).find(
    (key) => key.toLowerCase() === columnName.toLowerCase(),
  );
  if (matchedKey) return record[matchedKey];

  return undefined;
};
const getErrorMessage = (error: unknown) => {
  if (!error || typeof error !== "object") return "Loi he thong";

  const maybeError = error as {
    message?: string;
    response?: {
      data?: {
        message?: string;
      };
    };
  };

  return (
    maybeError.response?.data?.message || maybeError.message || "Loi he thong"
  );
};

const ImportExcelButton: React.FC<Props> = ({
  service,
  collectionName,
  onSuccess,
  buttonText = "Import từ Excel",
  modalTitle = "Nhập dữ liệu từ tệp Excel",
  templateFileName = "Danh-sach-mau.xlsx",
  notes,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [collection, setCollection] = useState<ImportColumn[]>([]);
  const [openRow, setOpenRow] = useState<any>(null);

  const validRows = result?.listTrue ?? result?.ListTrue ?? [];
  const invalidRows = result?.lstFalse ?? result?.LstFalse ?? [];

  const sortedColumns = useMemo(
    () => [...collection].sort((a, b) => a.order - b.order),
    [collection],
  );

  const previewColumns = useMemo(
    () => [
      {
        title: "STT",
        key: "__idx",
        width: 70,
        align: "center" as const,
        render: (_: unknown, __: unknown, index: number) => index + 1,
      },
      ...sortedColumns.map((column) => ({
        title: column.displayName,
        dataIndex: column.columnName,
        key: column.columnName,
        ellipsis: true,
        render: (_value: unknown, record: Record<string, unknown>) => {
          const value = resolveColumnValue(record, column.columnName);
          return value === null || value === undefined || value === ""
            ? "-"
            : String(value);
        },
      })),
    ],
    [sortedColumns],
  );

  const invalidTableData = useMemo(
    () =>
      invalidRows.map((row: any[], index: number) => {
        const errorHtml = row[row.length - 1] || "";
        const values = row.slice(0, row.length - 1);
        const mappedRow: Record<string, unknown> = {
          __idx: index + 1,
          __error: String(errorHtml).replaceAll("</br>", "\n"),
        };

        sortedColumns.forEach((column, colIndex) => {
          mappedRow[column.columnName] = values[colIndex] ?? "";
        });

        return mappedRow;
      }),
    [invalidRows, sortedColumns],
  );

  const handleClose = () => {
    setIsModalOpen(false);
    setFileList([]);
    setResult(null);
    setCollection([]);
    setOpenRow(null);
  };

  const handleImportTemplate = async () => {
    const response = await service.exportTemplateImport();
    if (response.status) {
      downloadFileFromBase64(response.data, templateFileName);
      return;
    }
    message.error(response.message);
  };

  const handleUploadPreview = async () => {
    if (fileList.length === 0) {
      message.error("Vui lòng chọn file Excel.");
      return;
    }

    const formData = new FormData();
    formData.append("files", fileList[0] as any);
    formData.append("Collection", collectionName);

    setUploading(true);
    try {
      const uploadRes = await service.uploadFile(formData);
      const uploadData = uploadRes.data[0];

      const columnsRes = await service.importColumns();
      const importedColumns = columnsRes.data || [];
      setCollection(importedColumns);

      const dataImport: DataImport = {
        idFile: uploadData.id,
        collection: importedColumns,
      };

      const res = await service.importExcel(dataImport);
      const preview = res.data?.data ?? res.data;
      setResult(preview);

      message.success(
        "Đã đọc file xong. Kiểm tra kết quả và bấm 'Lưu dữ liệu' nếu hợp lệ.",
      );
    } catch (error) {
      message.error("Import thất bại: " + getErrorMessage(error));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!validRows.length) {
      message.warning("Không có dòng hợp lệ để lưu.");
      return;
    }

    try {
      setSaving(true);
      const res = await service.save(validRows);
      const ok = res?.data?.status ?? res?.data?.success ?? res?.status;

      if (ok === false) {
        message.error(res?.data?.message || "Lưu thất bại");
        return;
      }

      message.success("Lưu dữ liệu thành công.");
      onSuccess?.();
      handleClose();
    } catch (error) {
      message.error("Lưu thất bại: " + getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button
        icon={<FileExcelOutlined />}
        onClick={() => setIsModalOpen(true)}
        style={excelButtonStyle}
      >
        {buttonText}
      </Button>

      <Modal
        title={modalTitle}
        open={isModalOpen}
        onCancel={handleClose}
        width={920}
        destroyOnClose
        footer={
          !result ? (
            <Space>
              <Button onClick={handleClose}>Hủy</Button>
              <Button
                type="primary"
                loading={uploading}
                icon={<UploadOutlined />}
                onClick={handleUploadPreview}
              >
                Tải lên và kiểm tra
              </Button>
            </Space>
          ) : (
            <Space>
              <Button onClick={handleClose}>Đóng</Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                loading={saving}
                disabled={!validRows.length}
                onClick={handleSave}
              >
                Lưu dữ liệu
              </Button>
            </Space>
          )
        }
      >
        {!result ? (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Card bordered={false} style={panelStyle}>
              <Space direction="vertical" size={18} style={{ width: "100%" }}>
                <div>
                  <Title level={5} style={{ margin: 0 }}>
                    Chuẩn bị file import
                  </Title>
                  <Text type="secondary">
                    Chọn một file Excel `.xlsx` hoặc `.xls`, hệ thống sẽ đọc dữ
                    liệu và cho bạn xem trước trước khi lưu.
                  </Text>
                </div>

                <div style={dropzoneStyle}>
                  <Space
                    direction="vertical"
                    size={12}
                    style={{ width: "100%" }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 16,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#e7f4eb",
                        color: "#217346",
                        fontSize: 24,
                        margin: "0 auto",
                      }}
                    >
                      <FileExcelOutlined />
                    </div>

                    <div>
                      <Text strong style={{ display: "block" }}>
                        Chọn tệp Excel để bắt đầu import
                      </Text>
                      <Text type="secondary">
                        Mỗi lần chỉ xử lý một file để dễ kiểm tra lỗi.
                      </Text>
                    </div>

                    <Upload
                      fileList={fileList}
                      beforeUpload={(file) => {
                        const isExcel =
                          file.type ===
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
                          file.type === "application/vnd.ms-excel";

                        if (!isExcel) {
                          message.error(
                            `${file.name} không phải là file Excel hợp lệ.`,
                          );
                          return Upload.LIST_IGNORE;
                        }

                        setFileList([file as any]);
                        return false;
                      }}
                      onRemove={() => setFileList([])}
                      maxCount={1}
                    >
                      <Button
                        icon={<UploadOutlined />}
                        style={excelButtonStyle}
                      >
                        Chọn tệp Excel
                      </Button>
                    </Upload>
                  </Space>
                </div>

                <Alert
                  type="info"
                  showIcon
                  message="Lưu ý khi import"
                  description={
                    notes ||
                    "Nếu file có cột logic đặc biệt, hãy nhập theo đúng quy ước của biểu mẫu."
                  }
                />

                <Button
                  type="link"
                  icon={<FileExcelOutlined />}
                  onClick={handleImportTemplate}
                  style={{ paddingInline: 0, alignSelf: "flex-start" }}
                >
                  Tải tệp mẫu (.xlsx)
                </Button>
              </Space>
            </Card>
          </Space>
        ) : (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Card bordered={false} style={panelStyle}>
              <Space
                wrap
                size={[16, 12]}
                style={{ width: "100%", justifyContent: "space-between" }}
              >
                <div>
                  <Title level={5} style={{ margin: 0 }}>
                    Kết quả kiểm tra dữ liệu
                  </Title>
                  <Text type="secondary">
                    Dữ liệu hợp lệ có thể lưu ngay. Các dòng lỗi cần kiểm tra
                    lại từ file nguồn.
                  </Text>
                </div>

                <Space wrap size={[16, 8]}>
                  <Badge
                    status="success"
                    text={`Hợp lệ: ${validRows.length} dòng`}
                  />
                  <Badge
                    status="error"
                    text={`Lỗi: ${invalidRows.length} dòng`}
                  />
                </Space>
              </Space>
            </Card>

            <Tabs
              defaultActiveKey="ok"
              items={[
                {
                  key: "ok",
                  label: (
                    <Space size={6}>
                      <CheckCircleOutlined style={{ color: "#389e0d" }} />
                      <span>Hợp lệ ({validRows.length})</span>
                    </Space>
                  ),
                  children: (
                    <Table
                      bordered
                      size="small"
                      pagination={{ pageSize: 6 }}
                      scroll={{ x: "max-content", y: 320 }}
                      rowKey={(_, index) => String(index)}
                      dataSource={validRows.map((row: any, index: number) => ({
                        key: index,
                        ...row,
                      }))}
                      columns={previewColumns}
                    />
                  ),
                },
                {
                  key: "bad",
                  label: `Lỗi (${invalidRows.length})`,
                  children: (
                    <Table
                      bordered
                      size="small"
                      pagination={{ pageSize: 6 }}
                      scroll={{ x: "max-content", y: 320 }}
                      rowKey={(record) => String(record.__idx)}
                      dataSource={invalidTableData}
                      columns={[
                        {
                          title: "Dòng",
                          dataIndex: "__idx",
                          key: "__idx",
                          width: 70,
                          align: "center",
                        },
                        {
                          title: "Lý do lỗi",
                          dataIndex: "__error",
                          key: "__error",
                          render: (text: string) => (
                            <Text
                              type="danger"
                              style={{ whiteSpace: "pre-line" }}
                            >
                              {text || "-"}
                            </Text>
                          ),
                        },
                        {
                          title: "",
                          key: "__action",
                          width: 140,
                          align: "center",
                          render: (_: unknown, record: any) => (
                            <Button onClick={() => setOpenRow(record)}>
                              Xem dữ liệu
                            </Button>
                          ),
                        },
                      ]}
                    />
                  ),
                },
              ]}
            />

            <Text type="secondary">
              Các dòng lỗi không được lưu. Bạn có thể mở chi tiết từng dòng để
              đối chiếu với biểu mẫu gốc.
            </Text>

            <Drawer
              title={`Chi tiết dòng lỗi ${openRow?.__idx ? `#${openRow.__idx}` : ""}`}
              open={!!openRow}
              onClose={() => setOpenRow(null)}
              width={560}
            >
              {openRow ? (
                <Space direction="vertical" size={16} style={{ width: "100%" }}>
                  <Alert
                    type="error"
                    showIcon
                    message="Lý do lỗi"
                    description={
                      <span style={{ whiteSpace: "pre-line" }}>
                        {openRow.__error || "-"}
                      </span>
                    }
                  />

                  <Card size="small" title="Dữ liệu của dòng này">
                    <Space
                      direction="vertical"
                      size={0}
                      style={{ width: "100%" }}
                    >
                      {sortedColumns.map((column) => (
                        <div
                          key={column.columnName}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "180px 1fr",
                            gap: 12,
                            padding: "10px 0",
                            borderBottom: "1px solid #f0f0f0",
                          }}
                        >
                          <Text strong>{column.displayName}</Text>
                          <Text>
                            {(() => {
                              const value = resolveColumnValue(
                                openRow,
                                column.columnName,
                              );
                              return value === "" ? "-" : String(value ?? "-");
                            })()}
                          </Text>
                        </div>
                      ))}
                    </Space>
                  </Card>
                </Space>
              ) : null}
            </Drawer>
          </Space>
        )}
      </Modal>
    </>
  );
};

export default ImportExcelButton;
