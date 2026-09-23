"use client";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Radio,
  Upload,
  Button,
  Alert,
  Table,
  Space,
  Typography,
} from "antd";
import {
  InboxOutlined,
  UploadOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { toast } from "react-toastify";
import departmentService from "@/services/department/department.service";
import kPI_BoTieuChiChungService from "@/services/kPI_BoTieuChiChung/kPI_BoTieuChiChungService";
import { DropdownOption } from "@/types/general";
import dayjs from "dayjs";

const { Text } = Typography;

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialFile?: File | null;
}

const KPI_BoTieuChiChungImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialFile,
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [donViList, setDonViList] = useState<DropdownOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);
  const [worksheetList, setWorksheetList] = useState<string[]>([]);
  const [checkingFile, setCheckingFile] = useState(false);
  const [headerData, setHeaderData] = useState<any>(null);

  const tenMode = Form.useWatch("tenMode", form) || "excel";
  const quyetDinhMode = Form.useWatch("quyetDinhMode", form) || "excel";

  useEffect(() => {
    const fetchDonVi = async () => {
      try {
        const res = await departmentService.getDropDepartment();
        if (res?.data) {
          setDonViList(res.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách Đơn vị", error);
      }
    };
    if (isOpen) {
      fetchDonVi();
    }
  }, [isOpen]);

  const loadHeaderInfo = async (fileToUse: File, sheetName: string) => {
    setCheckingFile(true);
    try {
      const res = await kPI_BoTieuChiChungService.getHeaderWorksheet(fileToUse, sheetName);
      if (res.status && res.data) {
        setHeaderData(res.data);
        const rowStart = res.data.dataStartRow ? res.data.dataStartRow : 5;
        form.setFieldsValue({
          RowStart: rowStart,
        });
        toast.info(`Đã nạp cấu hình (bắt đầu đọc từ dòng ${rowStart})`);
      }
    } catch (e) {
      console.error("Lỗi khi nạp thông tin header", e);
    } finally {
      setCheckingFile(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      form.resetFields();
      setImportResult(null);
      setWorksheetList([]);
      setHeaderData(null);
      if (initialFile) {
        setFileList([
          {
            uid: `${Date.now()}`,
            name: initialFile.name,
            status: "done",
            originFileObj: initialFile as any,
          },
        ]);
        kPI_BoTieuChiChungService.checkFileWorksheet(initialFile).then((res) => {
          if (res.status && res.data && Array.isArray(res.data) && res.data.length > 0) {
            setWorksheetList(res.data);
            form.setFieldsValue({ WorkSheetName: res.data[0] });
            loadHeaderInfo(initialFile, res.data[0]);
          }
        });
      } else {
        setFileList([]);
      }
    }
  }, [isOpen, initialFile, form]);

  const handleBeforeUpload = (file: any) => {
    const uploadItem: UploadFile = {
      uid: file.uid || `${Date.now()}`,
      name: file.name || "File_Excel.xlsx",
      status: "done",
      originFileObj: file,
    };
    setFileList([uploadItem]);
    setImportResult(null);
    setWorksheetList([]);
    setHeaderData(null);
    form.setFieldsValue({ WorkSheetName: undefined });

    setCheckingFile(true);
    kPI_BoTieuChiChungService
      .checkFileWorksheet(file)
      .then((res) => {
        if (res.status && res.data && Array.isArray(res.data) && res.data.length > 0) {
          setWorksheetList(res.data);
          form.setFieldsValue({ WorkSheetName: res.data[0] });
          loadHeaderInfo(file, res.data[0]);
        }
      })
      .catch((e) => {
        console.error("Lỗi khi kiểm tra worksheet", e);
      })
      .finally(() => {
        setCheckingFile(false);
      });

    return false;
  };

  const handleRemove = () => {
    setFileList([]);
    setImportResult(null);
  };

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    try {
      const res = await kPI_BoTieuChiChungService.exportTemplateImport();
      if (res?.data) {
        const base64Data = res.data;
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = "File_Mau_BoTieuChiChung_PhuLuc2.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
        toast.success("Tải file mẫu thành công!");
      } else {
        toast.error("Không thể tải file mẫu");
      }
    } catch (e) {
      console.error(e);
      toast.error("Lỗi khi tải file mẫu");
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleImport = async (values: any) => {
    if (fileList.length === 0) {
      toast.warning("Vui lòng chọn file Excel trước khi import");
      return;
    }

    const file = (fileList[0].originFileObj || fileList[0]) as File;
    if (!file || (!(file instanceof File) && !("size" in file))) {
      toast.warning("Vui lòng chọn file Excel hợp lệ");
      return;
    }

    const payload: any = {
      IdDonVi: values.IdDonVi,
      RowStart: values.RowStart ?? 5,
      WorkSheetName: values.WorkSheetName,
    };

    if (values.tenMode === "manual") {
      payload.TenBoTieuChiDonVi = values.TenBoTieuChiDonVi;
    } else {
      payload.RowName = values.RowName ?? 1;
    }

    if (values.quyetDinhMode === "manual") {
      payload.SoQuyetDinh = values.SoQuyetDinh;
      if (values.NgayQuyetDinh && dayjs.isDayjs(values.NgayQuyetDinh)) {
        payload.NgayQuyetDinh = values.NgayQuyetDinh.format("YYYY-MM-DD");
      } else if (values.NgayQuyetDinh) {
        payload.NgayQuyetDinh = values.NgayQuyetDinh;
      }
    } else {
      payload.RowInfo = values.RowInfo ?? 2;
    }

    setSubmitting(true);
    setImportResult(null);
    try {
      const res = await kPI_BoTieuChiChungService.importExcelDirect(file, payload);
      const data = (res as any)?.data ?? res;
      if (data?.listTrue !== undefined || res.status) {
        const importData = data?.listTrue !== undefined ? data : res.data;
        setImportResult(importData);
        if (importData && importData.totalSuccess > 0) {
          toast.success(
            `Import thành công ${importData.totalSuccess} tiêu chí chung vào bộ tiêu chí mới!`
          );
          onSuccess();
        } else if (importData && importData.totalFailed > 0) {
          toast.warning(
            `Có ${importData.totalFailed} dòng bị lỗi khi import.`
          );
        } else {
          toast.info(res.message || "Hoàn tất import.");
          onSuccess();
        }
      } else {
        toast.error(res.message || "Import thất bại");
      }
    } catch (error: any) {
      toast.error(
        typeof error === "string" ? error : "Lỗi kết nối khi import Excel"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadOriginalFile = () => {
    if (fileList.length > 0) {
      const file = (fileList[0].originFileObj || fileList[0]) as File;
      if (file && file instanceof File) {
        const url = URL.createObjectURL(file);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Original_" + file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }
  };

  const errorColumns = [
    {
      title: "Dòng",
      dataIndex: "row",
      key: "row",
      width: 80,
      align: "center" as const,
    },
    {
      title: "STT / Tiêu chí",
      dataIndex: "tenNhom",
      key: "tenNhom",
    },
    {
      title: "Lý do thất bại",
      dataIndex: "reason",
      key: "reason",
      render: (text: string) => <Text type="danger">{text}</Text>,
    },
  ];

  return (
    <Modal
      title="Import Dữ Liệu Bộ Tiêu Chí Chung (Phụ lục 2 - 30 điểm)"
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Button key="close" onClick={onClose} disabled={submitting}>
          Đóng
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={submitting}
          onClick={() => form.submit()}
          disabled={fileList.length === 0}
          style={{ backgroundColor: "#0355a2", borderColor: "#0355a2", color: "#ffffff" }}
        >
          Thực hiện Import
        </Button>,
      ]}
      width={750}
      destroyOnClose
    >
      <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-200 mb-3">
        <div className="text-xs text-blue-800">
          <span className="font-semibold block text-sm mb-1">Mẫu cấu trúc Excel chuẩn Phụ lục 02:</span>
          Hỗ trợ 4 cột: <b>STT</b> (I, II, III / 1, 2 / 1.1, 1.2...) | <b>Tiêu chí chấm điểm</b> | <b>Điểm tối đa</b> | <b>Điểm tự chấm</b>
        </div>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          loading={downloadingTemplate}
          onClick={handleDownloadTemplate}
          style={{ backgroundColor: "#0355a2", borderColor: "#0355a2", color: "#ffffff", fontWeight: 500 }}
        >
          Tải file mẫu Excel
        </Button>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleImport}
        initialValues={{
          tenMode: "excel",
          quyetDinhMode: "excel",
          RowName: 1,
          RowInfo: 2,
          RowStart: 5,
        }}
      >
        <div className="flex flex-col gap-4">
          <div>
            <span className="font-medium mb-1 block">
              Chọn file Excel cần import:
            </span>
            <Upload.Dragger
              name="file"
              multiple={false}
              fileList={fileList}
              beforeUpload={handleBeforeUpload as any}
              onRemove={handleRemove}
              accept=".xlsx, .xls"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined style={{ color: "#1890ff" }} />
              </p>
              <p className="ant-upload-text">
                Nhấn hoặc kéo thả file Excel vào đây để tải lên
              </p>
              <p className="ant-upload-hint">Chỉ hỗ trợ định dạng .xlsx, .xls</p>
            </Upload.Dragger>
            {checkingFile && (
              <div className="mt-2 text-blue-500 italic text-sm">
                Đang kiểm tra dữ liệu file...
              </div>
            )}

            {worksheetList.length > 0 && (
              <div className="mt-4">
                <Form.Item
                  label="Vui lòng chọn Worksheet để import:"
                  name="WorkSheetName"
                  rules={[{ required: true, message: "Vui lòng chọn Worksheet" }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="Chọn Worksheet..."
                    options={worksheetList.map((ws) => ({ label: ws, value: ws }))}
                    onChange={(val) => {
                      if (fileList.length > 0) {
                        const currentFile = (fileList[0].originFileObj || fileList[0]) as File;
                        loadHeaderInfo(currentFile, val);
                      }
                    }}
                  />
                </Form.Item>
              </div>
            )}

            {headerData && (
              <div className="mt-3 bg-indigo-50 p-3 rounded border border-indigo-200">
                <div className="text-sm text-indigo-900">
                  Phát hiện dòng tiêu đề bảng: <b>Dòng {headerData.startRow}</b>. Dòng bắt đầu dữ liệu tiêu chí: <b>Dòng {headerData.dataStartRow}</b>.
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-3 rounded border border-gray-200">
            <Form.Item
              label="Đơn vị áp dụng (Tuỳ chọn - để trống nếu áp dụng chung cho toàn cơ quan)"
              name="IdDonVi"
              className="mb-0"
            >
              <Select
                placeholder="-- Áp dụng chung cho toàn bộ cơ quan / Bộ --"
                allowClear
                options={donViList}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toString()
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </div>

          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-blue-900">
                2. Cấu hình Tên Bộ Tiêu Chí:
              </span>
              <Form.Item name="tenMode" className="mb-0">
                <Radio.Group optionType="button" buttonStyle="solid" size="small">
                  <Radio.Button value="excel">Lấy từ file Excel</Radio.Button>
                  <Radio.Button value="manual">Nhập tay</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </div>
            {tenMode === "excel" ? (
              <Form.Item
                label="Dòng chứa tên Bộ Tiêu Chí trong Excel"
                name="RowName"
                className="mb-0"
              >
                <InputNumber min={1} max={100} className="w-full" />
              </Form.Item>
            ) : (
              <Form.Item
                label="Tên Bộ Tiêu Chí Chung"
                name="TenBoTieuChiDonVi"
                rules={[
                  {
                    required: tenMode === "manual",
                    message: "Vui lòng nhập tên bộ tiêu chí",
                  },
                ]}
                className="mb-0"
              >
                <Input placeholder="Ví dụ: Bộ tiêu chí chung đánh giá chất lượng công chức hằng quý..." />
              </Form.Item>
            )}
          </div>

          <div className="bg-amber-50 p-3 rounded border border-amber-200">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-amber-900">
                3. Cấu hình Số Quyết Định & Ngày Quyết Định:
              </span>
              <Form.Item name="quyetDinhMode" className="mb-0">
                <Radio.Group optionType="button" buttonStyle="solid" size="small">
                  <Radio.Button value="excel">
                    Lấy từ file Excel (dòng thông tin)
                  </Radio.Button>
                  <Radio.Button value="manual">Nhập tay</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </div>
            {quyetDinhMode === "excel" ? (
              <Form.Item
                label="Dòng chứa thông tin Quyết định trong Excel (Hệ thống tự bóc tách số & ngày)"
                name="RowInfo"
                className="mb-0"
              >
                <InputNumber min={1} max={100} className="w-full" />
              </Form.Item>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  label="Số Quyết Định"
                  name="SoQuyetDinh"
                  rules={[
                    {
                      required: quyetDinhMode === "manual",
                      message: "Vui lòng nhập số quyết định",
                    },
                  ]}
                  className="mb-0"
                >
                  <Input placeholder="Ví dụ: 392/QĐ-BDTTG..." />
                </Form.Item>
                <Form.Item
                  label="Ngày Quyết Định"
                  name="NgayQuyetDinh"
                  rules={[
                    {
                      required: quyetDinhMode === "manual",
                      message: "Vui lòng chọn ngày quyết định",
                    },
                  ]}
                  className="mb-0"
                >
                  <DatePicker format="DD/MM/YYYY" className="w-full" />
                </Form.Item>
              </div>
            )}
          </div>

          <div className="bg-gray-100 p-3 rounded border border-gray-200 flex flex-wrap items-center gap-3">
            <span className="font-medium text-gray-800 whitespace-nowrap">
              4. Dòng bắt đầu đọc dữ liệu tiêu chí:
            </span>
            <Form.Item name="RowStart" className="mb-0">
              <InputNumber min={1} max={1000} style={{ width: 100 }} />
            </Form.Item>
            <span className="text-xs text-gray-500 whitespace-nowrap">(Mặc định: 5)</span>
          </div>

          {importResult && (
            <Space direction="vertical" style={{ width: "100%" }}>
              <Alert
                message="Kết quả Import"
                description={
                  <div>
                    <div>
                      Thành công: <b>{importResult.totalSuccess || 0}</b> tiêu chí.
                    </div>
                    <div>
                      Thất bại: <b>{importResult.totalFailed || 0}</b> dòng.
                    </div>
                  </div>
                }
                type={(importResult.totalFailed || 0) > 0 ? "warning" : "success"}
                showIcon
              />

              {(importResult.totalFailed || 0) > 0 && importResult.lstFalse && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-red-600">
                      Danh sách dòng lỗi ({importResult.lstFalse.length}):
                    </span>
                    <Button
                      type="primary"
                      size="small"
                      icon={<DownloadOutlined />}
                      onClick={handleDownloadOriginalFile}
                    >
                      Tải file gốc
                    </Button>
                  </div>
                  <Table
                    columns={errorColumns}
                    dataSource={importResult.lstFalse}
                    rowKey={(record: any, idx) => `${record.row}_${idx}`}
                    pagination={{ pageSize: 5 }}
                    size="small"
                    bordered
                  />
                </div>
              )}
            </Space>
          )}
        </div>
      </Form>
    </Modal>
  );
};

export default KPI_BoTieuChiChungImportModal;
