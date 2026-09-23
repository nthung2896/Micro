import React, { useEffect, useState } from "react";
import {
  Form,
  FormProps,
  Input,
  Select,
  DatePicker,
  Button,
  Card,
  message,
  Row,
  Col,
  Spin,
  Space,
  Affix,
  Flex,
} from "antd";
import { PhanAnhNenTangRequestType } from "@/types/phan-anh-nen-tang/request";
import phanAnhNenTangService from "@/services/phanAnhNenTang/phanAnhNenTang.service";
import fileServerService from "@/libs/file-uploader/fileServer.service";
import SingleFileUploader from "@/components/upload-file/SingleFileUploader";
import FileUploader from "@/components/upload-file/FileUploader";
import { PhanAnhNenTangType } from "@/types/phan-anh-nen-tang/dto";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";
import dayjs from "dayjs";
import { ArrowLeftOutlined, SaveOutlined, UndoOutlined } from "@ant-design/icons";
import { Dictionary, DropdownOption } from "@/types/general";
import { useSelector } from "@/store/hooks";

const { TextArea } = Input;

const sectionBoxStyle: React.CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "24px",
  backgroundColor: "#f8fafc",
  marginBottom: "24px",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: 700,
  color: "#1e3a8a",
  marginBottom: "20px",
  display: "block",
};

// Hàm sinh GUID ngẫu nhiên cho ItemId liên kết tài liệu đính kèm
const generateGuid = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

interface Props {
  id?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const PhanAnhNenTangCreateOrUpdate: React.FC<Props> = (props: Props) => {
  const [form] = Form.useForm<PhanAnhNenTangRequestType>();
  const currentUser = useSelector((state) => state.auth.User);
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [item, setItem] = useState<PhanAnhNenTangType | null>(null);

  // Khởi tạo ItemId đồng bộ để tránh bất đồng bộ khi mount uploader
  const [formItemId] = useState<string>(() => props.id || generateGuid());

  // Quản lý file upload qua SingleFileUploader (cho CCCD) và FileUploader (cho nhiều file)
  const [cccdFile, setCccdFile] = useState<TaiLieuDinhKemType | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");

  const docUploader = FileUploader.useFileUploader({
    maxCount: 10,
    category: "PhanAnhNenTang",
    itemId: formItemId,
    FileType: "TepDinhKem",
  });

  // State dropdown
  const [dropdowns, setDropdowns] = useState<Dictionary<DropdownOption[]>>({});
  const [loadingDropdown, setLoadingDropdown] = useState(false);

  useEffect(() => {
    const fetchDropdowns = async () => {
      setLoadingDropdown(true);
      try {
        const res = await phanAnhNenTangService.getDropdowns();
        if (res.status) {
          setDropdowns(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingDropdown(false);
      }
    };

    fetchDropdowns();
  }, []);

  useEffect(() => {
    const fetchDetail = async () => {
      if (props.id) {
        setLoadingData(true);
        try {
          const res = await phanAnhNenTangService.get(props.id);
          if (res.status && res.data) {
            setItem(res.data);
            form.setFieldsValue({
              ...res.data,
              ngaySinh: res.data.ngaySinh ? (dayjs(res.data.ngaySinh) as any) : undefined,
              ngayCap: res.data.ngayCap ? (dayjs(res.data.ngayCap) as any) : undefined,
            });

            // Lấy tệp ảnh CCCD từ FileServer
            try {
              const fileCccd = await fileServerService.getLatestByItemId(props.id, "AnhCCCD");
              setCccdFile(fileCccd);
              if (fileCccd) {
                setUploadedImageUrl(fileCccd.duongDanFile);
              }
            } catch (err) {
              console.error("Không lấy được ảnh CCCD:", err);
            }

            // Tải danh sách tệp đính kèm bằng docUploader
            await docUploader.setFilesByItemId(props.id, "TepDinhKem");
          } else {
            message.error(res.message || "Không thể tải dữ liệu phản ánh");
          }
        } catch (e) {
          console.error(e);
          message.error("Lỗi khi tải chi tiết phản ánh");
        } finally {
          setLoadingData(false);
        }
      } else {
        setItem(null);
        form.resetFields();
        setCccdFile(null);
        setUploadedImageUrl("");
        docUploader.resetFiles();

        if (currentUser) {
          form.setFieldsValue({
            hoTen: currentUser.name || "",
            soDienThoai: currentUser.phoneNumber || "",
            email: currentUser.email || "",
            soCCCD: currentUser.cCCD || "",
            diaChiThuongTru: currentUser.diaChi || "",
            ngaySinh: currentUser.ngaySinh ? (dayjs(currentUser.ngaySinh) as any) : undefined,
          });
        }
      }
    };

    fetchDetail();
  }, [props.id, form, currentUser]);

  const handleOnFinish: FormProps<PhanAnhNenTangRequestType>["onFinish"] = async (
    formData: PhanAnhNenTangRequestType
  ) => {
    if (props.id && !uploadedImageUrl) {
      message.error("Vui lòng tải lên Ảnh CMND/CCCD/Passport!");
      return;
    }

    setSubmitting(true);
    try {
      const submitData: any = {
        ...formData,
        id: formItemId,
        isCVTao: true, // Chuyên viên tạo bản ghi trong quản trị
        trangThai: props.id ? item?.trangThai ?? formData.trangThai : 0, // Thêm mới mặc định là 0
        ngaySinh: formData.ngaySinh ? dayjs(formData.ngaySinh).format("YYYY-MM-DDTHH:mm:ss") : undefined,
        ngayCap: formData.ngayCap ? dayjs(formData.ngayCap).format("YYYY-MM-DDTHH:mm:ss") : undefined,
        tepDinhKem: docUploader.files.map((f) => f.tenTaiLieu).join(", "),
      };

      if (!props.id && currentUser) {
        submitData.hoTen = currentUser.name || "";
        submitData.soDienThoai = currentUser.phoneNumber || "";
        submitData.email = currentUser.email || "";
        submitData.soCCCD = currentUser.cCCD || "";
        submitData.diaChiThuongTru = currentUser.diaChi || "";
        submitData.ngaySinh = currentUser.ngaySinh ? dayjs(currentUser.ngaySinh).format("YYYY-MM-DDTHH:mm:ss") : undefined;
        submitData.ngayCap = dayjs().format("YYYY-MM-DDTHH:mm:ss");
        submitData.noiCap = "Cục Cảnh sát QLHC về trật tự xã hội";
      }

      if (props.id) {
        const response = await phanAnhNenTangService.update(submitData);
        if (response.status) {
          message.success("Chỉnh sửa thành công");
          form.resetFields();
          props.onSuccess();
        } else {
          message.error(response.message || "Chỉnh sửa thất bại");
        }
      } else {
        const response = await phanAnhNenTangService.create(submitData);
        if (response.status) {
          message.success("Thêm mới thành công");
          form.resetFields();
          props.onSuccess();
        } else {
          message.error(response.message || "Thêm mới thất bại");
        }
      }
    } catch (e) {
      console.error(e);
      message.error("Đã xảy ra lỗi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card
      title={
        <span style={{ fontSize: "16px", fontWeight: 700, color: "#1e3a8a" }}>
          📂 {props.id ? "Cập nhật phản ánh nền tảng" : "Thêm mới phản ánh nền tảng"}
        </span>
      }
      extra={
        <Affix offsetTop={80}>
          <Flex style={{ gap: 12 }}>
            <Button size="large" type="default" icon={<ArrowLeftOutlined />} onClick={props.onClose}>
              Quay lại danh sách
            </Button>
            <Button
              size="large"
              icon={<UndoOutlined />}
              onClick={() => {
                form.resetFields();
                if (!props.id) {
                  setCccdFile(null);
                  setUploadedImageUrl("");
                  docUploader.resetFiles();
                  if (currentUser) {
                    form.setFieldsValue({
                      hoTen: currentUser.name || "",
                      soDienThoai: currentUser.phoneNumber || "",
                      email: currentUser.email || "",
                      soCCCD: currentUser.cCCD || "",
                      diaChiThuongTru: currentUser.diaChi || "",
                      ngaySinh: currentUser.ngaySinh ? (dayjs(currentUser.ngaySinh) as any) : undefined,
                    });
                  }
                }
              }}
              disabled={submitting}
            >
              Hủy bỏ
            </Button>
            <Button
              size="large"
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => form.submit()}
              loading={submitting}
              style={{ backgroundColor: "#0143DF", borderColor: "#0143DF" }}
            >
              Xác nhận
            </Button>
          </Flex>
        </Affix>
      }
      style={{ borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.03)" }}
    >
      <Form
        layout="vertical"
        form={form}
        name="formCreateUpdatePhanAnh"
        onFinish={handleOnFinish}
        autoComplete="off"
      >
        {/* KHỐI 1: THÔNG TIN NGƯỜI PHẢN ÁNH */}
        {props.id && (
          <div style={sectionBoxStyle}>
            <span style={sectionTitleStyle}>1. Thông tin người phản ánh</span>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item<PhanAnhNenTangRequestType>
                  label="Họ tên"
                  name="hoTen"
                  rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
                >
                  <Input placeholder="Nhập họ tên..." className="rounded border-gray-300" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item<PhanAnhNenTangRequestType>
                  label="Số điện thoại"
                  name="soDienThoai"
                  rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại!" },
                    { pattern: /^[0-9]{9,11}$/, message: "Số điện thoại không hợp lệ!" }
                  ]}
                >
                  <Input placeholder="Nhập số điện thoại..." className="rounded border-gray-300" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item<PhanAnhNenTangRequestType>
                  label="Ngày sinh"
                  name="ngaySinh"
                  rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    placeholder="Chọn ngày sinh"
                    format="DD/MM/YYYY"
                    className="rounded border-gray-300"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item<PhanAnhNenTangRequestType>
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email!" },
                    { type: "email", message: "Email không đúng định dạng!" }
                  ]}
                >
                  <Input placeholder="Nhập địa chỉ email..." className="rounded border-gray-300" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item<PhanAnhNenTangRequestType>
                  label="Số CCCD/Passport"
                  name="soCCCD"
                  rules={[
                    { required: true, message: "Vui lòng nhập số CCCD/Passport!" },
                    { min: 8, message: "Số CCCD/Passport không hợp lệ!" },
                    { max: 12, message: "Số CCCD/Passport không hợp lệ!" }
                  ]}
                >
                  <Input placeholder="Nhập số CCCD/Passport..." className="rounded border-gray-300" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Ảnh CCCD/Passport"
                  required
                >
                  <SingleFileUploader
                    value={cccdFile}
                    onChange={(f) => {
                      setCccdFile(f);
                      setUploadedImageUrl(f ? f.duongDanFile : "");
                    }}
                    category="PhanAnhNenTang"
                    itemId={formItemId}
                    loaiTaiLieu="AnhCCCD"
                    accept=".png,.jpg,.jpeg"
                    typeBtn="primary"
                    uploadLabel="Tải lên tài liệu"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item<PhanAnhNenTangRequestType>
                  label="Ngày cấp"
                  name="ngayCap"
                  rules={[{ required: true, message: "Vui lòng chọn ngày cấp!" }]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    placeholder="Chọn ngày cấp"
                    format="DD/MM/YYYY"
                    className="rounded border-gray-300"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item<PhanAnhNenTangRequestType>
                  label="Nơi cấp"
                  name="noiCap"
                  rules={[{ required: true, message: "Vui lòng nhập nơi cấp!" }]}
                >
                  <Input placeholder="Nhập nơi cấp..." className="rounded border-gray-300" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item<PhanAnhNenTangRequestType>
                  label="Địa chỉ thường trú"
                  name="diaChiThuongTru"
                  rules={[{ required: true, message: "Vui lòng nhập địa chỉ thường trú!" }]}
                >
                  <Input placeholder="Nhập địa chỉ thường trú..." className="rounded border-gray-300" />
                </Form.Item>
              </Col>
            </Row>
          </div>
        )}

        {/* KHỐI 2: THÔNG TIN NỀN TẢNG, ỨNG DỤNG BỊ PHẢN ÁNH */}
        <div style={sectionBoxStyle}>
          <span style={sectionTitleStyle}>
            {props.id ? "2. Thông tin nền tảng, ứng dụng bị phản ánh" : "Thông tin nền tảng, ứng dụng bị phản ánh"}
          </span>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item<PhanAnhNenTangRequestType>
                label="Loại phản ánh"
                name="loaiPhanAnhId"
              >
                <Select
                  placeholder="--Chọn loại phản ánh--"
                  loading={loadingDropdown}
                  options={dropdowns['LoaiPhanAnh']}
                  className="rounded"
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item<PhanAnhNenTangRequestType>
                label="Tỉnh/Thành phố"
                name="maTinh"
                rules={[{ required: true, message: "Vui lòng chọn Tỉnh/Thành phố!" }]}
              >
                <Select
                  placeholder="--Chọn tỉnh thành--"
                  options={dropdowns['Tinh']}
                  showSearch
                  optionFilterProp="label"
                  className="rounded"
                  allowClear
                />
              </Form.Item>
            </Col>

          </Row>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item<PhanAnhNenTangRequestType>
                label="Tên nền tảng"
                name="tenNenTang"
                rules={[{ required: true, message: "Vui lòng nhập tên nền tảng!" }]}
              >
                <Input placeholder="Nhập tên nền tảng..." className="rounded border-gray-300" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item<PhanAnhNenTangRequestType>
                label="Địa chỉ nền tảng"
                name="diaChiNenTang"
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ nền tảng!" }]}
              >
                <Input placeholder="Nhập địa chỉ nền tảng (URL trang web hoặc tên miền)..." className="rounded border-gray-300" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item<PhanAnhNenTangRequestType>
                label="Tên ứng dụng"
                name="tenUngDung"
              >
                <Input placeholder="Nhập tên ứng dụng..." className="rounded border-gray-300" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item<PhanAnhNenTangRequestType>
                label="Liên kết tải ứng dụng"
                name="lienKetTaiUngDung"
              >
                <Input placeholder="Nhập liên kết tải ứng dụng..." className="rounded border-gray-300" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item<PhanAnhNenTangRequestType>
                label="Tệp đính kèm"
                name="tepDinhKem"
              >
                <FileUploader
                  controller={docUploader}
                  typeBtn="primary"
                  uploadLabel="Tải lên tài liệu"
                />
              </Form.Item>
            </Col>

          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item<PhanAnhNenTangRequestType>
                label="Nội dung phản ánh"
                name="noiDungPhanAnh"
                rules={[
                  { required: true, message: "Vui lòng nhập nội dung phản ánh!" },
                  { min: 10, message: "Nội dung phản ánh quá ngắn!" }
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Nhập nội dung chi tiết của phản ánh..."
                  className="rounded border-gray-300"
                />
              </Form.Item>
            </Col>
          </Row>
        </div>
      </Form>
    </Card>
  );
};

export default PhanAnhNenTangCreateOrUpdate;
