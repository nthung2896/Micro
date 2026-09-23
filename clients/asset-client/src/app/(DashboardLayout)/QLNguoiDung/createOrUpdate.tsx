import {
  DatePicker,
  Form,
  FormProps,
  Input,
  Modal,
  Radio,
  Select,
  TreeSelect,
  message,
} from "antd";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { DropdownOption, DropdownOptionTree } from "@/types/general";
import utc from "dayjs/plugin/utc";
import { AppUserType } from "@/types/appUser/dto";
import { AspNetUsersRequestType } from "@/types/aspNetUsers/request";
import userService from "@/services/user/user.service";
import departmentService from "@/services/department/department.service";
dayjs.extend(utc);
dayjs.locale("vi");

interface Props {
  isOpen: boolean;
  user?: AppUserType | null;
  onClose: () => void; //function callback
  onSuccess: () => void;
  dropVaiTros: DropdownOption[];
  departmentDropdown: DropdownOptionTree[];
  type?: string;
  fixedVaiTro?: string[];
  isSpecialistMode?: boolean;
}

const CreateOrUpdate: React.FC<Props> = (props: Props) => {
  const [form] = Form.useForm();
  const [donViOptions, setDonViOptions] = React.useState<any[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(props.isOpen);

  useEffect(() => {
    const fetchDropDown = async () => {
      try {
        const depRes =
          await departmentService.getDropdownDonVi();
        if (depRes.status && depRes.data) {
          setDonViOptions(depRes.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dropdown", error);
      }
    };
    fetchDropDown();
  }, []);

  const handleOnFinish: FormProps<AspNetUsersRequestType>["onFinish"] = async (
    formData: AspNetUsersRequestType,
  ) => {
    try {
      // Gán vai trò cố định nếu có
      if (!props.user && props.fixedVaiTro) {
        formData.vaiTro = props.fixedVaiTro;
      }

      if (props.user) {
        const response = await userService.update(formData);
        if (response.status) {
          message.success("Chỉnh sửa tài khoản thành công");
          form.resetFields();
          props.onSuccess();
          props.onClose();
        } else {
          message.error(response.message);
        }
      } else {
        const response = props.isSpecialistMode
          ? await userService.createChuyenVien(formData)
          : await userService.create(formData);

        if (response.status) {
          message.success(
            props.isSpecialistMode
              ? "Tạo tài khoản Chuyên viên thành công"
              : "Tạo tài khoản thành công",
          );
          form.resetFields();
          props.onSuccess();
          props.onClose();
        } else {
          const errors = response.errors?.length
            ? response.errors
            : [response.message];

          message.error(errors[0]);
        }
      }
    } catch (error) {
      message.error("Có lỗi xảy ra: " + error);
    }
  };

  const handleMapEdit = () => {
    if (props.user) {
      form.setFieldsValue({
        ...props.user,
        maCanBo: props.user.maCanBo,
        ngaySinh: props.user.ngaySinh ? dayjs.utc(props.user.ngaySinh) : null,
        gender: props.user.gender ? props.user.gender.toString() : "1",
        donViId: props.user.donViId ? props.user.donViId.toLowerCase() : undefined,
      });
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setIsOpen(false);
    props.onClose();
  };

  useEffect(() => {
    // handleSetDropdownVaiTro();
    setIsOpen(props.isOpen);
    if (props.user) {
      handleMapEdit();
    } else {
      form.resetFields();
      form.setFieldValue("userName", "");
      form.setFieldValue("matKhau", "");
    }
  }, [props.isOpen]);

  return (
    <Modal
      title={props.user != null ? "Chỉnh sửa tài khoản" : "Thêm mới tài khoản"}
      open={isOpen}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      okText="Xác nhận"
      cancelText="Đóng"
      width={600}
      style={{ top: 20 }}
    >
      <Form
        layout="vertical"
        form={form}
        name="formCreateUpdate"
        style={{ maxWidth: 1000 }}
        onFinish={handleOnFinish}
        autoComplete="off"
      >
        {props.user && (
          <Form.Item<AspNetUsersRequestType> name="id" hidden>
            <Input />
          </Form.Item>
        )}

        <Form.Item<AspNetUsersRequestType>
          label="Mã cán bộ"
          name="maCanBo"
          rules={[{ required: false }]}
          extra="Hệ thống tự sinh nếu để trống"
        >
          <Input placeholder="Nhập mã cán bộ" />
        </Form.Item>

        {!props.user && (
          <>
            <Form.Item<AspNetUsersRequestType>
              label="Tài khoản"
              name="userName"
              rules={[
                { required: true, message: "Vui lòng nhập thông tin này!" },
                {
                  pattern: /^[a-zA-Z0-9]+$/,
                  message: "Không được nhập chữ có dấu hoặc khoảng trắng!",
                },
              ]}
            >
              <Input />
            </Form.Item>

            {!props.isSpecialistMode && (
              <Form.Item<AspNetUsersRequestType>
                label="Mật khẩu"
                name="matKhau"
                rules={[
                  { required: true, message: "Vui lòng nhập thông tin này!" },
                  {
                    min: 8,
                    message: "Mật khẩu phải có ít nhất 8 ký tự!",
                  },
                ]}
              >
                <Input.Password />
              </Form.Item>
            )}
          </>
        )}

        <Form.Item<AspNetUsersRequestType>
          label="Họ tên"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập thông tin này!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<AspNetUsersRequestType>
          label="Đơn vị"
          name="donViId"
        >
          <Select
            allowClear
            showSearch
            placeholder="Chọn đơn vị"
            options={donViOptions}
            fieldNames={{ label: "label", value: "value" }}
            optionFilterProp="label"
            filterOption={(input, option) =>
              ((option?.label as string) ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </Form.Item>

        {/* <Form.Item<AspNetUsersRequestType>
          label="Số CMT/CCCD"
          name="cccd"
          rules={[
            { required: true, message: "Vui lòng nhập thông tin này!" },
            { pattern: /^([0-9]{9}|[0-9]{12})$/, message: "Số CMT/CCCD không hợp lệ (9 hoặc 12 chữ số)" }
          ]}
        >
          <Input />
        </Form.Item> */}

        <Form.Item<AspNetUsersRequestType>
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập thông tin này!" },
            { type: "email", message: "Email không hợp lệ!" },
          ]}
        >
          <Input />
        </Form.Item>

        {/* <Form.Item
          label="Vai trò"
          name="vaiTro"
          rules={[{ required: true, message: "Vui lòng nhập thông tin này!" }]}
        >
          <Select
            mode="multiple"
            placeholder="Chọn nhiều vai trò"
            options={props.dropVaiTros}
            fieldNames={{ label: "label", value: "value" }}
          />
        </Form.Item> */}
        <Form.Item<AspNetUsersRequestType>
          label="Điện thoại"
          name="phoneNumber"
          rules={[
            {
              pattern: /^[0-9]{10}$/,
              message: "Số điện thoại phải có đúng 10 chữ số",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item<AspNetUsersRequestType> label="Ngày sinh" name="ngaySinh">
          <DatePicker
            style={{ width: "100%" }}
            format={{
              format: "DD-MM-YYYY",
              type: "mask",
            }}
          />
        </Form.Item>
        <Form.Item<AspNetUsersRequestType> label="Giới tính" name="gender">
          <Radio.Group>
            <Radio value="1"> Nam </Radio>
            <Radio value="2"> Nữ </Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item<AspNetUsersRequestType> label="Địa chỉ" name="diaChi">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default CreateOrUpdate;
