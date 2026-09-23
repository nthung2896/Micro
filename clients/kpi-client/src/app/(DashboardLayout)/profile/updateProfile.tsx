import {
  Button,
  Col,
  DatePicker,
  Divider,
  Form,
  FormProps,
  Input,
  message,
  Modal,
  Radio,
  Row,
  Typography,
  Switch,
} from "antd";
import {
  CalendarOutlined,
  CloseOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  ManOutlined,
  PhoneOutlined,
  SaveOutlined,
  UserOutlined,
  WomanOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useEffect, useMemo, useState } from "react";
import authService from "@/services/auth/auth.service";
import { AppUserType } from "@/types/appUser/dto";
import { ProfileUserEditRequestType } from "@/types/appUser/request";

dayjs.extend(utc);
const { Text } = Typography;

const UpdateProfile = ({
  item,
  onClose,
  onSuccess,
}: {
  item?: AppUserType | null;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [form] = Form.useForm<ProfileUserEditRequestType>();
  const [saving, setSaving] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  const initialGender = useMemo(
    () =>
      item?.gender !== undefined && item?.gender !== null
        ? String(item.gender)
        : "1",
    [item?.gender],
  );

  const isDoanhNghiep = useMemo(
    () => item?.listRole?.includes("DoanhNghiep") ?? false,
    [item?.listRole]
  );

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  const handleOnFinish: FormProps<ProfileUserEditRequestType>["onFinish"] =
    async (values) => {
      try {
        setSaving(true);

        const payload: any = {
          ...values,
          ngaySinh: values.ngaySinh ? values.ngaySinh.toISOString() : null,
          gender:
            values.gender !== undefined && values.gender !== null
              ? String(values.gender)
              : values.gender,
        };
        console.log(payload);
        const response = await authService.updateInfo(payload);

        if (response.status) {
          messageApi.success("Cập nhật thông tin cá nhân thành công");
          form.resetFields();
          onSuccess();
        } else {
          messageApi.error(response.message || "Cập nhật thất bại");
        }
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Có lỗi xảy ra khi cập nhật.";
        messageApi.error(errorMessage);
      } finally {
        setSaving(false);
      }
    };

  useEffect(() => {
    if (!item) return;

    form.setFieldsValue({
      ...item,
      departmentId: item.donViId,
      gender:
        item.gender !== undefined && item.gender !== null
          ? String(item.gender)
          : initialGender,
      ngaySinh: item.ngaySinh ? dayjs.utc(item.ngaySinh) : null,
      isKySo: item.isKySo ?? false,
    } as any);
  }, [form, item, initialGender]);

  return (
    <>
      {contextHolder}

      <Modal
        title={
          <div className="flex items-center gap-2">
            <UserOutlined className="text-rose-600" />
            <span>Chỉnh sửa thông tin cá nhân</span>
          </div>
        }
        open
        centered
        width={860}
        onCancel={handleCancel}
        destroyOnClose
        maskClosable={!saving}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              icon={<CloseOutlined />}
              onClick={handleCancel}
              disabled={saving}
            >
              Đóng
            </Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={() => form.submit()}
              className="shadow-sm"
            >
              Lưu thay đổi
            </Button>
          </div>
        }
      >
        <div className="mb-4 rounded-xl border border-rose-100 bg-rose-50 p-3">
          <Text className="text-rose-700">
            Bạn chỉ cập nhật các thông tin cá nhân. Một số trường có thể bị khóa
            theo phân quyền hệ thống.
          </Text>
        </div>

        <Form
          layout="vertical"
          form={form}
          name="formCreateUpdate"
          onFinish={handleOnFinish}
          autoComplete="off"
          className="w-full"
          requiredMark={false}
        >
          <Form.Item<ProfileUserEditRequestType> name="id" hidden>
            <Input />
          </Form.Item>

          <Divider className="mt-0!">Thông tin cơ bản</Divider>

          <Row gutter={[16, 12]}>
            <Col xs={24} md={12}>
              <Form.Item<ProfileUserEditRequestType>
                label="Họ tên"
                name="name"
                rules={[
                  { required: true, message: "Vui lòng nhập họ tên" },
                  { max: 100, message: "Họ tên tối đa 100 ký tự" },
                ]}
              >
                <Input
                  placeholder="Nhập họ tên"
                  prefix={<UserOutlined className="text-gray-400" />}
                  allowClear
                />
              </Form.Item>
            </Col>

            {/* <Col xs={24} md={12}>
              <Form.Item<ProfileUserEditRequestType>
                label="Số CCCD/CMND"
                name="cCCD"
                rules={[
                  { required: true, message: 'Vui lòng nhập số CMND/CCCD' },
                  { pattern: /^([0-9]{9}|[0-9]{12})$/, message: 'Số CMND/CCCD không hợp lệ (9 hoặc 12 số)' },
                ]}
              >
                <Input
                  placeholder="Nhập số CMND/CCCD"
                  prefix={<InfoCircleOutlined className="text-gray-400" />}
                  allowClear
                />
              </Form.Item>
            </Col> */}

            <Col xs={24} md={12}>
              <Form.Item<ProfileUserEditRequestType>
                label="Ngày sinh"
                name="ngaySinh"
                tooltip="Chỉ cho phép chọn ngày sinh cách hiện tại ít nhất 10 năm"
                rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
              >
                <DatePicker
                  className="w-full"
                  placeholder="Chọn ngày sinh"
                  format={{ format: "DD-MM-YYYY", type: "mask" }}
                  suffixIcon={<CalendarOutlined className="text-gray-400" />}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item<ProfileUserEditRequestType>
                label="Giới tính"
                name="gender"
                initialValue={initialGender}
              >
                <Radio.Group optionType="button" buttonStyle="solid">
                  <Radio.Button value="1">
                    <ManOutlined className="mr-1" />
                    Nam
                  </Radio.Button>
                  <Radio.Button value="0">
                    <WomanOutlined className="mr-1" />
                    Nữ
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>

            {!isDoanhNghiep && (
              <Col xs={24} md={12}>
                <Form.Item<ProfileUserEditRequestType>
                  label="Sử dụng ký số"
                  name="isKySo"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="Có" unCheckedChildren="Không" />
                </Form.Item>
              </Col>
            )}
          </Row>

          <Divider>Liên hệ</Divider>

          <Row gutter={[16, 12]}>
            <Col xs={24} md={12}>
              <Form.Item<ProfileUserEditRequestType>
                label="Điện thoại"
                name="phoneNumber"
                rules={[
                  {
                    required: true,
                    max: 20,
                    message: "Số điện thoại tối đa 20 ký tự",
                  },
                  {
                    pattern: /^[0-9+()\-\s]*$/,
                    message: "Số điện thoại chỉ gồm số và ký tự +()-",
                  },
                ]}
              >
                <Input
                  placeholder="Nhập số điện thoại"
                  prefix={<PhoneOutlined className="text-gray-400" />}
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item<ProfileUserEditRequestType>
                label="Địa chỉ"
                name="diaChi"
                rules={[{ max: 255, message: "Địa chỉ tối đa 255 ký tự" }]}
              >
                <Input
                  placeholder="Nhập địa chỉ"
                  prefix={<HomeOutlined className="text-gray-400" />}
                  allowClear
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default UpdateProfile;
