import React, { useEffect, useState } from "react";
import { Form, FormProps, Input, InputNumber, Modal, Row, Col, Switch, ColorPicker, Select } from "antd";
import { toast } from "react-toastify";
import {
  Room_BangGiaCreateOrUpdateType,
  Room_BangGiaType,
} from "@/types/room_BangGia/room_BangGia";
import room_BangGiaService from "@/services/room_BangGia/room_BangGiaService";
import duLieuDanhMucService from "@/services/duLieuDanhMuc/duLieuDanhMuc.service";

interface Props {
  item?: Room_BangGiaType | null;
  onClose: () => void;
  onSuccess: () => void;
  loaiTinOptions?: { value: string; label: string }[];
  thuocTinhOptions?: { value: string; label: string }[];
}

const Room_BangGiaCreateOrUpdate: React.FC<Props> = (props: Props) => {
  const [form] = Form.useForm<Room_BangGiaCreateOrUpdateType>();
  const [colorValue, setColorValue] = useState<string>("#1677ff");
  const [loaiTinOptions, setLoaiTinOptions] = useState<{ value: string; label: string }[]>(
    props.loaiTinOptions || []
  );
  const [thuocTinhOptions, setThuocTinhOptions] = useState<{ value: string; label: string }[]>(
    props.thuocTinhOptions || []
  );
  const [loadingDropdowns, setLoadingDropdowns] = useState<boolean>(false);

  useEffect(() => {
    const fetchDropdowns = async () => {
      if (loaiTinOptions.length > 0 && thuocTinhOptions.length > 0) return;
      setLoadingDropdowns(true);
      try {
        const [loaiTinRes, thuocTinhRes] = await Promise.all([
          duLieuDanhMucService.getDropdownCode("LOAITIN"),
          duLieuDanhMucService.getDropdownCode("THUOCTINHBANGGIATIN"),
        ]);
        if (loaiTinRes?.status && Array.isArray(loaiTinRes.data)) {
          setLoaiTinOptions(loaiTinRes.data);
        }
        if (thuocTinhRes?.status && Array.isArray(thuocTinhRes.data)) {
          setThuocTinhOptions(thuocTinhRes.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh mục:", error);
      } finally {
        setLoadingDropdowns(false);
      }
    };
    fetchDropdowns();
  }, []);

  const handleOnFinish: FormProps<Room_BangGiaCreateOrUpdateType>["onFinish"] =
    async (formData: Room_BangGiaCreateOrUpdateType) => {
      const payload: Room_BangGiaCreateOrUpdateType = {
        ...formData,
        giaTin: formData.giaTin != null ? Number(formData.giaTin) : undefined,
        maMau: colorValue || formData.maMau,
        isTuDongDuyet: !!formData.isTuDongDuyet,
        isDuyTriThem10Ngay: !!formData.isDuyTriThem10Ngay,
        isHienThiNutGoi: !!formData.isHienThiNutGoi,
      };

      if (props.item) {
        const response = await room_BangGiaService.update(payload);
        if (response.status) {
          toast.success("Chỉnh sửa thành công");
          form.resetFields();
          props.onSuccess();
          props.onClose();
        } else {
          toast.error(response.message);
        }
      } else {
        const response = await room_BangGiaService.create(payload);
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

  useEffect(() => {
    if (props.item) {
      form.setFieldsValue({
        ...props.item,
        isTuDongDuyet: props.item.isTuDongDuyet ?? false,
        isDuyTriThem10Ngay: props.item.isDuyTriThem10Ngay ?? false,
        isHienThiNutGoi: props.item.isHienThiNutGoi ?? false,
      });
      setColorValue(props.item.maMau || "#1677ff");
    } else {
      form.resetFields();
      form.setFieldsValue({
        isTuDongDuyet: false,
        isDuyTriThem10Ngay: false,
        isHienThiNutGoi: false,
        maMau: "#1677ff",
      });
      setColorValue("#1677ff");
    }
  }, [form, props.item]);

  return (
    <Modal
      title={props.item != null ? "Chỉnh sửa bảng giá" : "Thêm mới bảng giá"}
      open={true}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      okText="Xác nhận"
      cancelText="Đóng"
      width={680}
    >
      <Form
        layout="vertical"
        form={form}
        name="formCreateUpdate"
        onFinish={handleOnFinish}
        autoComplete="off"
      >
        {props.item && (
          <Form.Item<Room_BangGiaCreateOrUpdateType> name="id" hidden>
            <Input />
          </Form.Item>
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item<Room_BangGiaCreateOrUpdateType>
              label="Loại tin"
              name="loaiTin"
              rules={[{ required: true, message: "Vui lòng chọn loại tin!" }]}
            >
              <Select
                placeholder="Chọn loại tin từ danh mục"
                loading={loadingDropdowns}
                showSearch
                allowClear
                options={loaiTinOptions}
                optionFilterProp="label"
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
          </Col>
          <Col span={12}>
            <Form.Item<Room_BangGiaCreateOrUpdateType>
              label="Giá tin (VNĐ/ngày)"
              name="giaTin"
              rules={[{ required: true, message: "Vui lòng nhập giá tin!" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                precision={0}
                step={1000}
                formatter={(value) =>
                  value != null
                    ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    : ""
                }
                parser={(value) =>
                  value ? (value.replace(/\$\s?|[,.\s]/g, "") as any) : ""
                }
                placeholder="Ví dụ: 13,500"
                addonAfter="đ"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item<Room_BangGiaCreateOrUpdateType>
              label="Thuộc tính"
              name="thuocTinh"
            >
              <Select
                placeholder="Chọn thuộc tính từ danh mục"
                loading={loadingDropdowns}
                showSearch
                allowClear
                options={thuocTinhOptions}
                optionFilterProp="label"
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
          </Col>
          <Col span={12}>
            <Form.Item<Room_BangGiaCreateOrUpdateType>
              label="Mã màu"
              name="maMau"
            >
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <ColorPicker
                  value={colorValue}
                  onChange={(color) => {
                    const hex =
                      typeof color === "string" ? color : color.toHexString();
                    setColorValue(hex);
                    form.setFieldsValue({ maMau: hex });
                  }}
                />
                <Input
                  placeholder="Ví dụ: #1677ff"
                  value={colorValue}
                  onChange={(e) => {
                    const val = e.target.value;
                    setColorValue(val);
                    form.setFieldsValue({ maMau: val });
                  }}
                />
              </div>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item<Room_BangGiaCreateOrUpdateType>
              label="Tự động duyệt"
              name="isTuDongDuyet"
              valuePropName="checked"
            >
              <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<Room_BangGiaCreateOrUpdateType>
              label="Duy trì thêm 10 ngày"
              name="isDuyTriThem10Ngay"
              valuePropName="checked"
            >
              <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item<Room_BangGiaCreateOrUpdateType>
              label="Hiển thị nút gọi"
              name="isHienThiNutGoi"
              valuePropName="checked"
            >
              <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default Room_BangGiaCreateOrUpdate;
