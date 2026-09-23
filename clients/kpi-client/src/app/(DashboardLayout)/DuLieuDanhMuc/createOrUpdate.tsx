import { DropdownOptionTree } from "@/types/general";
import {
  Col,
  Form,
  FormProps,
  Input,
  Modal,
  Row,
  TreeSelect,
  message,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import React, {
  ForwardedRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
const StaticFileUrl = process.env.NEXT_PUBLIC_STATIC_FILE_BASE_URL;

import LoaiTaiLieuConstant from "@/constants/LoaiTaiLieuConstant";
import FileUploader from "@/libs/file-uploader";
import fileServerService from "@/libs/file-uploader/fileServer.service";
import duLieuDanhMucService from "@/services/duLieuDanhMuc/duLieuDanhMuc.service";
import { DM_DuLieuDanhMucType } from "@/types/dM_DuLieuDanhMuc/dto";
import { DM_DuLieuDanhMucRequestType } from "@/types/dM_DuLieuDanhMuc/request";
import dynamic from "next/dynamic";

const QuillEditor = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");

    const QuillComponent = React.forwardRef(
      (props: any, ref: ForwardedRef<any>) => <RQ ref={ref} {...props} />,
    );

    QuillComponent.displayName = "QuillComponent"; // Đặt displayName để tránh lỗi

    return QuillComponent;
  },
  {
    ssr: false,
  },
);

interface Props {
  isOpen: boolean;
  groupId: string;
  DuLieuDanhMuc?: DM_DuLieuDanhMucType | null;
  onClose: () => void;
  onSuccess: () => void;
  departmentDropdown: DropdownOptionTree[];
}

const toUppercaseSlug = (str: string) => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
};

const CreateOrUpdate: React.FC<Props> = (props: Props) => {
  const [form] = Form.useForm();
  const [isOpen, setIsOpen] = useState<boolean>(props.isOpen);

  const [editorValue, setEditorValue] = useState<string>("");
  const [isCodeManuallyEdited, setIsCodeManuallyEdited] = useState<boolean>(false);
  const quillRef = useRef<any>(null);
  const toolbarOptions = [
    ["bold", "italic", "underline", "strike"], // toggled buttons
    ["blockquote", "code-block"],
    ["link", "image", "video", "formula"],

    [{ header: 1 }, { header: 2 }], // custom button values
    [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
    [{ script: "sub" }, { script: "super" }], // superscript/subscript
    [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
    [{ direction: "rtl" }], // text direction

    [{ size: ["small", false, "large", "huge"] }], // custom dropdown
    [{ header: [1, 2, 3, 4, 5, 6, false] }],

    [{ color: [] }, { background: [] }], // dropdown with defaults from theme
    [{ font: [] }],
    [{ align: [] }],

    ["clean"], // remove formatting button
  ];
  const imageHandler = () => {
    const input = document.createElement("input");

    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      if (!input.files) return;
      const file = input.files[0];
      const formData = new FormData();
      formData.append("Files", file);
      formData.append("FileType", "QuillImage");
      try {
        const response = await fileServerService.upload(formData);
        // if (response.status) {
        //   const imageUrl = `${StaticFileUrl}${response.data[0].duongDanFile}`;
        //   const editor = quillRef.current.editor;
        //   const range = quillRef.current.selection;
        //   if (editor) {
        //     if (range) {
        //       editor.insertEmbed(range.index, "image", imageUrl);
        //     }
        //   }
        // } else {
        //   message.error("Lỗi khi upload file");
        // }
      } catch (error) {
        console.error("Upload failed:", error);
      }
    };
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: toolbarOptions,
        handlers: {
          image: imageHandler, // Gán hàm xử lý ảnh
        },
      },
    }),
    [],
  );

  const fileUploader = FileUploader.useFileUploader({
    maxCount: 1,
    FileType: LoaiTaiLieuConstant.FileDuLieuDanhMuc as any,
    initFiles: [],
  });
  const handleChangeEditor = (value: string) => {
    setEditorValue(value); // Update editor value on change
  };

  const handleOnFinish: FormProps<DM_DuLieuDanhMucRequestType>["onFinish"] =
    async (formData: DM_DuLieuDanhMucRequestType) => {
      const fileIds = fileUploader.getFileIds();
      if (fileIds.length > 0) {
        formData.fileId = fileIds[0];
      }
      try {
        if (props.DuLieuDanhMuc) {
          const response = await duLieuDanhMucService.update(formData);
          if (response.status) {
            message.success("Chỉnh sửa danh mục thành công");
            form.resetFields();
            props.onSuccess();
            props.onClose();
          } else {
            message.error(response.message);
          }
        } else {
          const response = await duLieuDanhMucService.create(formData);
          if (response.status) {
            message.success("Thêm mới danh mục thành công");
            form.resetFields();
            props.onSuccess();
            props.onClose();
          } else {
            message.error(response.message);
          }
        }
      } catch (error) {
        message.error("Có lỗi xảy ra: " + error);
      }
    };

  const handleMapEdit = () => {
    form.setFieldsValue({
      id: props.DuLieuDanhMuc?.id,
      groupId: props.groupId,
      name: props.DuLieuDanhMuc?.name,
      code: props.DuLieuDanhMuc?.code,
      priority: props.DuLieuDanhMuc?.priority,
      note: props.DuLieuDanhMuc?.note,
      donViId: props.DuLieuDanhMuc?.donViId,
      noiDung: props.DuLieuDanhMuc?.noiDung,
    });
  };

  const handleCancel = () => {
    setIsOpen(false);
    form.resetFields();
    props.onClose();
  };

  useEffect(() => {
    setIsOpen(props.isOpen);

    if (props.DuLieuDanhMuc) {
      fileUploader.setFilesByItemId(props.DuLieuDanhMuc.id || "");
      handleMapEdit();
      setIsCodeManuallyEdited(true);
    } else {
      fileUploader.setFiles([]);
      setIsCodeManuallyEdited(false);
    }
  }, [props.isOpen]);

  return (
    <Modal
      title={
        props.DuLieuDanhMuc != null ? "Chỉnh sửa danh mục" : "Thêm mới danh mục"
      }
      open={isOpen}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      okText="Xác nhận"
      cancelText="Đóng"
      width="50%"
    >
      <Form
        layout="vertical"
        form={form}
        name="formCreateUpdate"
        onFinish={handleOnFinish}
        autoComplete="off"
      >
        {props.DuLieuDanhMuc && (
          <Form.Item<DM_DuLieuDanhMucRequestType> name="id" hidden>
            <Input />
          </Form.Item>
        )}
        {props.groupId && (
          <Form.Item<DM_DuLieuDanhMucRequestType>
            name="groupId"
            hidden
            initialValue={props.groupId}
          >
            <Input />
          </Form.Item>
        )}
        {
          <>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item<DM_DuLieuDanhMucRequestType>
                  label="Mã danh mục"
                  name="code"
                  rules={[
                    { required: true, message: "Vui lòng nhập thông tin này!" },
                  ]}
                >
                  <Input onChange={() => setIsCodeManuallyEdited(true)} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item<DM_DuLieuDanhMucRequestType>
                  label="Tên danh mục"
                  name="name"
                  rules={[
                    { required: true, message: "Vui lòng nhập thông tin này!" },
                  ]}
                >
                  <Input
                    onChange={(e) => {
                      if (!isCodeManuallyEdited) {
                        const generatedCode = toUppercaseSlug(e.target.value);
                        form.setFieldsValue({ code: generatedCode });
                      }
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item<DM_DuLieuDanhMucRequestType>
                  label="Thứ tự"
                  name="priority"
                >
                  <Input type="number" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item<DM_DuLieuDanhMucRequestType>
                  label="Đơn vị"
                  name="donViId"
                >
                  {/* <Input placeholder="Phòng ban"/> */}
                  <TreeSelect
                    showSearch
                    style={{ width: "100%" }}
                    value={props.DuLieuDanhMuc?.donViId}
                    dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                    placeholder="Chọn đơn vị"
                    allowClear
                    treeDefaultExpandAll
                    treeData={props.departmentDropdown}
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item<DM_DuLieuDanhMucRequestType>
                  label="Ghi chú"
                  name="note"
                >
                  <TextArea />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item<DM_DuLieuDanhMucRequestType> label="File đính kèm">
                  <FileUploader controller={fileUploader} />
                </Form.Item>
              </Col>
            </Row>
          </>
        }
      </Form>
    </Modal>
  );
};
export default CreateOrUpdate;
