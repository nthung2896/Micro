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
  Space,
  Affix,
  Flex,
  Switch,
} from "antd";
import { NenTangViPhamRequestType } from "@/types/nen-tang-vi-pham/request";
import nenTangViPhamService from "@/services/nenTangViPham/nenTangViPham.service";
import { NenTangViPhamType } from "@/types/nen-tang-vi-pham/dto";
import dayjs from "dayjs";
import { ArrowLeftOutlined, SaveOutlined, UndoOutlined } from "@ant-design/icons";
import { Dictionary, DropdownOption } from "@/types/general";
import platformManageService from "@/services/platformManage/platformManage.service";

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

interface Props {
  id?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const NenTangViPhamCreateOrUpdate: React.FC<Props> = (props: Props) => {
  const [form] = Form.useForm<NenTangViPhamRequestType>();
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [item, setItem] = useState<NenTangViPhamType | null>(null);

  // Dropdowns state
  const [dropdowns, setDropdowns] = useState<Dictionary<DropdownOption[]>>({});
  const [loadingDropdown, setLoadingDropdown] = useState(false);
  const [nenTangOptions, setNenTangOptions] = useState<any[]>([]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      setLoadingDropdown(true);
      try {
        const res = await nenTangViPhamService.getDropdowns();
        if (res.status && res.data) {
          setDropdowns(res.data);
        }
      } catch (e) {
        console.error("Lỗi tải danh mục:", e);
      } finally {
        setLoadingDropdown(false);
      }
    };

    const fetchNenTangs = async () => {
      try {
        const res = await platformManageService.getData({
          pageIndex: 1,
          pageSize: 1000,
          query: "",
        } as any);
        if (res.status && res.data?.items) {
          setNenTangOptions(res.data.items.map((x: any) => ({
            label: x.name ? `${x.name} (${x.domain || x.appOS || ""})` : x.domain || "Nền tảng",
            value: x.id,
          })));
        }
      } catch (e) {
        console.error("Lỗi tải nền tảng liên kết:", e);
      }
    };

    fetchDropdowns();
    fetchNenTangs();
  }, []);

  useEffect(() => {
    const fetchDetail = async () => {
      if (props.id) {
        setLoadingData(true);
        try {
          const res = await nenTangViPhamService.get(props.id);
          if (res.status && res.data) {
            setItem(res.data);
            form.setFieldsValue({
              ...res.data,
              ngayBatDau: res.data.ngayBatDau ? (dayjs(res.data.ngayBatDau) as any) : undefined,
              ngayKetThuc: res.data.ngayKetThuc ? (dayjs(res.data.ngayKetThuc) as any) : undefined,
            });
          } else {
            message.error(res.message || "Không thể tải thông tin nền tảng");
          }
        } catch (e) {
          console.error(e);
          message.error("Lỗi khi tải chi tiết nền tảng");
        } finally {
          setLoadingData(false);
        }
      } else {
        setItem(null);
        form.resetFields();
        form.setFieldsValue({ isHienThi: true }); // Default to true on create
      }
    };

    fetchDetail();
  }, [props.id, form]);

  const handleOnFinish: FormProps<NenTangViPhamRequestType>["onFinish"] = async (
    formData: NenTangViPhamRequestType
  ) => {
    setSubmitting(true);
    try {
      const submitData = {
        ...formData,
        id: props.id || undefined,
        ngayBatDau: formData.ngayBatDau ? dayjs(formData.ngayBatDau).format("YYYY-MM-DDTHH:mm:ss") : undefined,
        ngayKetThuc: formData.ngayKetThuc ? dayjs(formData.ngayKetThuc).format("YYYY-MM-DDTHH:mm:ss") : undefined,
        isHienThi: formData.isHienThi ?? false,
      };

      if (props.id) {
        const response = await nenTangViPhamService.update(submitData);
        if (response.status) {
          message.success("Cập nhật nền tảng vi phạm thành công");
          form.resetFields();
          props.onSuccess();
        } else {
          message.error(response.message || "Cập nhật thất bại");
        }
      } else {
        const response = await nenTangViPhamService.create(submitData);
        if (response.status) {
          message.success("Thêm mới nền tảng vi phạm thành công");
          form.resetFields();
          props.onSuccess();
        } else {
          message.error(response.message || "Thêm mới thất bại");
        }
      }
    } catch (e) {
      console.error(e);
      message.error("Đã xảy ra lỗi khi lưu thông tin");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card
      title={
        <span style={{ fontSize: "16px", fontWeight: 700, color: "#1e3a8a" }}>
          📂 {props.id ? "Cập nhật nền tảng vi phạm" : "Thêm mới nền tảng vi phạm"}
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
                if (item) {
                  form.setFieldsValue({
                    ...item,
                    ngayBatDau: item.ngayBatDau ? (dayjs(item.ngayBatDau) as any) : undefined,
                    ngayKetThuc: item.ngayKetThuc ? (dayjs(item.ngayKetThuc) as any) : undefined,
                  });
                } else {
                  form.setFieldsValue({ isHienThi: true });
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
        name="formCreateUpdateNenTangViPham"
        onFinish={handleOnFinish}
        autoComplete="off"
      >
        <div style={sectionBoxStyle}>
          <span style={sectionTitleStyle}>Thông tin nền tảng, ứng dụng vi phạm</span>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item<NenTangViPhamRequestType>
                label="Tên nền tảng"
                name="tenNenTang"
                rules={[{ required: true, message: "Vui lòng nhập tên nền tảng!" }]}
              >
                <Input placeholder="Ví dụ: Facebook, TikTok, Website..." className="rounded border-gray-300" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item<NenTangViPhamRequestType>
                label="Tên ứng dụng"
                name="tenUngDung"
              >
                <Input placeholder="Nhập tên ứng dụng nếu có..." className="rounded border-gray-300" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item<NenTangViPhamRequestType>
                label="Nguồn vi phạm"
                name="nguonId"
              >
                <Select
                  placeholder="--Chọn nguồn vi phạm--"
                  loading={loadingDropdown}
                  options={dropdowns['NguonViPham'] || []}
                  className="rounded"
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item<NenTangViPhamRequestType>
                label="Loại vi phạm"
                name="loaiViPhamId"
              >
                <Select
                  placeholder="--Chọn loại vi phạm--"
                  loading={loadingDropdown}
                  options={dropdowns['LoaiViPham'] || []}
                  className="rounded"
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={24}>
              <Form.Item<NenTangViPhamRequestType>
                label="Nền tảng liên kết"
                name="nenTangLienKetId"
              >
                <Select
                  placeholder="--Chọn nền tảng liên kết--"
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                  }
                  options={nenTangOptions}
                  className="rounded"
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} md={8}>
              <Form.Item<NenTangViPhamRequestType>
                label="Ngày bắt đầu"
                name="ngayBatDau"
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày bắt đầu"
                  format="DD/MM/YYYY"
                  className="rounded border-gray-300"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item<NenTangViPhamRequestType>
                label="Ngày kết thúc"
                name="ngayKetThuc"
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày kết thúc"
                  format="DD/MM/YYYY"
                  className="rounded border-gray-300"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item<NenTangViPhamRequestType>
                label="Trạng thái hiển thị"
                name="isHienThi"
                valuePropName="checked"
              >
                <Switch checkedChildren="Hiển thị" unCheckedChildren="Ẩn" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={24}>
              <Form.Item<NenTangViPhamRequestType>
                label="Nội dung vi phạm"
                name="noiDung"
              >
                <TextArea
                  rows={4}
                  placeholder="Nhập nội dung chi tiết về hành vi hoặc dấu hiệu vi phạm..."
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

export default NenTangViPhamCreateOrUpdate;
