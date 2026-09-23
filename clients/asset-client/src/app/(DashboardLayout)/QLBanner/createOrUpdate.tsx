import { Form, FormProps, Input, InputNumber, Modal, Row, Col, Select, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import type { UploadFile } from "antd";
import axios from "axios";
import { BannerDto, BannerRequest } from "@/types/banner";
import bannerService from "@/services/banner/banner.service";

const staticUrl = process.env.NEXT_PUBLIC_STATIC_FILE_BASE_URL || "";

interface Props {
  isOpen: boolean;
  bannerItem?: BannerDto | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateOrUpdate: React.FC<Props> = (props: Props) => {
  const [form] = Form.useForm();
  const [isOpen, setIsOpen] = useState<boolean>(props.isOpen);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [filePath, setFilePath] = useState<string>("");

  const handleUploadFile = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("Files", file);
      formData.append("FileType", "banner");
      const token = localStorage.getItem("AccessToken");
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/TaiLieuDinhKem/upload`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const uploaded = res.data?.data?.[0];
      if (uploaded?.duongDanFile) {
        let path = uploaded.duongDanFile;
        if (!path.startsWith("/")) {
          path = "/" + path;
        }
        setFilePath(path);

        const baseUrl = staticUrl.endsWith("/") ? staticUrl.slice(0, -1) : staticUrl;
        setFileList([
          {
            uid: uploaded.id,
            name: uploaded.tenTaiLieu,
            status: "done",
            url: `${baseUrl}${path}`,
          },
        ]);
        form.setFieldsValue({ image: path });
        message.success("Tải lên ảnh thành công");
      }
    } catch (error) {
      console.error(error);
      message.error("Tải lên ảnh thất bại");
    }
  };

  const handleOnFinish: FormProps<BannerRequest>["onFinish"] = async (
    formData: BannerRequest,
  ) => {
    try {
      const payload = { ...formData };
      if (filePath) {
        payload.image = filePath;
      }

      if (payload.image && !payload.image.startsWith("http") && !payload.image.startsWith("/")) {
        payload.image = "/" + payload.image;
      }

      if (!payload.image) {
        message.error("Vui lòng tải lên hoặc điền đường dẫn ảnh banner");
        return;
      }

      if (props.bannerItem) {
        const response = await bannerService.createOrUpdate({
          ...payload,
          id: props.bannerItem.id,
        });
        if (response.status) {
          message.success("Chỉnh sửa banner thành công");
          form.resetFields();
          setFileList([]);
          setFilePath("");
          props.onSuccess();
          props.onClose();
        } else {
          message.error(response.message || "Chỉnh sửa banner thất bại");
        }
      } else {
        const response = await bannerService.createOrUpdate(payload);
        if (response.status) {
          message.success("Thêm mới banner thành công");
          form.resetFields();
          setFileList([]);
          setFilePath("");
          props.onSuccess();
          props.onClose();
        } else {
          message.error(response.message || "Thêm mới banner thất bại");
        }
      }
    } catch (error: any) {
      message.error("Có lỗi xảy ra: " + (error.message || error));
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    form.resetFields();
    setFileList([]);
    setFilePath("");
    props.onClose();
  };

  useEffect(() => {
    setIsOpen(props.isOpen);
    if (props.isOpen) {
      if (props.bannerItem) {
        let imageUrl = props.bannerItem.image;
        if (imageUrl && !imageUrl.startsWith("http") && !imageUrl.startsWith("/")) {
          imageUrl = "/" + imageUrl;
        }
        form.setFieldsValue({
          id: props.bannerItem.id,
          name: props.bannerItem.name,
          image: imageUrl,
          link: props.bannerItem.link,
          position: props.bannerItem.position || undefined,
          sortOrder: props.bannerItem.sortOrder,
          isActive: props.bannerItem.isActive,
        });
        if (imageUrl) {
          setFilePath(imageUrl);
          const isAbsolute = imageUrl.startsWith("http");
          const baseUrl = staticUrl.endsWith("/") ? staticUrl.slice(0, -1) : staticUrl;
          setFileList([
            {
              uid: "-1",
              name: "Hình ảnh hiện tại",
              status: "done",
              url: isAbsolute ? imageUrl : `${baseUrl}${imageUrl}`,
            },
          ]);
        }
      } else {
        form.resetFields();
        form.setFieldsValue({
          isActive: true,
          sortOrder: 1,
        });
        setFileList([]);
        setFilePath("");
      }
    }
  }, [props.isOpen, props.bannerItem]);

  return (
    <Modal
      title={props.bannerItem != null ? "Chỉnh sửa banner" : "Thêm mới banner"}
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
        name="formCreateUpdateBanner"
        onFinish={handleOnFinish}
        autoComplete="off"
        style={{ marginTop: 16 }}
      >
        {props.bannerItem && (
          <Form.Item<BannerRequest> name="id" hidden>
            <Input />
          </Form.Item>
        )}

        <Form.Item<BannerRequest>
          label="Tên banner"
          name="name"
          rules={[{ required: true, message: "Vui lòng nhập tên banner" }]}
        >
          <Input placeholder="Nhập tên mô tả cho banner..." maxLength={500} />
        </Form.Item>

        <Form.Item<BannerRequest>
          label="Đường dẫn ảnh (Image URL)"
          name="image"
          rules={[{ required: true, message: "Vui lòng tải lên ảnh hoặc nhập liên kết ảnh" }]}
          extra="Bạn có thể tải ảnh lên từ máy tính hoặc dán trực tiếp link ảnh (tuyệt đối) vào đây."
        >
          <Input
            placeholder="Đường dẫn ảnh tải lên sẽ tự động điền ở đây..."
            onChange={(e) => setFilePath(e.target.value)}
          />
        </Form.Item>

        <Form.Item label="Tải ảnh lên">
          <Upload
            fileList={fileList}
            maxCount={1}
            accept=".png,.jpg,.jpeg,.gif,.webp"
            beforeUpload={(file) => {
              handleUploadFile(file);
              return false;
            }}
            onRemove={() => {
              setFileList([]);
              setFilePath("");
              form.setFieldsValue({ image: "" });
            }}
          >
            <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
          </Upload>
        </Form.Item>

        <Form.Item<BannerRequest>
          label="Đường dẫn liên kết khi nhấn (Link)"
          name="link"
        >
          <Input placeholder="Ví dụ: /dich-vu, https://google.com..." maxLength={1000} />
        </Form.Item>

        <Form.Item<BannerRequest>
          label="Vị trí hiển thị"
          name="position"
          rules={[{ required: true, message: "Vui lòng chọn vị trí" }]}
        >
          <Select placeholder="Chọn vị trí hiển thị">
            <Select.Option value="SLIDE">Slide chính (Banner chính)</Select.Option>
            <Select.Option value="SIDEBAR">Cột bên (Sidebar)</Select.Option>
            <Select.Option value="FOOTER">Chân trang (Footer)</Select.Option>
            <Select.Option value="SLIDE_DEPT">Slide chính (Banner chính cho sở)</Select.Option>
          </Select>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item<BannerRequest>
              label="Thứ tự hiển thị"
              name="sortOrder"
              rules={[{ required: true, message: "Vui lòng nhập thứ tự" }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item<BannerRequest>
              label="Trạng thái hoạt động"
              name="isActive"
              rules={[{ required: true }]}
            >
              <Select style={{ width: "100%" }}>
                <Select.Option value={true}>Hoạt động</Select.Option>
                <Select.Option value={false}>Tạm ngưng</Select.Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CreateOrUpdate;
