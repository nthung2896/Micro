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
  Switch,
  Tag,
} from "antd";
import {
  InboxOutlined,
  UploadOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { toast } from "react-toastify";
import departmentService from "@/services/department/department.service";
import kPI_NhomTieuChiService from "@/services/kPI_NhomTieuChi/kPI_NhomTieuChiService";
import kPI_DotTheoDoiDanhGiaService from "@/services/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGiaService";
import { DropdownOption } from "@/types/general";
import {
  ImportResponseType,
  KPI_BoTieuChiDonViImportVMType,
} from "@/types/kPI_NhomTieuChi/kPI_NhomTieuChi";
import dayjs from "dayjs";

const { Text } = Typography;

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialFile?: File | null;
}

const KPI_BoTieuChiDonViImportModalV2: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialFile,
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [donViList, setDonViList] = useState<DropdownOption[]>([]);
  const [dotDanhGiaList, setDotDanhGiaList] = useState<DropdownOption[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResponseType | null>(
    null
  );
  const [worksheetList, setWorksheetList] = useState<string[]>([]);
  const [checkingFile, setCheckingFile] = useState(false);
  const [headerData, setHeaderData] = useState<any>(null);

  const tenMode = Form.useWatch("tenMode", form) || "excel";
  const quyetDinhMode = Form.useWatch("quyetDinhMode", form) || "excel";
  const totalColumns = Form.useWatch("TotalColumns", form) || 7;

  useEffect(() => {
    const fetchDonVi = async () => {
      try {
        const res = await departmentService.getDropdownTrucThuocBTC();
        if (res?.data) {
          setDonViList(res.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách Đơn vị", error);
      }
    };
    const fetchDotDanhGia = async () => {
      try {
        const res = await kPI_DotTheoDoiDanhGiaService.getListDotDanhGiaDropdown();
        setDotDanhGiaList(res || []);
      } catch (error) {
        console.error("Lỗi khi tải danh sách Đợt đánh giá", error);
      }
    };
    if (isOpen) {
      fetchDonVi();
      fetchDotDanhGia();
    }
  }, [isOpen]);

  const loadHeaderInfo = async (fileToUse: File, sheetName: string) => {
    setCheckingFile(true);
    try {
      const res = await kPI_NhomTieuChiService.getHeaderWorksheet(fileToUse, sheetName);
      if (res.status && res.data) {
        setHeaderData(res.data);
        const rowStart = res.data.dataStartRow ? res.data.dataStartRow : (res.data.startRow ? res.data.startRow + 1 : 3);
        let totalCols = res.data.totalColumns;
        const headerNames = (res.data.headers || []).map((h: any) => (h.Name || "").toUpperCase());
        const isVp1917 = totalCols === 8 || headerNames.some((n: string) => n.includes("CÁC SẢN PHẨM") || (n.includes("NHIỆM VỤ") && headerNames.some((x: string) => x.includes("PHÂN NHÓM"))));
        const autoMode = isVp1917 ? "vp_1917" : (totalCols > 10 ? "14_cols" : (totalCols === 9 ? "tccb" : "van_phong_bo"));

        form.setFieldsValue({
          RowStart: rowStart,
          TotalColumns: totalCols,
          importMode: autoMode
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
        kPI_NhomTieuChiService.checkFileWorksheet(initialFile).then(res => {
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
    kPI_NhomTieuChiService.checkFileWorksheet(file)
      .then(res => {
        if (res.status && res.data && Array.isArray(res.data) && res.data.length > 0) {
          setWorksheetList(res.data);
          form.setFieldsValue({ WorkSheetName: res.data[0] });
          loadHeaderInfo(file, res.data[0]);
        }
      })
      .catch(e => {
        console.error("Lỗi khi kiểm tra worksheet", e);
        setCheckingFile(false);
      });

    return false;
  };

  const handleRemove = () => {
    setFileList([]);
    setImportResult(null);
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

    const payload: KPI_BoTieuChiDonViImportVMType = {
      IdDonVi: values.IdDonVi,
      RowStart: values.RowStart ?? 3,
      TotalColumns: values.importMode === "van_phong_bo" || values.importMode === "vp_1917" ? 8 : (values.importMode === "tccb" ? 9 : 7),
      WorkSheetName: values.WorkSheetName,
      StartCol: headerData?.startCol ?? 1,
      Headers: headerData?.headers ?? [],
      ImportMode: values.importMode,
    } as any;

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
      const isDirectOld = values.importMode === "standard";
      const res = isDirectOld
        ? await kPI_NhomTieuChiService.importExcelDirectV2(file, payload)
        : await kPI_NhomTieuChiService.importExcelVuDonViV2(file, payload);
      const data = (res as any)?.data ?? res;
      if (data?.listTrue !== undefined || res.status) {
        const importData: ImportResponseType =
          data?.listTrue !== undefined ? data : res.data;
        setImportResult(importData);
        if (importData && importData.totalSuccess > 0) {
          toast.success(
            `Import thành công ${importData.totalSuccess} nhóm tiêu chí!`
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
      render: (text: string) => <Text type="danger">{text}</Text>,
    },
  ];

  return (
    <Modal
      title="Import dữ liệu Nhóm Tiêu Chí KPI (1-N Bộ Tiêu Chí Đơn Vị) v2"
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
          style={{ color: "#ffffff", backgroundColor: "#217346", borderColor: "#217346" }}
        >
          Thực hiện Import v2
        </Button>,
      ]}
      width={780}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleImport}
        initialValues={{
          importMode: "tccb",
          tenMode: "excel",
          quyetDinhMode: "excel",
          RowName: 1,
          RowInfo: 2,
          RowStart: 3,
          TotalColumns: 9,
        }}
        style={{ marginTop: 12 }}
      >
        <div className="flex flex-col gap-4">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <Form.Item
              name="importMode"
              label={
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-sm">Chọn cấu trúc mẫu biểu Excel:</span>
                  <Tag color="green" className="font-semibold">V2 Hỗ trợ đa mẫu</Tag>
                </div>
              }
              rules={[{ required: true, message: "Vui lòng chọn cấu trúc mẫu biểu" }]}
              className="mb-0"
            >
              <Select
                size="large"
                placeholder="Chọn cấu trúc mẫu biểu..."
                options={[
                  {
                    value: "tccb",
                    label: (
                      <div className="flex items-center justify-between py-1">
                        <span className="font-semibold text-blue-700">1. Mẫu Vụ TCCB (9 Cột chuẩn)</span>
                        <span className="text-xs text-slate-400">STT → Nhiệm vụ → CV Chi tiết → Sản phẩm...</span>
                      </div>
                    ),
                  },
                  {
                    value: "van_phong_bo",
                    label: (
                      <div className="flex items-center justify-between py-1">
                        <span className="font-semibold text-emerald-700">2. Mẫu Văn phòng Bộ (8 Cột)</span>
                        <span className="text-xs text-slate-400">STT → Nhiệm vụ/SP → Sản phẩm đầu ra...</span>
                      </div>
                    ),
                  },
                  {
                    value: "vp_1917",
                    label: (
                      <div className="flex items-center justify-between py-1">
                        <span className="font-semibold text-purple-700">3. Mẫu Văn phòng 1917 (8 Cột - Phân cấp 1.1)</span>
                        <span className="text-xs text-slate-400">STT (1 → 1.1) → Nhiệm vụ/SP → Sản phẩm...</span>
                      </div>
                    ),
                  },
                  {
                    value: "standard",
                    label: (
                      <div className="flex items-center justify-between py-1">
                        <span className="font-semibold text-slate-700">4. Mẫu cũ (7 Cột)</span>
                        <span className="text-xs text-slate-400">Mẫu tiêu chí cơ bản 7 cột</span>
                      </div>
                    ),
                  },
                ]}
              />
            </Form.Item>
          </div>

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
                    options={worksheetList.map(ws => ({ label: ws, value: ws }))}
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
              <div className="mt-4 bg-indigo-50 p-3 rounded border border-indigo-200">
                <span className="font-medium text-indigo-900 mb-2 block">
                  Dữ liệu Header quét được từ file:
                </span>
                <div className="text-sm mb-2 text-indigo-800">
                  Tìm thấy chữ "STT" tại dòng: <b>{headerData.startRow}</b>,
                  cột: <b>{headerData.startCol}</b>.
                  Dòng bắt đầu dữ liệu (có số la mã I): <b>{headerData.dataStartRow}</b>.
                  Tổng số cột: <b>{headerData.totalColumns}</b>.
                </div>
                <div className="flex flex-wrap gap-2">
                  {headerData.headers && headerData.headers.map((h: any, idx: number) => (
                    <span key={idx} className="bg-white border border-indigo-300 text-indigo-700 px-2 py-1 rounded text-xs">
                      {h.name || `(Trống)`} (Dòng {h.row}, Cột {h.col})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 bg-gray-50 p-3 rounded border border-gray-200">
            <Form.Item
              label="Đơn vị áp dụng"
              name="IdDonVi"
              rules={[
                { required: true, message: "Vui lòng chọn đơn vị áp dụng" },
              ]}
              className="mb-0"
            >
              <Select
                placeholder="Chọn đơn vị áp dụng..."
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
                label="Tên Bộ Tiêu Chí Đơn Vị"
                name="TenBoTieuChiDonVi"
                rules={[
                  {
                    required: tenMode === "manual",
                    message: "Vui lòng nhập tên bộ tiêu chí",
                  },
                ]}
                className="mb-0"
              >
                <Input placeholder="Nhập tên bộ tiêu chí áp dụng cho đơn vị..." />
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
                  <Input placeholder="Ví dụ: 1234/QĐ-BTC..." />
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
              4. Dòng bắt đầu đọc dữ liệu:
            </span>
            <Form.Item name="RowStart" className="mb-0">
              <InputNumber min={1} max={1000} style={{ width: 100 }} />
            </Form.Item>
            <span className="text-xs text-gray-500 whitespace-nowrap">(Mặc định: 3)</span>

            <Form.Item name="TotalColumns" hidden>
              <InputNumber />
            </Form.Item>
          </div>

          {importResult && (
            <Space direction="vertical" style={{ width: "100%" }}>
              <Alert
                message="Kết quả Import"
                description={
                  <div>
                    <div>
                      Thành công: <b>{importResult.totalSuccess || 0}</b> bản ghi.
                    </div>
                    <div>
                      Thất bại: <b>{importResult.totalFailed || 0}</b> bản ghi.
                    </div>
                  </div>
                }
                type={
                  (importResult.totalFailed || 0) > 0 ? "warning" : "success"
                }
                showIcon
              />

              {(importResult.totalFailed || 0) > 0 &&
                importResult.lstFalse && (
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
                      rowKey={(record, idx) => `${record.row}_${idx}`}
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

export default KPI_BoTieuChiDonViImportModalV2;
