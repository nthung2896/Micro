import {
  Col,
  Form,
  FormProps,
  Input,
  Modal,
  Row,
  Select,
  message,
} from "antd";
import "react-quill-new/dist/quill.snow.css";
import React, {
  ForwardedRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import { useForm } from "antd/es/form/Form";
import duLieuDanhMucService from "@/services/duLieuDanhMuc/duLieuDanhMuc.service";
import mauTraLoiService from "@/services/mauTraLoi/mauTraLoi.service";
import { MauTraLoiType } from "@/types/mauTraLoi/dto";
import { MauTraLoiRequestType } from "@/types/mauTraLoi/request";
import { DropdownOption } from "@/types/general";

const QuillEditor = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");

    const QuillComponent = React.forwardRef(
      (props: any, ref: ForwardedRef<any>) => <RQ ref={ref} {...props} />,
    );

    QuillComponent.displayName = "QuillComponent";

    return QuillComponent;
  },
  {
    ssr: false,
  },
);

interface Props {
  isOpen: boolean;
  data?: MauTraLoiType | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateOrUpdate: React.FC<Props> = ({ isOpen, data, onClose, onSuccess }) => {
  const [form] = useForm<MauTraLoiRequestType>();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [typeDropdown, setTypeDropdown] = useState<DropdownOption[]>([]);
  const [nhomDropdown, setNhomDropdown] = useState<DropdownOption[]>([]);
  const [editorValue, setEditorValue] = useState<string>("");

  const toolbarOptions = [
    ["bold", "italic", "underline", "strike"],
    ["blockquote", "code-block"],
    ["link", "image", "video"],
    [{ header: 1 }, { header: 2 }],
    [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
    [{ script: "sub" }, { script: "super" }],
    [{ indent: "-1" }, { indent: "+1" }],
    [{ direction: "rtl" }],
    [{ size: ["small", false, "large", "huge"] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ color: [] }, { background: [] }],
    [{ font: [] }],
    [{ align: [] }],
    ["clean"],
  ];

  const modules = useMemo(
    () => ({
      toolbar: toolbarOptions,
    }),
    [],
  );

  const loadDropdowns = async () => {
    try {
      const [typeRes, nhomRes] = await Promise.all([
        duLieuDanhMucService.getDropdownCode("LOAITAILIEUTRALOI"),
        duLieuDanhMucService.getDropdownCode("NHOMTAILIEUMAUTRALOI"),
      ]);

      if (typeRes?.status && typeRes.data) {
        setTypeDropdown(typeRes.data);
      }
      if (nhomRes?.status && nhomRes.data) {
        setNhomDropdown(nhomRes.data);
      }
    } catch (err) {
      console.error("Lỗi khi load danh mục:", err);
    }
  };

  const handleOnFinish = async (formData: MauTraLoiRequestType) => {
    formData.content = editorValue;
    if (!formData.content || formData.content.trim() === "" || formData.content === "<p><br></p>") {
      message.error("Vui lòng nhập nội dung mẫu trả lời!");
      return;
    }

    setSubmitting(true);
    try {
      if (data?.id) {
        formData.id = data.id;
        const response = await mauTraLoiService.update(formData);
        if (response.status) {
          message.success("Cập nhật mẫu trả lời sẵn thành công!");
          onSuccess();
          onClose();
        } else {
          message.error(response.message || "Cập nhật thất bại");
        }
      } else {
        const response = await mauTraLoiService.create(formData);
        if (response.status) {
          message.success("Thêm mới mẫu trả lời sẵn thành công!");
          onSuccess();
          onClose();
        } else {
          message.error(response.message || "Thêm mới thất bại");
        }
      }
    } catch (error: any) {
      message.error("Có lỗi xảy ra: " + (error.message || error));
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    loadDropdowns();
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (data) {
        form.setFieldsValue({
          id: data.id,
          name: data.name,
          type: data.type,
          nhomTaiLieu: data.nhomTaiLieu,
        });
        setEditorValue(data.content || "");
      } else {
        form.resetFields();
        setEditorValue("");
      }
    }
  }, [isOpen, data]);

  return (
    <Modal
      title={
        <div style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", borderBottom: "1px solid #f1f5f9", paddingBottom: 12 }}>
          {data != null ? "Chỉnh sửa Mẫu trả lời sẵn" : "Thêm mới Mẫu trả lời sẵn"}
        </div>
      }
      open={isOpen}
      onOk={() => form.submit()}
      onCancel={onClose}
      okText="Xác nhận"
      cancelText="Đóng"
      confirmLoading={submitting}
      width="60%"
      centered
      okButtonProps={{
        style: { borderRadius: 6, fontWeight: 600 }
      }}
      cancelButtonProps={{
        style: { borderRadius: 6 }
      }}
    >
      <Form
        layout="vertical"
        form={form}
        name="formMauTraLoiCreateUpdate"
        onFinish={handleOnFinish}
        autoComplete="off"
        style={{ marginTop: 16 }}
      >
        {data?.id && (
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
        )}

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item<MauTraLoiRequestType>
              label="Tên tiêu đề mẫu"
              name="name"
              rules={[
                { required: true, message: "Vui lòng nhập tên tiêu đề!" },
                { max: 500, message: "Tên tiêu đề không vượt quá 500 ký tự!" }
              ]}
            >
              <Input placeholder="Nhập tên tiêu đề mẫu trả lời sẵn" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item<MauTraLoiRequestType>
              label="Loại hồ sơ"
              name="type"
              rules={[{ required: true, message: "Vui lòng chọn loại hồ sơ!" }]}
            >
              <Select
                placeholder="Chọn loại hồ sơ"
                options={typeDropdown.map(item => ({
                  value: item.value,
                  label: item.label
                }))}
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item<MauTraLoiRequestType>
              label="Nhóm tài liệu"
              name="nhomTaiLieu"
              rules={[{ required: true, message: "Vui lòng chọn nhóm tài liệu!" }]}
            >
              <Select
                placeholder="Chọn nhóm tài liệu"
                options={nhomDropdown.map(item => ({
                  value: item.value,
                  label: item.label
                }))}
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Nội dung mẫu trả lời sẵn" required>
              <div style={{ border: "1px solid #d9d9d9", borderRadius: 6, overflow: "hidden" }}>
                <QuillEditor
                  theme="snow"
                  value={editorValue}
                  onChange={setEditorValue}
                  modules={modules}
                  style={{ height: 260 }}
                />
              </div>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CreateOrUpdate;
