import React from "react";
import { Form, FormProps, Input, InputNumber, Modal, Row, Col } from "antd";
import { toast } from "react-toastify";
import {
  KPI_NhomTieuChiCreateOrUpdateType,
  KPI_NhomTieuChiType,
} from "@/types/kPI_NhomTieuChi/kPI_NhomTieuChi";
import kPI_NhomTieuChiService from "@/services/kPI_NhomTieuChi/kPI_NhomTieuChiService";

interface Props {
  item?: KPI_NhomTieuChiType | null;
  onClose: () => void;
  onSuccess: () => void;
}

const KPI_NhomTieuChiCreateOrUpdate: React.FC<Props> = (props: Props) => {
  const [form] = Form.useForm<KPI_NhomTieuChiCreateOrUpdateType>();

  const handleOnFinish: FormProps<KPI_NhomTieuChiCreateOrUpdateType>["onFinish"] =
    async (formData: KPI_NhomTieuChiCreateOrUpdateType) => {
      if (props.item) {
        const response = await kPI_NhomTieuChiService.update(formData);
        if (response.status) {
          toast.success("Chỉnh sửa thành công");
          form.resetFields();
          props.onSuccess();
          props.onClose();
        } else {
          toast.error(response.message);
        }
      } else {
        const response = await kPI_NhomTieuChiService.create(formData);
        if (response.status) {
          toast.success("Thêm mới thành công");
          form.resetFields();
          props.onSuccess();
          props.onClose();
        } else {
          toast.error(response.message);
        }
      }
    };

  const handleCancel = () => {
    form.resetFields();
    props.onClose();
  };

  React.useEffect(() => {
    if (props.item) {
      form.setFieldsValue({
        ...props.item,
      });
    } else {
      form.resetFields();
    }
  }, [form, props.item]);

  return (
    <Modal
      title={props.item != null ? "Chỉnh sửa nhóm tiêu chí" : "Thêm mới nhóm tiêu chí"}
      open={true}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      okText="Xác nhận"
      cancelText="Hủy"
      width={750}
    >
      <Form
        layout="vertical"
        form={form}
        name="formCreateUpdate"
        onFinish={handleOnFinish}
        autoComplete="off"
        style={{ marginTop: 16 }}
      >
        {props.item && (
          <Form.Item<KPI_NhomTieuChiCreateOrUpdateType> name="id" hidden>
            <Input />
          </Form.Item>
        )}
        <Form.Item<KPI_NhomTieuChiCreateOrUpdateType> name="idBoTieuChiDonVi" hidden>
          <Input />
        </Form.Item>

        <Row gutter={16}>
          <Col span={16}>
            <Form.Item<KPI_NhomTieuChiCreateOrUpdateType>
              label="Tên nhóm tiêu chí"
              name="tenNhomTieuChi"
              rules={[{ required: true, message: "Vui lòng nhập tên nhóm tiêu chí!" }]}
            >
              <Input placeholder="Nhập tên nhóm tiêu chí" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_NhomTieuChiCreateOrUpdateType>
              label="Phân nhóm"
              name="phanNhom"
            >
              <Input placeholder="Nhập phân nhóm" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item<KPI_NhomTieuChiCreateOrUpdateType>
              label="Công việc chi tiết"
              name="congViecChiTiet"
            >
              <Input.TextArea rows={3} placeholder="Nhập công việc chi tiết" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item<KPI_NhomTieuChiCreateOrUpdateType>
              label="Sản phẩm đầu ra"
              name="sanPhamDauRa"
            >
              <Input.TextArea rows={3} placeholder="Nhập sản phẩm đầu ra" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item<KPI_NhomTieuChiCreateOrUpdateType>
              label="Khung điểm tối đa"
              name="khungDiemToiDa"
            >
              <InputNumber style={{ width: "100%" }} placeholder="Khung điểm" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_NhomTieuChiCreateOrUpdateType>
              label="Điểm"
              name="diem"
            >
              <InputNumber style={{ width: "100%" }} placeholder="Điểm" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_NhomTieuChiCreateOrUpdateType>
              label="Hệ số quy đổi"
              name="heSoQuyDoi"
            >
              <InputNumber style={{ width: "100%" }} placeholder="Hệ số" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item<KPI_NhomTieuChiCreateOrUpdateType>
              label="Ghi chú"
              name="ghiChu"
            >
              <Input.TextArea rows={2} placeholder="Nhập ghi chú" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default KPI_NhomTieuChiCreateOrUpdate;
