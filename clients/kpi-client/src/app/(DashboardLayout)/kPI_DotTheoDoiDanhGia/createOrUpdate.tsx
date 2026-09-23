import React from "react";
import { Form, FormProps, Input, InputNumber, Select, DatePicker, Modal, Row, Col, TreeSelect } from "antd";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import {
  KPI_DotTheoDoiDanhGiaCreateOrUpdateType,
  KPI_DotTheoDoiDanhGiaType,
} from "@/types/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGia";
import * as extensions from "@/utils/extensions";
import kPI_DotTheoDoiDanhGiaService from "@/services/kPI_DotTheoDoiDanhGia/kPI_DotTheoDoiDanhGiaService";
import kPI_BoTieuChiDonViService from "@/services/kPI_BoTieuChiDonVi/kPI_BoTieuChiDonViService";
import kPI_BoTieuChiChungService from "@/services/kPI_BoTieuChiChung/kPI_BoTieuChiChungService";
interface Props {
  item?: KPI_DotTheoDoiDanhGiaType | null;
  isClone?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const KPI_DotTheoDoiDanhGiaCreateOrUpdate: React.FC<Props> = (props: Props) => {
  const [form] = Form.useForm<KPI_DotTheoDoiDanhGiaCreateOrUpdateType>();
  const [tieuChiChungOptions, setTieuChiChungOptions] = React.useState<any[]>([]);
  const [tieuChiDonViOptions, setTieuChiDonViOptions] = React.useState<any[]>([]);

  React.useEffect(() => {
    const loadDonViDropdown = async () => {
      try {
        const resDonVi = await kPI_BoTieuChiDonViService.getDropdown();
        if (resDonVi?.status && Array.isArray(resDonVi?.data)) {
          setTieuChiDonViOptions(
            resDonVi.data.map((item) => ({
              value: item.value,
              title: item.label || item.value,
              label: item.label || item.value,
            }))
          );
        }
      } catch (err) {
        console.error("Lỗi nạp danh sách bộ tiêu chí đơn vị:", err);
      }
    };
    loadDonViDropdown();
  }, []);

  const selectedType = Form.useWatch("type", form);
  const selectedThang = Form.useWatch("thang", form);
  const selectedNam = Form.useWatch("nam", form);
  const isTapThe = selectedType === "TapThe";
  const isManuallyEditedRef = React.useRef<boolean>(false);

  // Tự động tải danh sách bộ tiêu chí chung theo loại (Tập thể / Cá nhân)
  React.useEffect(() => {
    const loadTieuChiChung = async () => {
      try {
        const typeToFetch = selectedType || "CaNhan";
        const resChung = await kPI_BoTieuChiChungService.getDropdown(undefined, undefined, typeToFetch);
        if (resChung?.status && Array.isArray(resChung?.data)) {
          const options = resChung.data.map((item) => ({
            value: item.value,
            title: item.label || item.value,
            label: item.label || item.value,
            selected: item.selected,
          }));
          setTieuChiChungOptions(options);

          // Tự động chọn bộ tiêu chí chung phù hợp theo loại (Tập thể / Cá nhân)
          const currentVal = form.getFieldValue("defaultTieuChiChung");
          const isCurrentValValid = options.some((opt) => opt.value === currentVal);

          if (!isCurrentValValid || !currentVal) {
            const activeOption = options.find((opt) => opt.selected) || options[0];
            if (activeOption) {
              form.setFieldsValue({ defaultTieuChiChung: activeOption.value });
            } else {
              form.setFieldsValue({ defaultTieuChiChung: undefined });
            }
          }
        }
      } catch (err) {
        console.error("Lỗi nạp danh sách bộ tiêu chí chung:", err);
      }
    };
    loadTieuChiChung();
  }, [selectedType, form]);

  const generateDotName = React.useCallback((type?: string, thang?: number, nam?: number) => {
    const currentYear = nam || new Date().getFullYear();
    if (type === "TapThe") {
      return `Đợt đánh giá tập thể năm ${currentYear}`;
    }
    const currentMonth = thang || new Date().getMonth() + 1;
    return `Đợt đánh giá tháng ${currentMonth} năm ${currentYear}`;
  }, []);

  // Tự động cập nhật tên đợt khi thay đổi loại, tháng, hoặc năm (nếu người dùng chưa sửa tay)
  React.useEffect(() => {
    if (!props.item && !isManuallyEditedRef.current) {
      const autoName = generateDotName(selectedType, selectedThang, selectedNam);
      form.setFieldsValue({ tenDotTheoDoiDanhGia: autoName });
    }
  }, [selectedType, selectedThang, selectedNam, props.item, form, generateDotName]);

  const handleOnFinish: FormProps<any>["onFinish"] =
    async (formData: any) => {
      const isTypeTapThe = formData.type === "TapThe";
      const normalizedFormData = {
        ...formData,
        thang: isTypeTapThe ? null : formData.thang,
        quy: isTypeTapThe ? null : formData.quy,
        thoiGianBatDau: formData.thoiGianBatDau
          ? dayjs(formData.thoiGianBatDau).format("YYYY-MM-DDTHH:mm:ss")
          : null,
        thoiGianKetThuc: formData.thoiGianKetThuc
          ? dayjs(formData.thoiGianKetThuc).format("YYYY-MM-DDTHH:mm:ss")
          : null,
      } as any;

      if (props.isClone && props.item?.id) {
        const clonePayload = {
          ...normalizedFormData,
          sourceId: props.item.id,
        };
        const response = await kPI_DotTheoDoiDanhGiaService.clone(clonePayload);
        if (response.status) {
          toast.success("Sao chép đợt đánh giá thành công");
          form.resetFields();
          props.onSuccess();
          props.onClose();
        } else {
          toast.error(response.message);
        }
      } else if (props.item) {
        const response = await kPI_DotTheoDoiDanhGiaService.update(normalizedFormData);
        if (response.status) {
          toast.success("Chỉnh sửa thành công");
          form.resetFields();
          props.onSuccess();
          props.onClose();
        } else {
          toast.error(response.message);
        }
      } else {
        const response = await kPI_DotTheoDoiDanhGiaService.create(normalizedFormData);
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
      isManuallyEditedRef.current = true;
      form.setFieldsValue({
        ...props.item,
        type: props.item.type || "CaNhan",
        tenDotTheoDoiDanhGia: props.isClone ? `${props.item.tenDotTheoDoiDanhGia} (Bản sao)` : props.item.tenDotTheoDoiDanhGia,
        thoiGianBatDau: props.item.thoiGianBatDau && dayjs(props.item.thoiGianBatDau).isValid() ? dayjs(props.item.thoiGianBatDau) : undefined,
        thoiGianKetThuc: props.item.thoiGianKetThuc && dayjs(props.item.thoiGianKetThuc).isValid() ? dayjs(props.item.thoiGianKetThuc) : undefined,
      } as any);
    } else {
      form.resetFields();
      isManuallyEditedRef.current = false;
      const curMonth = new Date().getMonth() + 1;
      const curYear = new Date().getFullYear();
      const curQuarter = Math.floor((curMonth - 1) / 3) + 1;
      form.setFieldsValue({
        type: "CaNhan",
        thang: curMonth,
        quy: curQuarter,
        nam: curYear,
        trangThai: "ACTIVE",
        tenDotTheoDoiDanhGia: generateDotName("CaNhan", curMonth, curYear),
      });
    }
  }, [form, props.item, props.isClone, generateDotName]);

  return (
    <Modal
      title={
        props.isClone
          ? "Sao chép đợt theo dõi đánh giá"
          : props.item != null
          ? "Chỉnh sửa đợt theo dõi đánh giá"
          : "Thêm mới đợt theo dõi đánh giá"
      }
      open={true}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      okText="Xác nhận"
      cancelText="Đóng"
      width={700}
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
          <Form.Item<KPI_DotTheoDoiDanhGiaCreateOrUpdateType> name="id" hidden>
            <Input />
          </Form.Item>
        )}
        {
          <>
            <Row gutter={16}>
              <Col span={16}>
                <Form.Item<KPI_DotTheoDoiDanhGiaCreateOrUpdateType>
                  label="Tên đợt theo dõi đánh giá"
                  name="tenDotTheoDoiDanhGia"
                  rules={[{ required: true, message: "Vui lòng nhập thông tin này!" }]}
                >
                  <Input
                    placeholder="Tên đợt theo dõi đánh giá"
                    onChange={(e) => {
                      if (e.target.value.trim() === "") {
                        isManuallyEditedRef.current = false;
                        const autoName = generateDotName(
                          form.getFieldValue("type"),
                          form.getFieldValue("thang"),
                          form.getFieldValue("nam")
                        );
                        form.setFieldsValue({ tenDotTheoDoiDanhGia: autoName });
                      } else {
                        isManuallyEditedRef.current = true;
                      }
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item<KPI_DotTheoDoiDanhGiaCreateOrUpdateType>
                  label="Loại đợt đánh giá"
                  name="type"
                  rules={[{ required: true, message: "Vui lòng chọn loại đợt đánh giá!" }]}
                >
                  <Select
                    placeholder="Chọn loại đợt đánh giá"
                    onChange={(val) => {
                      if (val === "TapThe") {
                        form.setFieldsValue({ thang: undefined, quy: undefined });
                      } else {
                        const curMonth = form.getFieldValue("thang") || new Date().getMonth() + 1;
                        const curQuarter = Math.floor((curMonth - 1) / 3) + 1;
                        form.setFieldsValue({ thang: curMonth, quy: curQuarter });
                      }
                    }}
                  >
                    <Select.Option value="CaNhan">Cá nhân</Select.Option>
                    <Select.Option value="TapThe">Tập thể</Select.Option>
                  </Select>
                </Form.Item>
              </Col>

              {isTapThe ? (
                <Col span={24}>
                  <Form.Item<KPI_DotTheoDoiDanhGiaCreateOrUpdateType>
                    label="Năm đánh giá"
                    name="nam"
                    rules={[{ required: true, message: "Vui lòng nhập năm đánh giá!" }]}
                  >
                    <InputNumber min={1900} max={2100} style={{ width: "100%" }} placeholder="Năm đánh giá (VD: 2026)" />
                  </Form.Item>
                </Col>
              ) : (
                <>
                  <Col span={8}>
                    <Form.Item<KPI_DotTheoDoiDanhGiaCreateOrUpdateType>
                      label="Tháng"
                      name="thang"
                      rules={[{ required: true, message: "Vui lòng nhập thông tin này!" }]}
                    >
                      <InputNumber
                        min={1}
                        max={12}
                        style={{ width: "100%" }}
                        placeholder="Tháng"
                        onChange={(val) => {
                          if (val && typeof val === "number") {
                            const newQuy = Math.floor((val - 1) / 3) + 1;
                            form.setFieldsValue({ quy: newQuy });
                          }
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item<KPI_DotTheoDoiDanhGiaCreateOrUpdateType>
                      label="Quý"
                      name="quy"
                      rules={[{ required: true, message: "Vui lòng nhập thông tin này!" }]}
                    >
                      <InputNumber min={1} max={4} style={{ width: "100%" }} placeholder="Quý" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item<KPI_DotTheoDoiDanhGiaCreateOrUpdateType>
                      label="Năm"
                      name="nam"
                      rules={[{ required: true, message: "Vui lòng nhập thông tin này!" }]}
                    >
                      <InputNumber min={1900} max={2100} style={{ width: "100%" }} placeholder="Năm" />
                    </Form.Item>
                  </Col>
                </>
              )}

              <Col span={12}>
                <Form.Item<KPI_DotTheoDoiDanhGiaCreateOrUpdateType>
                  label="Thời gian bắt đầu"
                  name="thoiGianBatDau"
                  rules={[{ required: true, message: "Vui lòng nhập thông tin này!" }]}
                >
                  <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} placeholder="Thời gian bắt đầu" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item<KPI_DotTheoDoiDanhGiaCreateOrUpdateType>
                  label="Thời gian kết thúc"
                  name="thoiGianKetThuc"
                  rules={[{ required: true, message: "Vui lòng nhập thông tin này!" }]}
                >
                  <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} placeholder="Thời gian kết thúc" />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item<KPI_DotTheoDoiDanhGiaCreateOrUpdateType>
                  label="Trạng thái"
                  name="trangThai"
                  rules={[{ required: true, message: "Vui lòng nhập thông tin này!" }]}
                >
                  <Select placeholder="Chọn trạng thái">
                    <Select.Option value="ACTIVE">Đang hoạt động</Select.Option>
                    <Select.Option value="CLOSED">Đã đóng/Kết thúc</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item<KPI_DotTheoDoiDanhGiaCreateOrUpdateType>
                  label="Mặc định tiêu chí chung"
                  name="defaultTieuChiChung"
                >
                  <TreeSelect
                    showSearch
                    style={{ width: '100%' }}
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    treeData={tieuChiChungOptions}
                    placeholder="Chọn mặc định tiêu chí chung (không bắt buộc)"
                    allowClear
                    treeDefaultExpandAll
                    multiple={false} // Chỉ chọn 1
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item<KPI_DotTheoDoiDanhGiaCreateOrUpdateType>
                  label="Mặc định tiêu chí đơn vị"
                  name="defaultTieuChiDonVi"
                >
                  <TreeSelect
                    showSearch
                    style={{ width: '100%' }}
                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                    treeData={tieuChiDonViOptions}
                    placeholder="Chọn mặc định tiêu chí đơn vị (không bắt buộc)"
                    allowClear
                    treeDefaultExpandAll
                    multiple={false} // Chỉ chọn 1
                  />
                </Form.Item>
              </Col>
            </Row>
          </>
        }
      </Form>
    </Modal>
  );
};
export default KPI_DotTheoDoiDanhGiaCreateOrUpdate;
