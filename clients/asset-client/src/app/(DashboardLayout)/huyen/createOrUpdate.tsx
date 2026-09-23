import React from "react";
import {
  Form,
  FormProps,
  Input,
  Select,
  DatePicker,
  Modal,
  message,
} from "antd";
import { HuyenRequestType } from "@/types/huyen/request";
import * as extensions from "@/utils/extensions";
import huyenService from "@/services/huyen/huyen.service";
import ImportExcelButton from "../../../components/ImportExcel-components/ImportExcelButton";
import tinhService from "@/services/tinh/tinh.service";
import { huyenImportAdapter } from "@/services/adapters/huyenImport.adapter";
import { TinhOption } from "@/types/tinh/TinhOption";
import { HuyenType } from "@/types/huyen/dto";
interface Props {
  item?: HuyenType | null;
  onClose: () => void;
  pageIndex: number;
  pageSize: number;
  open: boolean;
  isEdit: boolean;
  onSuccess: (pageIndex: number, pageSize: number) => void;
}

const HuyenCreateOrUpdate: React.FC<Props> = (props: Props) => {
  const [form] = Form.useForm<HuyenRequestType>();
  const [tinhOptions, setTinhOptions] = React.useState<TinhOption[]>([]);
  const [loadingTinh, setLoadingTinh] = React.useState(false);

  React.useEffect(() => {
    const fetchTinh = async () => {
      setLoadingTinh(true);
      try {
        const res = await tinhService.getData({ pageIndex: 1, pageSize: 200 });
        const items = (res as any)?.data?.items ?? (res as any)?.data ?? [];

        setTinhOptions(
          items.map((x: any) => ({
            label: x.tenDv ?? x.tenTinh ?? x.name,
            value: x.maTinh ?? x.code,
          })),
        );
      } catch (e) {
        message.error("Không tải được danh sách tỉnh/thành");
      } finally {
        setLoadingTinh(false);
      }
    };

    // chỉ fetch khi modal mở để đỡ gọi thừa
    if (props.open) fetchTinh();
  }, [props.open]);

  const handleOnFinish: FormProps<HuyenRequestType>["onFinish"] = async (
    formData: HuyenRequestType,
  ) => {
    if (props.item) {
      console.log(props);
      const response = await huyenService.update(formData);
      if (response.status) {
        message.success("Chỉnh sửa  thành công");
        form.resetFields();
        props.onSuccess(props.pageIndex, props.pageSize);
        props.onClose();
      } else {
        message.error(response.message);
      }
    } else {
      const response = await huyenService.create(formData);
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
          <Form.Item<HuyenRequestType> name="id" hidden>
            <Input />
          </Form.Item>
        )}
        {
          <>
            <Form.Item<HuyenRequestType>
              label="Loại huyện"
              name="loaiHuyen"
              rules={[
                { required: true, message: "Vui lòng nhập thông tin này!" },
              ]}
            >
              <Input placeholder="Loại huyện" />
            </Form.Item>
            <Form.Item<HuyenRequestType>
              label="Tên huyện"
              name="tenHuyen"
              rules={[
                { required: true, message: "Vui lòng nhập thông tin này!" },
              ]}
            >
              <Input placeholder="Tên huyện" />
            </Form.Item>
            <Form.Item<HuyenRequestType>
              label="Mã"
              name="ma"
              rules={[
                { required: true, message: "Vui lòng nhập thông tin này!" },
              ]}
            >
              <Input placeholder="Mã" />
            </Form.Item>
            <Form.Item<HuyenRequestType>
              label="Mã tỉnh"
              name="maTinh"
              rules={[{ required: true, message: "Vui lòng chọn tỉnh!" }]}
            >
              <Select
                placeholder="Chọn tỉnh/thành phố"
                loading={loadingTinh}
                showSearch
                optionFilterProp="label"
                options={tinhOptions}
                filterOption={(input, option) =>
                  ((option?.label as string) ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase()) ||
                  ((option?.value as string) ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </>
        }
      </Form>
    </Modal>
  );
};
export default HuyenCreateOrUpdate;
