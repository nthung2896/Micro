"use client";

import {
  Col,
  Form,
  Input,
  Row,
  message,
  DatePicker,
  Button,
  Card,
  Spin,
  Select,
  Affix,
  Space
} from "antd";
import React, { useEffect, useState, ForwardedRef, useMemo } from "react";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useRouter, useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

import legalDocumentService from "@/services/legalDocument/legalDocument.service";
import { LegalDocumentCreateRequest } from "@/types/legalDocument";
import duLieuDanhMucService from "@/services/duLieuDanhMuc/duLieuDanhMuc.service";
import FileCategoryConstant from "@/constants/FileCategoryConstant";
import { DropdownOption } from "@/types/general";
import AutoBreadcrumb from "@/components/util-compenents/Breadcrumb";
import Flex from "@/components/shared-components/Flex";
import SingleFileUploader from "@/components/upload-file/SingleFileUploader";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";
import taiLieuDinhKemService from "@/services/taiLieuDinhKem/taiLieuDinhKem.service";

const generateGuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const QuillEditor = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    const QuillComponent = React.forwardRef(
      (props: any, ref: ForwardedRef<any>) => <RQ ref={ref} {...props} />,
    );
    QuillComponent.displayName = "QuillComponent";
    return QuillComponent;
  },
  { ssr: false }
);

const CreateOrUpdatePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [form] = Form.useForm<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [recordId] = useState<string>(() => id || generateGuid());
  const [file, setFile] = useState<TaiLieuDinhKemType | null>(null);
  const [loaiHeThongDropdown, setLoaiHeThongDropdown] = useState<DropdownOption[]>([]);
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

  const modules = useMemo(() => ({ toolbar: toolbarOptions }), []);

  useEffect(() => {
    duLieuDanhMucService.getDropdownCode("LOAIHETHONGVANBAN").then((res) => {
      if (res?.status && res.data) {
        setLoaiHeThongDropdown(res.data);
      }
    });
  }, []);

  useEffect(() => {
    const initForm = async () => {
      setPageLoading(true);

      if (id) {
        try {
          const res = await legalDocumentService.getById(id);
          if (res?.status && res.data) {
            const fetchedData = res.data;
            form.setFieldsValue({
              ...fetchedData,
              publicDate: fetchedData.publicDate ? dayjs(fetchedData.publicDate) : undefined,
              activedDate: fetchedData.activedDate ? dayjs(fetchedData.activedDate) : undefined,
              expiredDate: fetchedData.expiredDate ? dayjs(fetchedData.expiredDate) : undefined,
            });
            setEditorValue(fetchedData.content || "");

            // if (fetchedData.dinhKem && fetchedData.dinhKem.length > 0) {
            //   const mainFile = fetchedData.dinhKem[0];
            //   setFile({
            //     id: mainFile.id,
            //     tenTaiLieu: mainFile.tenTaiLieu || "Tài liệu đính kèm",
            //     duongDanFile: mainFile.duongDanFile || "",
            //     extension: mainFile.extension || "",
            //     isXoaFile: false,
            //     tenTaiLieuText: mainFile.tenTaiLieu || "Tài liệu đính kèm",
            //     duongDanFilePDF: "",
            //   } as any);
            // }
          }
        } catch (e) {
          console.error("Lỗi khi tải thông tin văn bản:", e);
          message.error("Không thể tải thông tin văn bản pháp lý!");
        }
      } else {
        form.resetFields();
        form.setFieldsValue({ status: "Draft" });
        setEditorValue("");
        setFile(null);
      }
      setPageLoading(false);
    };

    initForm();
  }, [id, form]);

  const handleFillTestData = () => {
    form.setFieldsValue({
      code: "12/2026/QH16",
      loaiVanBan: "Luật",
      loaiHeThong: loaiHeThongDropdown.length > 0 ? loaiHeThongDropdown[0].value : undefined,
      publicDate: dayjs(),
      activedDate: dayjs(),
      expiredDate: dayjs().add(5, "year"),
      publicBy: "Quốc hội nước CHXHCN Việt Nam",
      signedBy: "Chủ tịch nước",
      status: "Draft",
      description: "Trích yếu: Luật Giao dịch điện tử năm 2026 quy định về các hoạt động giao dịch được thực hiện bằng phương tiện điện tử.",
    });
    setEditorValue("<h3>Nội dung chi tiết Luật Giao dịch điện tử 2026:</h3><p>Điều 1. Phạm vi điều chỉnh...</p><p>Điều 2. Đối tượng áp dụng...</p>");
    message.success("Đã điền dữ liệu mẫu thành công!");
  };

  const onFinish = async (values: any) => {
    if (!file) {
      message.error("Vui lòng tải lên file đính kèm!");
      return;
    }

    setLoading(true);
    try {
      const payload: LegalDocumentCreateRequest = {
        ...values,
        id: recordId,
        document: file.duongDanFile,
        content: editorValue,
        publicDate: values.publicDate ? values.publicDate.toDate() : undefined,
        activedDate: values.activedDate ? values.activedDate.toDate() : undefined,
        expiredDate: values.expiredDate ? values.expiredDate.toDate() : undefined,
      };

      const response = id
        ? await legalDocumentService.update(payload)
        : await legalDocumentService.create(payload);

      if (response.status) {
        const finalItemId = (response.data as any)?.id || recordId;
        if (file?.id) {
          await taiLieuDinhKemService.updateFileItem({
            itemId: finalItemId,
            fileIds: [file.id],
          });
        }

        message.success(id ? "Cập nhật thành công!" : "Tạo mới thành công!");
        router.push("/LegalDocument");
      } else {
        message.error(response.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra trong quá trình lưu");
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: "Draft", label: "Bản nháp" },
    { value: "Approved", label: "Đã duyệt" },
    { value: "Removed", label: "Gỡ bỏ" },
  ];

  if (pageLoading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" tip="Đang tải dữ liệu văn bản..." />
      </div>
    );
  }

  return (
    <div style={{ padding: "0 8px" }}>
      <AutoBreadcrumb
        items={[
          { title: "Quản lý văn bản pháp lý", href: "/LegalDocument" },
          { title: id ? "Cập nhật văn bản" : "Thêm mới văn bản" }
        ]}
      />


      <Form
        layout="vertical"
        form={form}
        name="formLegalDocumentCreateUpdate"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Card
          title={
            <span style={{ fontSize: "16px", fontWeight: 700, color: "#1e3a8a" }}>
              📂 {id ? "Cập nhật văn bản pháp lý" : "Thêm mới văn bản pháp lý"}
            </span>
          }
          extra={
            <Affix offsetTop={100}>
              <Space>
                <Button icon={<ArrowLeftOutlined />} onClick={() => router.push("/LegalDocument")}>
                  Quay lại
                </Button>
                {/* <Button type="dashed" onClick={handleFillTestData}>
                  Điền dữ liệu mẫu
                </Button> */}
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
                  Lưu lại
                </Button>
              </Space>
            </Affix>
          }
          style={{ boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)", borderRadius: "10px" }}
        >
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                label="Số hiệu văn bản"
                name="code"
                rules={[{ required: true, message: "Vui lòng nhập số hiệu văn bản!" }]}
              >
                <Input placeholder="Nhập số hiệu văn bản..." />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Loại văn bản"
                name="loaiVanBan"
                rules={[{ required: true, message: "Vui lòng nhập loại văn bản!" }]}
              >
                <Input placeholder="Ví dụ: Luật, Nghị định, Thông tư..." />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Loại hệ thống"
                name="loaiHeThong"
                rules={[{ required: true, message: "Vui lòng chọn loại hệ thống!" }]}
              >
                <Select
                  placeholder="Chọn loại hệ thống"
                  options={loaiHeThongDropdown.map(item => ({
                    value: item.value,
                    label: item.label
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item label="Ngày ban hành" name="publicDate">
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="Chọn ngày ban hành" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Ngày có hiệu lực" name="activedDate">
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="Chọn ngày hiệu lực" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Ngày hết hạn" name="expiredDate">
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="Chọn ngày hết hạn" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item label="Cơ quan ban hành" name="publicBy">
                <Input placeholder="Nhập cơ quan ban hành..." />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Người ký" name="signedBy">
                <Input placeholder="Nhập người ký..." />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Trạng thái"
                name="status"
                rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
              >
                <Select placeholder="Chọn trạng thái" options={statusOptions} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Mô tả ngắn / Trích yếu" name="description">
                <Input.TextArea placeholder="Nhập mô tả trích yếu nội dung văn bản..." rows={3} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Tài liệu đính kèm (PDF)" required>
                <SingleFileUploader
                  value={file}
                  onChange={setFile}
                  category={FileCategoryConstant.General}
                  itemId={recordId}
                  loaiTaiLieu="LegalDocument_File"
                  taxCode="LegalDocument"

                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Nội dung văn bản chi tiết">
                <div style={{ border: "1px solid #d9d9d9", borderRadius: 6, overflow: "hidden" }}>
                  <QuillEditor
                    theme="snow"
                    value={editorValue}
                    onChange={setEditorValue}
                    modules={modules}
                    style={{ minHeight: 300 }}
                  />
                </div>
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </div>
  );
};

export default CreateOrUpdatePage;
