import React from "react";
import { Form, FormProps, Input, Select, DatePicker, Drawer, Button, Space, Upload, Row, Col } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  KPI_VanBanDiCreateOrUpdateType,
  KPI_VanBanDiType,
} from "@/types/kPI_VanBanDi/kPI_VanBanDi";
import kPI_VanBanDiService from "@/services/kPI_VanBanDi/kPI_VanBanDiService";
import dayjs from "dayjs";

interface Props {
  item?: KPI_VanBanDiType | null;
  onClose: () => void;
  onSuccess: () => void;
}

const KPI_VanBanDiCreateOrUpdate: React.FC<Props> = (props: Props) => {
  const [form] = Form.useForm<KPI_VanBanDiCreateOrUpdateType>();
  
  const handleOnFinish: FormProps<KPI_VanBanDiCreateOrUpdateType>["onFinish"] =
    async (formData: KPI_VanBanDiCreateOrUpdateType) => {
      if (props.item) {
        const response = await kPI_VanBanDiService.update(formData);
        if (response.status) {
          toast.success("Chỉnh sửa thành công");
          form.resetFields();
          props.onSuccess();
          props.onClose();
        } else {
          toast.error(response.message);
        }
      } else {
        const response = await kPI_VanBanDiService.create(formData);
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
        hanXuLy: props.item.hanXuLy ? dayjs(props.item.hanXuLy) as any : undefined,
        ngayBanHanh: props.item.ngayBanHanh ? dayjs(props.item.ngayBanHanh) as any : undefined,
        ngayVanBan: props.item.ngayVanBan ? dayjs(props.item.ngayVanBan) as any : undefined,
      });
    }
  }, [form, props.item]);

  return (
    <Drawer
      title={
        props.item != null
          ? "Chỉnh sửa Văn Bản Đi"
          : "Thêm mới Văn Bản Đi"
      }
      placement="right"
      width="60%"
      onClose={handleCancel}
      open={true}
      extra={
        <Space>
          <Button onClick={handleCancel}>Đóng</Button>
          <Button type="primary" onClick={() => form.submit()}>
            Xác nhận
          </Button>
        </Space>
      }
    >
      <Form
        layout="vertical"
        form={form}
        name="formCreateUpdate"
        onFinish={handleOnFinish}
        autoComplete="off"
      >
        {props.item && (
          <Form.Item<KPI_VanBanDiCreateOrUpdateType> name="id" hidden>
            <Input />
          </Form.Item>
        )}
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item<KPI_VanBanDiCreateOrUpdateType>
              label="Số hiệu"
              name="soHieu"
              rules={[{ required: true, message: "Vui lòng nhập thông tin này!" }]}
            >
              <Input placeholder="Nhập số hiệu" className="w-full" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item<KPI_VanBanDiCreateOrUpdateType>
              label="Loại văn bản"
              name="loaiVanBan"
              rules={[{ required: true, message: "Vui lòng nhập thông tin này!" }]}
            >
              <Input placeholder="Nhập loại văn bản" className="w-full" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item<KPI_VanBanDiCreateOrUpdateType>
              label="Độ mật"
              name="doMat"
            >
              <Input placeholder="Nhập độ mật" className="w-full" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item<KPI_VanBanDiCreateOrUpdateType>
              label="Độ khẩn"
              name="doKhan"
            >
              <Input placeholder="Nhập độ khẩn" className="w-full" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item<KPI_VanBanDiCreateOrUpdateType>
          label="Trích yếu"
          name="trichYeu"
          rules={[{ required: true, message: "Vui lòng nhập thông tin này!" }]}
        >
          <Input.TextArea rows={3} placeholder="Nhập trích yếu văn bản" className="w-full" />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item<KPI_VanBanDiCreateOrUpdateType>
              label="Ngày ban hành"
              name="ngayBanHanh"
            >
              <DatePicker format="DD/MM/YYYY" className="w-full" placeholder="Chọn ngày ban hành" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item<KPI_VanBanDiCreateOrUpdateType>
              label="Hạn xử lý"
              name="hanXuLy"
            >
              <DatePicker format="DD/MM/YYYY" className="w-full" placeholder="Chọn hạn xử lý" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item<KPI_VanBanDiCreateOrUpdateType>
              label="Ngày văn bản"
              name="ngayVanBan"
            >
              <DatePicker format="DD/MM/YYYY" className="w-full" placeholder="Chọn ngày văn bản" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item<KPI_VanBanDiCreateOrUpdateType>
              label="Người soạn thảo"
              name="nguoiSoanThao"
            >
              <Input placeholder="Nhập người soạn thảo" className="w-full" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item<KPI_VanBanDiCreateOrUpdateType>
              label="Phòng ban (DepartmentId)"
              name="departmentId"
            >
              <Input placeholder="Nhập mã phòng ban" className="w-full" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item<KPI_VanBanDiCreateOrUpdateType>
              label="Trạng thái"
              name="trangThai"
            >
              <Input placeholder="Nhập trạng thái" className="w-full" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item<KPI_VanBanDiCreateOrUpdateType>
              label="Số bản"
              name="soBan"
            >
              <Input placeholder="Nhập số bản" className="w-full" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_VanBanDiCreateOrUpdateType>
              label="Số đi"
              name="soDi"
            >
              <Input placeholder="Nhập số đi" className="w-full" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<KPI_VanBanDiCreateOrUpdateType>
              label="Is Cấp Số"
              name="isCapSo"
            >
              <Input placeholder="Có cấp số hay không?" className="w-full" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item<KPI_VanBanDiCreateOrUpdateType>
          label="Ghi chú"
          name="ghiChu"
        >
          <Input.TextArea rows={2} placeholder="Nhập ghi chú" className="w-full" />
        </Form.Item>

        <Form.Item label="Tệp đính kèm">
          <Upload multiple beforeUpload={() => false}>
            <Button icon={<UploadOutlined />}>Chọn file</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Drawer>
  );
};
export default KPI_VanBanDiCreateOrUpdate;
