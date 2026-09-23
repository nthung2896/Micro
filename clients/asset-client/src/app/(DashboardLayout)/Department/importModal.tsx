"use client";
import departmentService from "@/services/department/department.service";
import { InboxOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  ConfigProvider,
  InputNumber,
  Modal,
  Space,
  Table,
  Upload,
  message,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import React, { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ImportModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [startRow, setStartRow] = useState<number>(2);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [importResult, setImportResult] = useState<any | null>(null);

  const handleBeforeUpload = (file: any) => {
    const uploadItem: UploadFile = {
      uid: file.uid || `${Date.now()}`,
      name: file.name || "File_Excel.xlsx",
      status: "done",
      originFileObj: file,
    };
    setFileList([uploadItem]);
    setImportResult(null);
    return false; // Ngăn Upload tự động gửi request HTTP
  };

  const handleChange = (info: any) => {
    if (info.fileList && info.fileList.length > 0) {
      const latest: any = info.fileList[info.fileList.length - 1];
      if (!latest.originFileObj && info.file instanceof File) {
        (latest as any).originFileObj = info.file;
      } else if (!latest.originFileObj && latest instanceof File) {
        (latest as any).originFileObj = latest;
      }
      setFileList([latest as UploadFile]);
    } else {
      setFileList([]);
    }
  };

  const handleRemove = () => {
    setFileList([]);
    setImportResult(null);
  };

  const handleImport = async () => {
    if (fileList.length === 0) {
      message.warning("Vui lòng chọn file Excel trước khi import");
      return;
    }

    const file = (fileList[0].originFileObj || fileList[0]) as File;
    if (!file || (!(file instanceof File) && !("size" in file))) {
      message.warning("Vui lòng chọn file Excel trước khi import");
      return;
    }

    try {
      setSubmitting(true);
      setImportResult(null);
      const res = await departmentService.importExcelDirect(file, startRow);

      const data = (res as any)?.data ?? res;
      if (data?.status || data?.listTrue?.length >= 0) {
        setImportResult(data);
        if (data?.totalSuccess > 0) {
          message.success(`Import thành công ${data.totalSuccess} đơn vị!`);
          onSuccess();
        } else {
          message.info("Hoàn tất xử lý, không có dòng mới nào được import thành công.");
        }
      } else {
        message.error(data?.message || "Import thất bại");
      }
    } catch (error: any) {
      message.error(typeof error === "string" ? error : "Lỗi kết nối khi import Excel");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFileList([]);
    setImportResult(null);
    onClose();
  };

  const errorColumns = [
    {
      title: "Dòng số",
      dataIndex: "row",
      key: "row",
      width: 90,
      align: "center" as const,
    },
    {
      title: "Lý do lỗi",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "Mã đơn vị",
      dataIndex: "maDonVi",
      key: "maDonVi",
      width: 130,
    },
    {
      title: "Tên đơn vị",
      dataIndex: "tenDonVi",
      key: "tenDonVi",
    },
  ];

  return (
    <ConfigProvider
      theme={{
        components: {
          Modal: {
            headerBg: "#0355a2",
            titleColor: "#ffffff",
            footerBg: "#f5f5f5",
          },
        },
      }}
    >
      <Modal
        open={isOpen}
        title={
          <span style={{ color: "#ffffff", fontWeight: 600, fontSize: "16px" }}>
            Import danh sách Đơn vị / Phòng ban từ Excel
          </span>
        }
        styles={{
          header: {
            padding: "16px 24px",
          },
          body: {
            padding: "20px 24px",
          },
          footer: {
            padding: "12px 24px",
            borderTop: "1px solid #e8e8e8",
          },
        }}
        closeIcon={<span style={{ color: "#ffffff", fontSize: "20px" }}>×</span>}
        onCancel={handleClose}
        footer={[
          <Button key="close" onClick={handleClose} disabled={submitting}>
            Đóng
          </Button>,
          <Button
            key="submit"
            type="primary"
            style={{ color: "white" }}
            loading={submitting}
            onClick={handleImport}
            disabled={fileList.length === 0}
          >
            Thực hiện Import
          </Button>,
        ]}
        width={700}
        destroyOnClose
      >
        <div className="flex flex-col gap-4 py-2">
          <Alert
            message="Hướng dẫn cấu trúc cột trong file Excel theo mẫu:"
            description={
              <ul className="list-disc pl-5 text-xs text-gray-600 space-y-1 mt-1">
                <li><b>Cột 1:</b> <b>Mã Đơn Vị</b> (Ví dụ: <code>1</code>, <code>1.1</code>, <code>1.2</code>, <code>1.2.1</code>... Hệ thống dựa vào các dấu chấm <code>.</code> để tự nhận diện cấp Level và tự động liên kết cấu trúc cha - con)</li>
                <li><b>Cột 2:</b> <b>Tên Đơn Vị (Bắt buộc)</b> (Ví dụ: Cục Công nghệ thông tin..., Phòng Kế hoạch tổng hợp...)</li>
                <li><b>Cột 3:</b> <b>Tên Viết Tắt</b> (Ví dụ: KHTH, CNTT, DVC... Nếu có sẽ được dùng làm Tên viết tắt và Mã Code đơn vị)</li>
              </ul>
            }
            type="info"
            showIcon
          />

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">
              Dòng dữ liệu bắt đầu:
            </span>
            <InputNumber
              min={1}
              max={100}
              value={startRow}
              onChange={(val) => setStartRow(val || 2)}
            />
            <span className="text-xs text-gray-400">
              (Ví dụ: nhập 2 nếu dòng 1 là tiêu đề)
            </span>
          </div>

          <Upload.Dragger
            name="file"
            multiple={false}
            fileList={fileList}
            beforeUpload={handleBeforeUpload as any}
            onChange={handleChange}
            onRemove={handleRemove}
            accept=".xlsx, .xls"
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined className="text-[#0143DF]!" />
            </p>
            <p className="ant-upload-text">
              Nhấn hoặc kéo thả file Excel vào đây để tải lên
            </p>
            <p className="ant-upload-hint">
              Hỗ trợ định dạng .xlsx, .xls. Chỉ tải lên 1 file mỗi lần.
            </p>
          </Upload.Dragger>

          {importResult && (
            <div className="mt-3 space-y-3">
              <Alert
                message={importResult.message}
                type={importResult.totalFailed > 0 ? "warning" : "success"}
                showIcon
              />

              {importResult?.lstFalse && importResult.lstFalse.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-red-600 mb-2">
                    Danh sách các dòng lỗi ({importResult.lstFalse.length}):
                  </h4>
                  <Table
                    columns={errorColumns}
                    dataSource={importResult.lstFalse}
                    rowKey={(record: any, index) => `${record.row}_${index}`}
                    size="small"
                    pagination={{ pageSize: 5 }}
                    bordered
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default ImportModal;
