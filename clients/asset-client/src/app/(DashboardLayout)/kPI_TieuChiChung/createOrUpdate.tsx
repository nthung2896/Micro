import React from "react";
import { Form, FormProps, Input, Select, DatePicker, Modal, InputNumber, TreeSelect } from "antd";
import { toast } from "react-toastify";
import {
  KPI_TieuChiChungCreateOrUpdateType,
  KPI_TieuChiChungType,
} from "@/types/kPI_TieuChiChung/kPI_TieuChiChung";
import * as extensions from "@/utils/extensions";
import kPI_TieuChiChungService from "@/services/kPI_TieuChiChung/kPI_TieuChiChungService";
import { baseTheme } from "@/constants/ThemeConstant";

interface Props {
  item?: KPI_TieuChiChungType | null;
  defaultParentId?: string | null;
  defaultParentName?: string | null;
  treeData?: any[];
  idBoTieuChiChung?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const KPI_TieuChiChungCreateOrUpdate: React.FC<Props> = (props: Props) => {
  const [form] = Form.useForm<KPI_TieuChiChungCreateOrUpdateType>();
  const formControlStyle: React.CSSProperties = {
    fontFamily: baseTheme.fontFamily,
  };

  const handleOnFinish: FormProps<KPI_TieuChiChungCreateOrUpdateType>["onFinish"] =
    async (formData: KPI_TieuChiChungCreateOrUpdateType) => {
      if (props.item && props.item.id) {
        console.log(props);
        const response = await kPI_TieuChiChungService.update(formData);
        if (response.status) {
          toast.success("Chỉnh sửa  thành công");
          form.resetFields();
          props.onSuccess();
          props.onClose();
        } else {
          toast.error(response.message);
        }
      } else {
        const response = await kPI_TieuChiChungService.create(formData);
        if (response.status) {
          toast.success("Thêm mới  thành công");
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
      const defaultValues: any = {};
      if (props.defaultParentId) {
        defaultValues.parentId = props.defaultParentId;
      }
      if (props.idBoTieuChiChung) {
        defaultValues.idBoTieuChiChung = props.idBoTieuChiChung;
      }
      form.setFieldsValue(defaultValues);
    }
  }, [form, props.item, props.defaultParentId, props.idBoTieuChiChung]);

  return (
    <Modal
      title={
        props.item != null
          ? "Chỉnh sửa "
          : "Thêm mới "
      }
      open={true}
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
          <Form.Item<KPI_TieuChiChungCreateOrUpdateType> name="id" hidden>
            <Input />
          </Form.Item>
        )}
        <Form.Item<KPI_TieuChiChungCreateOrUpdateType> name="idBoTieuChiChung" hidden>
          <Input />
        </Form.Item>
        <Form.Item<KPI_TieuChiChungCreateOrUpdateType>
          label="Tên tiêu chí chung"
          name="ten"
          rules={[
            { required: true, message: "Vui lòng nhập thông tin này!" },
          ]}
        >
          <Input
            placeholder="Nhập tên tiêu chí chung"
            styles={{ input: formControlStyle }}
          />
        </Form.Item>
        {props.defaultParentName && (
          <Form.Item label="Tiêu chí cha">
            <Input
              value={props.defaultParentName}
              disabled
              className="!text-black !bg-gray-100"
              styles={{ input: formControlStyle }}
            />
          </Form.Item>
        )}
        <Form.Item<KPI_TieuChiChungCreateOrUpdateType>
          label={props.defaultParentName ? "Mã ID Tiêu chí cha" : "Tiêu chí cha"}
          name="parentId"
          hidden={!!props.defaultParentName}
        >
          {props.defaultParentName ? (
            <Input placeholder="Nhập tiêu chí cha (Mã ID)" />
          ) : (
            <TreeSelect
              showSearch
              style={{ width: '100%' }}
              styles={{
                root: formControlStyle,
                item: formControlStyle,
                itemContent: formControlStyle,
                input: formControlStyle,
              }}
              dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
              placeholder="Chọn tiêu chí cha (có thể để trống)"
              allowClear
              treeDefaultExpandAll
              treeData={props.treeData || []}
              fieldNames={{ label: 'ten', value: 'id', children: 'children' }}
              treeNodeFilterProp="ten"
            />
          )}
        </Form.Item>
        <Form.Item<KPI_TieuChiChungCreateOrUpdateType>
          label="Điểm / Trọng số"
          name="myProperty"
          rules={[
            { required: true, message: "Vui lòng nhập thông tin này!" },
          ]}
        >
          <InputNumber 
            className="w-full" 
            style={{ width: "100%" }} 
            styles={{ input: formControlStyle }}
            placeholder="Nhập điểm / trọng số" 
            step={0.1}
            decimalSeparator=","
          />
        </Form.Item>
        <Form.Item<KPI_TieuChiChungCreateOrUpdateType>
          label="Sắp xếp (Priority)"
          name="priority"
        >
          <InputNumber 
            className="w-full" 
            style={{ width: "100%" }} 
            styles={{ input: formControlStyle }}
            placeholder="Nhập số thứ tự sắp xếp" 
            min={0}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default KPI_TieuChiChungCreateOrUpdate;
