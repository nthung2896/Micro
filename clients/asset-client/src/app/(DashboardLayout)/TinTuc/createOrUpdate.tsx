"use client";
import { TinTucDto, TinTucCreateRequest } from "@/types/tinTuc";
import tinTucService from "@/services/tinTuc/tinTuc.service";
import { DANH_MUC_TIN_TUC } from "@/constants/DanhMucTinTucConstant";
import RichTextEditor from "@/components/shared-components/RichTextEditor";
import { Modal, Form, Input, InputNumber, Select, Switch, Row, Col, Upload, message, DatePicker } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { PlusOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";
import axios from "axios";

interface Props {
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
  data?: TinTucDto;
}

type TinTucFormValues = Omit<TinTucCreateRequest, "ngayXuatBan"> & {
  ngayXuatBan?: dayjs.Dayjs;
};

const CreateUpdateForm: React.FC<Props> = ({ isOpen, onSuccess, onClose, data }) => {
  const [form] = Form.useForm<TinTucFormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const isEdit = !!data;

  const staticUrl = process.env.NEXT_PUBLIC_STATIC_FILE_BASE_URL || "";

  useEffect(() => {
    if (isOpen) {
      if (data) {
        // Gọi API lấy chi tiết để có đầy đủ noiDung
        tinTucService.getById(data.id).then((res) => {
          const detail = res.data;
          if (detail) {
            form.setFieldsValue({
              id: detail.id,
              tieuDe: detail.tieuDe || "",
              slug: detail.slug || "",
              moTaNgan: detail.moTaNgan || "",
              noiDung: detail.noiDung || "",
              anhDaiDien: detail.anhDaiDien || "",
              tenDanhMuc: detail.tenDanhMuc || "",
              trangThai: detail.trangThai ?? 0,
              isNoiBat: detail.isNoiBat ?? false,
              thuTu: detail.thuTu ?? undefined,
              tags: detail.tags || "",
              ngayXuatBan: detail.ngayXuatBan ? dayjs(detail.ngayXuatBan) : undefined,
            });
            // Hiển thị ảnh cũ nếu có
            if (detail.anhDaiDien) {
              setFileList([{
                uid: "-1",
                name: "Ảnh đại diện",
                status: "done",
                url: `${staticUrl}/${detail.anhDaiDien}`,
              }]);
            } else {
              setFileList([]);
            }
          }
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ trangThai: 0, isNoiBat: false });
        setFileList([]);
      }
    }
  }, [isOpen, data, form]);

  const handleSubmit = async (values: TinTucFormValues) => {
    try {
      const submitValues: TinTucCreateRequest = {
        ...values,
        ngayXuatBan: values.ngayXuatBan
          ? dayjs(values.ngayXuatBan).format("YYYY-MM-DDTHH:mm:ss")
          : undefined,
      };
      const payload = isEdit ? { ...submitValues, id: data!.id } : submitValues;
      const response = await tinTucService.createOrUpdate(payload);
      if (response.status) {
        message.success(isEdit ? "Cập nhật thành công" : "Thêm mới thành công");
        form.resetFields();
        onSuccess();
      } else {
        message.error(response.message || "Lưu dữ liệu thất bại");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra");
    }
  };

  return (
    <Modal
      title={isEdit ? "Chỉnh sửa tin tức" : "Thêm mới tin tức"}
      open={isOpen}
      onOk={() => form.submit()}
      onCancel={onClose}
      okText="Xác nhận"
      cancelText="Đóng"
      width={800}
      style={{ top: 20 }}
      destroyOnClose
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Tiêu đề"
              name="tieuDe"
              rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
            >
              <Input placeholder="Nhập tiêu đề tin tức" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Slug (URL)" name="slug">
              <Input placeholder="Tự tạo nếu để trống" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Danh mục" name="tenDanhMuc">
              <Select
                placeholder="Chọn danh mục"
                options={DANH_MUC_TIN_TUC.map((d) => ({ label: d.label, value: d.value }))}
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="Mô tả ngắn" name="moTaNgan">
              <Input.TextArea rows={2} placeholder="Mô tả ngắn hiển thị ở danh sách" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="Nội dung" name="noiDung">
              <RichTextEditor placeholder="Nhập nội dung tin tức..." />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Ảnh đại diện">
              <Upload
                listType="picture-card"
                fileList={fileList}
                maxCount={1}
                accept=".jpg,.jpeg,.png,.webp"
                beforeUpload={() => false}
                onChange={({ fileList: newList }) => {
                  setFileList(newList);
                  // Nếu có file mới chọn, upload ngay
                  const file = newList[0]?.originFileObj;
                  if (file) {
                    const formData = new FormData();
                    formData.append("Files", file);
                    formData.append("FileType", "tin-tuc");
                    const token = localStorage.getItem("AccessToken");
                    axios
                      .post(
                        `${process.env.NEXT_PUBLIC_API_URL}/api/TaiLieuDinhKem/upload`,
                        formData,
                        { headers: { Authorization: `Bearer ${token}` } }
                      )
                      .then((res) => {
                        const uploaded = res.data?.data?.[0];
                        if (uploaded?.duongDanFile) {
                          form.setFieldsValue({ anhDaiDien: uploaded.duongDanFile });
                          setFileList([{
                            uid: uploaded.id,
                            name: uploaded.tenTaiLieu,
                            status: "done",
                            url: `${staticUrl}/${uploaded.duongDanFile}`,
                          }]);
                        }
                      })
                      .catch(() => message.error("Upload ảnh thất bại"));
                  }
                }}
                onRemove={() => {
                  setFileList([]);
                  form.setFieldsValue({ anhDaiDien: "" });
                }}
              >
                {fileList.length === 0 && (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8, fontSize: 12 }}>Tải ảnh</div>
                  </div>
                )}
              </Upload>
              <Form.Item name="anhDaiDien" hidden>
                <Input />
              </Form.Item>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Tags" name="tags">
              <Input placeholder="tag1, tag2, tag3" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Ngày xuất bản" name="ngayXuatBan">
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                style={{ width: "100%" }}
                placeholder="Chọn ngày xuất bản"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Trạng thái" name="trangThai">
              <Select>
                <Select.Option value={0}>Nháp</Select.Option>
                <Select.Option value={1}>Xuất bản</Select.Option>
                <Select.Option value={2}>Ẩn</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Thứ tự" name="thuTu">
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Tin nổi bật" name="isNoiBat" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CreateUpdateForm;
