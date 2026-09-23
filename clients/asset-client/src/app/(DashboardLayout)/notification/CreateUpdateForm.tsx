"use client";

import "react-quill/dist/quill.snow.css";

import React, {
  ForwardedRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import { Form, Input, Modal, Row, Col, Select, Checkbox, message } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import type { ReactQuillProps } from "react-quill";
import { DropdownOption } from "@/types/general";
import { uploadFileService } from "@/services/common/uploadFile.service";
import notificationService from "@/services/notification/notification.service";
import FileUploader from "@/components/upload-file/FileUploader";
import { NotificationType as Notification } from "@/types/notification/dto";

const StaticFileUrl = process.env.NEXT_PUBLIC_STATIC_FILE_BASE_URL ?? "";

const defaultData = {
  message: "",
  link: "",
  isRead: false,
  type: "",
  itemName: "",
  itemType: "",
  createdDate: "",
  toUser: "",
  fromUser: "",
  tieuDe: "",
  noiDung: "",
  isXuatBan: false,
};

interface Props {
  isOpen: boolean;
  data?: Notification;
  dropdownUser?: DropdownOption[];
  onClose: () => void;
  onSuccess: () => void;
}

const QuillEditor = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill");

    const QuillComponent = ({
      forwardedRef,
      ...props
    }: ReactQuillProps & { forwardedRef?: ForwardedRef<any> }) => {
      return <RQ ref={forwardedRef} {...props} />;
    };

    QuillComponent.displayName = "QuillComponent";
    return QuillComponent;
  },
  { ssr: false },
);

const buildFileUrl = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${StaticFileUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
};

const CreateUpdateForm: React.FC<Props> = ({
  isOpen,
  data,
  dropdownUser,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadedData, setUploadedData] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const quillRef = useRef<any>(null);

  const noiDungValue = Form.useWatch("noiDung", form) || "";

  const uploadController = FileUploader.useFileUploader({
    maxCount: 1,
    FileType: "FileNotification",
    listType: "text",
  });

  const toolbarOptions = [
    ["bold", "italic", "underline", "strike"],
    ["blockquote", "code-block"],
    ["link", "image", "video"],
    [{ header: 1 }, { header: 2 }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ size: ["small", false, "large", "huge"] }],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    ["clean"],
  ];

  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      if (!input.files || input.files.length === 0) return;

      const file = input.files[0];
      const formData = new FormData();
      formData.append("Files", file);
      formData.append("FileType", "QuillImage");

      try {
        const response = await uploadFileService.upload(formData);

        if (!response.status || !response.data?.length) {
          message.error("Lỗi khi upload ảnh");
          return;
        }

        const imageUrl = buildFileUrl(response.data[0].duongDanFile);
        const editor = quillRef.current?.getEditor?.();

        if (!editor) return;

        const range = editor.getSelection(true);
        const index = range ? range.index : editor.getLength();

        editor.insertEmbed(index, "image", imageUrl);
        editor.setSelection(index + 1);
      } catch (error) {
        console.error("Upload failed:", error);
        message.error("Upload ảnh thất bại");
      }
    };
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: toolbarOptions,
        handlers: {
          image: imageHandler,
        },
      },
    }),
    [],
  );
  const fixPath = (path: string) => {
    return path.replace(/(\.[a-zA-Z]+)0$/, "$1");
  };
  const handleFinish = async () => {
    try {
      const values = await form.validateFields();

      const param: any = {
        ...values,
        fileDinhKem:
          uploadController.uploadFileList.length > 0
            ? uploadController.uploadFileList[0].uid
            : data?.id || "",
      };
      setSubmitting(true);

      if (data?.id) {
        const response = await notificationService.update({
          ...param,
          id: data.id,
          link: data.link || "#",
          type: data.type || "Manual",
          itemName: data.itemName || "Thông báo",
          loaiThongBao: data.loaiThongBao || "Website",
          isRead: data.isRead ?? false,
          fileDinhKem: fixPath(param.fileDinhKem),
        });

        if (response.status) {
          message.success("Cập nhật thông báo thành công");
          form.resetFields();
          setFileList([]);
          setUploadedData([]);
          onSuccess();
          onClose();
        } else {
          message.error(response.message || "Cập nhật thất bại");
        }
      } else {
        console.log("param", param);
        const response = await notificationService.create({
          ...param,
          link: "#",
          type: "Manual",
          itemName: "Thông báo",
          loaiThongBao: "Website",
          isRead: false,
        });

        if (response.status) {
          message.success("Thêm mới thông báo thành công");
          form.resetFields();
          setFileList([]);
          setUploadedData([]);
          onSuccess();
          onClose();
        } else {
          message.error(response.message || "Thêm mới thất bại");
        }
      }
    } catch (error: any) {
      console.error(error);
      if (error?.errorFields) return;
      message.error("Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    setUploadedData([]);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;

    if (data) {
      console.log("data.fromUser", data.fromUser);
      console.log("data.toUser", data.toUser);
      console.log("dropdownUser", dropdownUser);
      console.log(
        "data",
        data.fileDinhKem
          ? buildFileUrl(data.fileDinhKem)
          : "Không có file đính kèm",
      );
      form.setFieldsValue({
        fromUser: data.fromUser || undefined,
        toUser: data.toUser || undefined,
        email: data.email || "",
        tieuDe: data.tieuDe || "",
        message: data.message || "",
        noiDung: data.noiDung || "",
        isXuatBan: data.isXuatBan ?? false,
      });
      console.log("fileList", fileList);
      if (data.fileDinhKem) {
        uploadController.setFiles([
          {
            id: data.fileDinhKem.split("/").pop()?.split("_")[0],
            duongDanFile: fixPath(data.fileDinhKem),
            tenTaiLieu: data.fileDinhKem
              .split("/")
              .pop()
              ?.split("_")
              .slice(1)
              .join("_"),
            extension: data.fileDinhKem.split(".").pop() || "",
          } as any,
        ]);
        console.log("uploadController.uploadFileList", uploadController.files);
        console.log("data.fileDinhKem", data.fileDinhKem);
        console.log(
          "uploadController.uploadFileList",
          uploadController.uploadFileList,
        );
        setUploadedData([data.fileDinhKem]);
      } else {
        setFileList([]);
        setUploadedData([]);
      }
    } else {
      form.setFieldsValue(defaultData);
      setFileList([]);
      setUploadedData([]);
    }
  }, [data, isOpen, form]);

  return (
    <Modal
      title={
        <div style={{ textAlign: "center", fontWeight: 600 }}>
          {data ? "Chỉnh sửa thông báo" : "Thêm mới thông báo"}
        </div>
      }
      open={isOpen}
      onOk={handleFinish}
      onCancel={handleCancel}
      okText="Lưu"
      cancelText="Đóng"
      width={900}
      centered
      confirmLoading={submitting}
      destroyOnClose
    >
      <Form layout="vertical" form={form} autoComplete="off">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label={<strong>Người gửi</strong>}
              name="fromUser"
              rules={[{ required: true, message: "Vui lòng chọn người gửi!" }]}
            >
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                placeholder="Chọn người gửi"
                options={dropdownUser?.map((item) => ({
                  value: item.value,
                  label: item.label,
                }))}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label={<strong>Người nhận</strong>}
              name="toUser"
              rules={[{ required: true, message: "Vui lòng chọn người nhận!" }]}
            >
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                placeholder="Chọn người nhận"
                options={dropdownUser?.map((item) => ({
                  value: item.value,
                  label: item.label,
                }))}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={<strong>Email người nhận</strong>}
              name="email"
              rules={[
                {
                  type: "email",
                  message: "Vui lòng nhập đúng định dạng email",
                },
              ]}
            >
              <Input placeholder="Nhập email người nhận" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label={<strong>Tiêu đề</strong>}
              name="tieuDe"
              rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
            >
              <Input placeholder="Nhập tiêu đề" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label={<strong>Thông báo ngắn</strong>}
              name="message"
              rules={[
                { required: true, message: "Vui lòng nhập thông báo ngắn!" },
              ]}
            >
              <Input placeholder="Nhập thông báo tiêu đề" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label={<strong>Xuất bản</strong>}
              name="isXuatBan"
              valuePropName="checked"
            >
              <Checkbox />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label={<strong>Nội dung</strong>}
              name="noiDung"
              rules={[{ required: true, message: "Vui lòng nhập nội dung!" }]}
            >
              <div style={{ minHeight: 350 }}>
                <QuillEditor
                  forwardedRef={quillRef}
                  modules={modules}
                  theme="snow"
                  placeholder="Nhập nội dung..."
                  value={noiDungValue}
                  onChange={(value) => form.setFieldValue("noiDung", value)}
                  style={{ minHeight: 300 }}
                />
              </div>
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            <Form.Item label={<strong>File đính kèm</strong>}>
              <FileUploader controller={uploadController} />
              {/* 
              {fileList.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <a href={fileList[0].url} target="_blank" rel="noreferrer">
                    {fileList[0].name}
                  </a>
                </div>
              )} */}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CreateUpdateForm;
