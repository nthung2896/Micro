import React, { useEffect, useState } from "react";
import {
  Form,
  FormProps,
  Input,
  Select,
  DatePicker,
  Modal,
  message,
  Radio,
} from "antd";
import { TinhRequestType } from "@/types/tinh/request";
import * as extensions from "@/utils/extensions";
import tinhService from "@/services/tinh/tinh.service";
import { Switch } from "antd/lib";
import ImportExcelButton from "../../../components/ImportExcel-components/ImportExcelButton";
import { tinhImportAdapter } from "@/services/adapters/tinhImport.adapter";
import { TinhType } from "@/types/tinh/dto";
interface Props {
  item?: TinhType | null;
  onClose: () => void;
  pageIndex: number;
  pageSize: number;
  open: boolean;
  isEdit: boolean;
  onSuccess: (pageIndex: number, pageSize: number) => void;
}

const TinhCreateOrUpdate: React.FC<Props> = (props: Props) => {
  const [form] = Form.useForm<TinhRequestType>();

  const handleOnFinish: FormProps<TinhRequestType>["onFinish"] = async (
    formData: TinhRequestType,
  ) => {
    if (props.item) {
      console.log(props);
      const response = await tinhService.update(formData);
      if (response.status) {
        message.success("Chỉnh sửa  thành công");
        form.resetFields();
        props.onSuccess(props.pageIndex, props.pageSize);
        props.onClose();
      } else {
        message.error(response.message);
      }
    } else {
      const response = await tinhService.create(formData);
      if (response.status) {
        message.success("Thêm mới  thành công");
        form.resetFields();
        props.onSuccess(props.pageIndex, props.pageSize);
        props.onClose();
      } else {
        message.error(response.message);
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
    }
  }, [form, props.item]);
  const refreshData = async (pageIndex: number, pageSize: number) => {
    const searchData = {
      pageIndex,
      pageSize,
    };
    const response = await tinhService.getData(searchData);
  };
  return (
    <Modal
      title={props.item != null ? "Chỉnh sửa " : "Thêm mới "}
      open={props.open}
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
        {props.item && (
          <Form.Item<TinhRequestType> name="id" hidden>
            <Input />
          </Form.Item>
        )}
        {
          <>
            <Form.Item<TinhRequestType> label="Số thứ tự" name="sTT">
              <Input placeholder="Số thứ tự" />
            </Form.Item>
            <Form.Item<TinhRequestType>
              label="Tên Tỉnh"
              name="tenTinh"
              rules={[
                { required: true, message: "Vui lòng nhập thông tin này!" },
              ]}
            >
              <Input placeholder="Tên Tỉnh" />
            </Form.Item>
            <Form.Item<TinhRequestType>
              label="Mã Tỉnh"
              name="maTinh"
              rules={[
                { required: true, message: "Vui lòng nhập thông tin này!" },
              ]}
            >
              <Input placeholder="Mã Tỉnh" />
            </Form.Item>
          </>
        }
      </Form>
    </Modal>
  );
};
export default TinhCreateOrUpdate;
