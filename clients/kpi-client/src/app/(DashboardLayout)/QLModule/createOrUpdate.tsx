import {
  Button,
  DatePicker,
  Form,
  FormProps,
  Image,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
  Upload,
  message,
} from "antd";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { ModuleType } from "@/types/module/dto";
import { ModuleRequestType } from "@/types/module/request";
import moduleService from "@/services/module/module.service";
import FileUploader from "@/libs/file-uploader";
import LoaiTaiLieuConstant from "@/constants/LoaiTaiLieuConstant";
dayjs.locale("vi");

interface Props {
  isOpen: boolean;
  module?: ModuleType | null;
  onClose: () => void; //function callback
  onSuccess: () => void;
}

const CreateOrUpdate: React.FC<Props> = (props: Props) => {
  const [form] = Form.useForm();
  const [isOpen, setIsOpen] = useState<boolean>(props.isOpen);

  const handleOnFinish: FormProps<ModuleRequestType>["onFinish"] = async (
    formData: ModuleRequestType,
  ) => {
    try {
      formData.fileId = fileUploader.getFileIds()?.at(0) || undefined;

      console.log("Form data:", formData);
      let response;
      if (props.module) {
        formData.id = props.module.id;
        response = await moduleService.update(formData);
      } else {
        response = await moduleService.create(formData);
      }

      if (response.status) {
        message.success(
          props.module
            ? "Chỉnh sửa chức năng thành công"
            : "Tạo chức năng thành công",
        );
        form.resetFields();
        props.onSuccess();
        props.onClose();
      } else {
        message.error(response.message);
      }
    } catch (error) {
      message.error("Có lỗi xảy ra: " + error);
    }
  };
  const fileUploader = FileUploader.useFileUploader({
    maxCount: 1,
    FileType: LoaiTaiLieuConstant.IconModule,
    initFiles: [],
  });

  const handleMapEdit = () => {
    form.setFieldsValue(props.module);

    if (props.module?.id) {
      fileUploader.setFilesByItemId(props.module.id);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    form.resetFields();
    props.onClose();
  };

  useEffect(() => {
    setIsOpen(props.isOpen);
    if (props.module) {
      handleMapEdit();
    }
  }, [props.isOpen]);

  return (
    <Modal
      title={
        props.module != null ? "Chỉnh sửa chức năng" : "Thêm mới chức năng"
      }
      open={isOpen}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      okText="Xác nhận"
      cancelText="Đóng"
      width={600}
    >
      <Form
        layout="vertical"
        form={form}
        name="formCreateUpdate"
        style={{ maxWidth: 1000 }}
        onFinish={handleOnFinish}
        autoComplete="off"
      >
        {props.module && (
          <Form.Item<ModuleRequestType> name="id" hidden>
            <Input />
          </Form.Item>
        )}
        <Form.Item<ModuleRequestType>
          label="Mã chức năng"
          name="code"
          rules={[{ required: true, message: "Vui lòng nhập thông tin này!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<ModuleRequestType>
          label="Tên chức năng"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập thông tin này!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item<ModuleRequestType>
          label="Thứ tự"
          name="order"
          rules={[
            {
              type: "number",
              min: 0,
              message: "Giá trị phải lớn hơn hoặc bằng 0",
            },
          ]}
        >
          <InputNumber
            name="order"
            style={{ width: "100%" }}
            defaultValue={0}
            min={0}
          />
        </Form.Item>

        <Form.Item<ModuleRequestType>
          label="Trạng thái"
          name="isShow"
          initialValue={true}
        >
          <Radio.Group>
            <Radio value={true}> Hiển thị </Radio>
            <Radio value={false}> Không hiển thị </Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item<ModuleRequestType> label="Icon" name="fileId">
          <FileUploader controller={fileUploader} />
        </Form.Item>

        <Form.Item<ModuleRequestType> label="Class Css" name="classCss">
          <Input />
        </Form.Item>
        <Form.Item<ModuleRequestType> label="Style Css" name="styleCss">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default CreateOrUpdate;
