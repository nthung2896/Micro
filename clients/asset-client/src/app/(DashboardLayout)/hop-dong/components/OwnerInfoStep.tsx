import { AuthenticationContractType } from "@/types/authenticationContract/dto";
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  Row,
  Space,
  message,
} from "antd";
import { FormInstance } from "antd/es/form";
import { ContractFormValues } from "../createOrUpdate.types";

interface OwnerInfoStepProps {
  form: FormInstance<ContractFormValues>;
  createData: Record<string, string>;
  data?: AuthenticationContractType | null;
  submitUsername: string;
  companyDkkd: string;
  createDataLoading: boolean;
  requiredMessage: string;
}

const emptyText = "Chưa có dữ liệu";

const OwnerInfoStep: React.FC<OwnerInfoStepProps> = ({
  form,
  createData,
  data,
  submitUsername,
  companyDkkd,
  createDataLoading,
  requiredMessage,
}) => {
  const representerName = createData.representerName || "";
  const representerCCCD = createData.representerCCCD || "";
  const representerAddress =
    createData.representerDiaChi || createData.address || "";
  const representerMobile = createData.representerMobile || "";
  const representerEmail = createData.representerEmail || "";

  const syncContactFromRepresenter = () => {
    form.setFieldsValue({
      representerNameOnline: representerName,
      representerJobOnline: form.getFieldValue("representerJob"),
      representerCCCDOnline: representerCCCD,
      representerDiaChiOnline: representerAddress,
      representerMobileOnline: representerMobile,
      representerEmailOnline: representerEmail,
    });
    message.success("Đã đồng bộ thông tin người liên hệ");
  };

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      {!submitUsername && (
        <Alert
          type="warning"
          showIcon
          message="Không xác định được tài khoản hiện tại. Cần truyền username hoặc đăng nhập lại trước khi tạo hồ sơ."
        />
      )}

      <Card
        title="1.1 Thông tin doanh nghiệp"
        size="small"
        loading={createDataLoading}
      >
        <Descriptions bordered size="small" column={2}>
          <Descriptions.Item label="Tên chủ quản nền tảng">
            {createData.name || data?.chuSoHuu || emptyText}
          </Descriptions.Item>
          <Descriptions.Item label="Mã số thuế doanh nghiệp">
            {createData.companyTaxCode ||
              data?.companyTaxCode ||
              submitUsername ||
              emptyText}
          </Descriptions.Item>
          <Descriptions.Item label="Địa chỉ trụ sở chính">
            {createData.address || emptyText}
          </Descriptions.Item>
          <Descriptions.Item label="Email tiếp nhận thông tin">
            {createData.email || emptyText}
          </Descriptions.Item>
          <Descriptions.Item label="File ảnh đăng ký doanh nghiệp" span={2}>
            {companyDkkd ? (
              <a href={companyDkkd} target="_blank" rel="noreferrer">
                Xem file đăng ký doanh nghiệp
              </a>
            ) : (
              emptyText
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="1.2 Người đại diện pháp luật" size="small">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Họ và tên">
              <Input value={representerName} disabled readOnly />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<ContractFormValues>
              name="representerJob"
              label="Chức danh người đại diện pháp luật"
              rules={[{ required: true, message: requiredMessage }]}
            >
              <Input placeholder="Nhập chức danh người đại diện pháp luật" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Số CCCD/Số hộ chiếu">
              <Input value={representerCCCD} disabled readOnly />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Địa chỉ">
              <Input value={representerAddress} disabled readOnly />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Số điện thoại">
              <Input value={representerMobile} disabled readOnly />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Email">
              <Input value={representerEmail} disabled readOnly />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card
        title="1.3 Người liên hệ"
        size="small"
        extra={
          <Button type="dashed" onClick={syncContactFromRepresenter}>
            Đồng bộ với người đại diện
          </Button>
        }
      >
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item<ContractFormValues>
              name="representerNameOnline"
              label="Họ và tên"
              rules={[{ required: true, message: requiredMessage }]}
            >
              <Input placeholder="Nhập họ tên người liên hệ" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<ContractFormValues>
              name="representerJobOnline"
              label="Chức danh"
              rules={[{ required: true, message: requiredMessage }]}
            >
              <Input placeholder="Nhập chức danh" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<ContractFormValues>
              name="representerCCCDOnline"
              label="Số CCCD"
              rules={[
                { required: true, message: requiredMessage },
                {
                  pattern: /^[0-9A-Z]{9,12}$/i,
                  message: "Số CCCD không hợp lệ",
                },
              ]}
            >
              <Input placeholder="Nhập số CCCD" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<ContractFormValues>
              name="representerMobileOnline"
              label="SĐT"
              rules={[
                { required: true, message: requiredMessage },
                {
                  pattern: /^[0-9]{10,11}$/,
                  message: "Số điện thoại không hợp lệ",
                },
              ]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<ContractFormValues>
              name="representerEmailOnline"
              label="Email"
              rules={[
                { required: true, message: requiredMessage },
                { type: "email", message: "Email không đúng định dạng" },
              ]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item<ContractFormValues>
              name="representerDiaChiOnline"
              label="Địa chỉ"
              rules={[{ required: true, message: requiredMessage }]}
            >
              <Input.TextArea rows={2} placeholder="Nhập địa chỉ người liên hệ" />
            </Form.Item>
          </Col>
        </Row>
      </Card>
    </Space>
  );
};

export default OwnerInfoStep;
