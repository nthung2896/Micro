import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Radio,
  Input,
  Select,
  DatePicker,
  Switch,
  Row,
  Col,
  message,
  Divider,
} from "antd";
import { VuViecPhanAnhType } from "@/types/vu-viec-phan-anh/dto";
import vuViecPhanAnhService from "@/services/vuViecPhanAnh/vuViecPhanAnh.service";
import nenTangViPhamService from "@/services/nenTangViPham/nenTangViPham.service";
import { Dictionary, DropdownOption } from "@/types/general";
import dayjs from "dayjs";

const { TextArea } = Input;

interface ProcessVuViecModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  item: VuViecPhanAnhType | null;
}

const ProcessVuViecModal: React.FC<ProcessVuViecModalProps> = ({
  open,
  onCancel,
  onSuccess,
  item,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [ketLuanVal, setKetLuanVal] = useState<number>(0);
  const [dropdowns, setDropdowns] = useState<Dictionary<DropdownOption[]>>({});
  const [loadingDropdown, setLoadingDropdown] = useState(false);

  useEffect(() => {
    if (open) {
      form.resetFields();
      setKetLuanVal(0);
      if (item) {
        form.setFieldsValue({
          ketLuan: 1, // Default to right complaint
          tenNenTang: item.tenNenTang,
          tenUngDung: item.tenUngDung,
          isHienThi: true,

        });
        setKetLuanVal(1);
      }
    }
  }, [open, item, form]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      if (open) {
        setLoadingDropdown(true);
        try {
          const res = await nenTangViPhamService.getDropdowns();
          if (res.status && res.data) {
            setDropdowns(res.data);
          }
        } catch (e) {
          console.error("Lỗi khi tải dropdown danh mục nền tảng vi phạm:", e);
        } finally {
          setLoadingDropdown(false);
        }
      }
    };
    fetchDropdowns();
  }, [open]);

  const handleSubmit = async () => {
    if (!item || !item.id) return;
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      // 1. Cập nhật trạng thái Vụ việc phản ánh thành Đã xử lý (trangThai = 2) và lưu Kết luận dùng changeStatus để bảo toàn dữ liệu
      const updateVuViecResponse = await vuViecPhanAnhService.changeStatus(
        item.id,
        2,
        values.ketLuan
      );

      if (!updateVuViecResponse.status) {
        message.error(updateVuViecResponse.message || "Cập nhật trạng thái vụ việc thất bại");
        setSubmitting(false);
        return;
      }

      // 2. Nếu là phản ánh đúng, tiến hành tạo bản ghi NenTangViPham
      if (values.ketLuan === 1) {
        const nenTangData = {
          tenNenTang: values.tenNenTang,
          tenUngDung: values.tenUngDung,
          nguonId: values.nguonId,
          loaiViPhamId: values.loaiViPhamId,
          ngayBatDau: values.ngayBatDau ? dayjs(values.ngayBatDau).format("YYYY-MM-DDTHH:mm:ss") : undefined,
          ngayKetThuc: values.ngayKetThuc ? dayjs(values.ngayKetThuc).format("YYYY-MM-DDTHH:mm:ss") : undefined,
          isHienThi: values.isHienThi ?? false,
          noiDung: values.noiDung,
        };

        const createNenTangResponse = await nenTangViPhamService.create(nenTangData);
        if (!createNenTangResponse.status) {
          message.warning(
            "Cập nhật vụ việc thành công nhưng không thể tự động tạo bản ghi nền tảng vi phạm: " +
            (createNenTangResponse.message || "")
          );
        }
      }

      message.success("Xử lý vụ việc phản ánh thành công");
      onSuccess();
    } catch (err) {
      console.error(err);
      message.error("Vui lòng kiểm tra lại thông tin nhập liệu!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title={
        <span style={{ fontSize: "16px", fontWeight: 700, color: "#1e3a8a" }}>
          🛠️ Xử lý vụ việc phản ánh
        </span>
      }
      okText="Lưu kết quả"
      cancelText="Hủy bỏ"
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={submitting}
      width={700}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        name="processVuViecForm"
        initialValues={{ ketLuan: 1, isHienThi: true }}
      >
        <Form.Item
          label={<span style={{ fontWeight: 600 }}>Kết luận vụ việc</span>}
          name="ketLuan"
          rules={[{ required: true, message: "Vui lòng chọn kết luận!" }]}
        >
          <Radio.Group onChange={(e) => setKetLuanVal(e.target.value)} value={ketLuanVal}>
            <Radio value={1}>Phản ánh đúng</Radio>
            <Radio value={2}>Phản ánh sai / Chưa đủ cơ sở</Radio>
          </Radio.Group>
        </Form.Item>

        {ketLuanVal === 1 && (
          <>
            <Divider style={{ margin: "12px 0 20px 0" }}>
              <span style={{ color: "#ea580c", fontWeight: 600, fontSize: "13px" }}>
                ĐĂNG KÝ THÔNG TIN NỀN TẢNG VI PHẠM
              </span>
            </Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Tên nền tảng (Website/MXH)"
                  name="tenNenTang"
                  rules={[{ required: true, message: "Vui lòng nhập tên nền tảng!" }]}
                >
                  <Input placeholder="Ví dụ: Facebook, TikTok, website.com..." />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Tên ứng dụng" name="tenUngDung">
                  <Input placeholder="Nhập tên ứng dụng nếu có..." />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Nguồn vi phạm" name="nguonId">
                  <Select
                    placeholder="Chọn nguồn vi phạm"
                    allowClear
                    loading={loadingDropdown}
                    options={dropdowns["NguonViPham"] || []}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Loại vi phạm" name="loaiViPhamId">
                  <Select
                    placeholder="Chọn loại vi phạm"
                    allowClear
                    loading={loadingDropdown}
                    options={dropdowns["LoaiViPham"] || []}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={10}>
                <Form.Item label="Ngày bắt đầu" name="ngayBatDau">
                  <DatePicker style={{ width: "100%" }} placeholder="Chọn ngày" format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item label="Ngày kết thúc" name="ngayKetThuc">
                  <DatePicker style={{ width: "100%" }} placeholder="Chọn ngày" format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col span={4} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Form.Item label="Hiển thị" name="isHienThi" valuePropName="checked">
                  <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Nội dung vi phạm" name="noiDung">
              <TextArea rows={3} placeholder="Mô tả hành vi hoặc lý do vi phạm của nền tảng..." />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default ProcessVuViecModal;
