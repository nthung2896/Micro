import React, { useEffect, useState } from "react";
import {
  Form,
  FormProps,
  Input,
  Select,
  Button,
  Card,
  message,
  Row,
  Col,
  Space,
  Affix,
  Flex,
  Spin,
} from "antd";
import { VuViecPhanAnhRequestType } from "@/types/vu-viec-phan-anh/request";
import vuViecPhanAnhService from "@/services/vuViecPhanAnh/vuViecPhanAnh.service";
import tinhService from "@/services/tinh/tinh.service";
import { VuViecPhanAnhType } from "@/types/vu-viec-phan-anh/dto";
import { ArrowLeftOutlined, SaveOutlined, UndoOutlined } from "@ant-design/icons";

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

const VuViecPhanAnhCreateOrUpdate: React.FC<Props> = (props: Props) => {
  const [form] = Form.useForm<VuViecPhanAnhRequestType>();
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [item, setItem] = useState<VuViecPhanAnhType | null>(null);
  const [tinhOptions, setTinhOptions] = useState<any[]>([]);

  useEffect(() => {
    const fetchTinh = async () => {
      try {
        const res = await tinhService.getData({ pageIndex: 1, pageSize: 200 });
        const items = (res as any)?.data?.items ?? (res as any)?.data ?? [];
        setTinhOptions(
          items.map((x: any) => ({
            label: x.tenDv ?? x.tenTinh ?? x.name,
            value: x.maTinh ?? x.code,
          }))
        );
      } catch (e) {
        console.error(e);
      }
    };
    fetchTinh();
  }, []);

  useEffect(() => {
    const fetchDetail = async () => {
      if (props.id) {
        setLoadingData(true);
        try {
          const res = await vuViecPhanAnhService.get(props.id);
          if (res.status && res.data) {
            setItem(res.data);
            form.setFieldsValue({
              ...res.data,
            });
          } else {
            message.error(res.message || "Không thể tải dữ liệu vụ việc");
          }
        } catch (e) {
          console.error(e);
          message.error("Lỗi khi tải chi tiết vụ việc");
        } finally {
          setLoadingData(false);
        }
      } else {
        setItem(null);
        form.resetFields();
      }
    };

    fetchDetail();
  }, [props.id, form]);

  const handleOnFinish: FormProps<VuViecPhanAnhRequestType>["onFinish"] = async (
    formData: VuViecPhanAnhRequestType
  ) => {
    setSubmitting(true);
    try {
      const submitData = {
        ...formData,
        id: props.id || undefined,
        trangThai: props.id ? item?.trangThai ?? formData.trangThai : 0,
      };

      if (props.id) {
        const response = await vuViecPhanAnhService.update(submitData);
        if (response.status) {
          message.success("Chỉnh sửa thành công");
          form.resetFields();
          props.onSuccess();
        } else {
          message.error(response.message || "Chỉnh sửa thất bại");
        }
      } else {
        const response = await vuViecPhanAnhService.create(submitData);
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
          📂 {props.id ? "Cập nhật vụ việc phản ánh" : "Thêm mới vụ việc phản ánh"}
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
      {loadingData ? (
        <div style={{ textAlign: "center", padding: "40px" }}><Spin size="large" /></div>
      ) : (
        <Form
          layout="vertical"
          form={form}
          name="formCreateUpdateVuViec"
          onFinish={handleOnFinish}
          autoComplete="off"
        >
          {/* KHỐI 1: THÔNG TIN NỀN TẢNG BỊ PHẢN ÁNH */}
          <div style={sectionBoxStyle}>
            <span style={sectionTitleStyle}>1. Thông tin nền tảng, ứng dụng bị phản ánh</span>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item<VuViecPhanAnhRequestType>
                  label="Tên nền tảng"
                  name="tenNenTang"
                  rules={[{ required: true, message: "Vui lòng nhập tên nền tảng!" }]}
                >
                  <Input placeholder="Nhập tên nền tảng..." className="rounded border-gray-300" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item<VuViecPhanAnhRequestType>
                  label="Tên ứng dụng"
                  name="tenUngDung"
                >
                  <Input placeholder="Nhập tên ứng dụng..." className="rounded border-gray-300" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item<VuViecPhanAnhRequestType>
                  label="Tỉnh/Thành phố"
                  name="maTinh"
                  rules={[{ required: true, message: "Vui lòng chọn Tỉnh/Thành phố!" }]}
                >
                  <Select
                    placeholder="--Chọn tỉnh thành--"
                    options={tinhOptions}
                    showSearch
                    optionFilterProp="label"
                    className="rounded"
                    allowClear
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* KHỐI 2: THÔNG TIN DOANH NGHIỆP / THƯƠNG NHÂN */}
          <div style={sectionBoxStyle}>
            <span style={sectionTitleStyle}>2. Thông tin doanh nghiệp, thương nhân chủ quản</span>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item<VuViecPhanAnhRequestType>
                  label="Tên doanh nghiệp / thương nhân"
                  name="tenThuongNhan"
                  rules={[{ required: true, message: "Vui lòng nhập tên thương nhân!" }]}
                >
                  <Input placeholder="Nhập tên doanh nghiệp..." className="rounded border-gray-300" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item<VuViecPhanAnhRequestType>
                  label="Mã số doanh nghiệp"
                  name="maSoDoanhNghiep"
                >
                  <Input placeholder="Nhập mã số doanh nghiệp..." className="rounded border-gray-300" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item<VuViecPhanAnhRequestType>
                  label="Số điện thoại liên hệ"
                  name="dienThoai"
                >
                  <Input placeholder="Nhập số điện thoại..." className="rounded border-gray-300" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item<VuViecPhanAnhRequestType>
                  label="Email liên hệ"
                  name="email"
                  rules={[{ type: "email", message: "Email không đúng định dạng!" }]}
                >
                  <Input placeholder="Nhập địa chỉ email..." className="rounded border-gray-300" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={24}>
                <Form.Item<VuViecPhanAnhRequestType>
                  label="Địa chỉ trụ sở"
                  name="diaChi"
                >
                  <Input placeholder="Nhập địa chỉ chi tiết..." className="rounded border-gray-300" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* KHỐI 3: TRẠNG THÁI VÀ KẾT LUẬN */}
          <div style={sectionBoxStyle}>
            <span style={sectionTitleStyle}>3. Kết quả xử lý</span>

            <Row gutter={24}>
              <Col xs={24} md={12}>
                <Form.Item<VuViecPhanAnhRequestType>
                  label="Trạng thái"
                  name="trangThai"
                  initialValue={0}
                >
                  <Select
                    placeholder="Chọn trạng thái"
                    options={[
                      { label: "Chưa xử lý", value: 0 },
                      { label: "Đang xử lý", value: 1 },
                      { label: "Đã xử lý", value: 2 },
                      { label: "Yêu cầu giải trình", value: 3 },
                      { label: "Đã giải trình", value: 4 },
                      { label: "Yêu cầu giải trình lại", value: 5 },
                    ]}
                    className="rounded"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item<VuViecPhanAnhRequestType>
                  label="Kết luận"
                  name="ketLuan"
                  initialValue={0}
                >
                  <Select
                    placeholder="Chọn kết luận"
                    options={[
                      { label: "Chưa kết luận", value: 0 },
                      { label: "Có vi phạm", value: 1 },
                      { label: "Không vi phạm", value: 2 },
                    ]}
                    className="rounded"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Form>
      )}
    </Card>
  );
};

export default VuViecPhanAnhCreateOrUpdate;
