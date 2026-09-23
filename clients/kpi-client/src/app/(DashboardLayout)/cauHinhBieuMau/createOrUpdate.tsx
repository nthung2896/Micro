"use client";

import { BCBaoCaoType } from "@/types/bCBaoCao/dto";
import { BCBaoCaoRequestType } from "@/types/bCBaoCao/request";
import bcBaoCaoService from "@/services/bcBaoCao/bcBaoCao.service";
import SingleFileUploader from "@/components/upload-file/SingleFileUploader";
import FileCategoryConstant from "@/constants/FileCategoryConstant";
import LoaiTaiLieuConstant from "@/constants/LoaiTaiLieuConstant";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";
import { Modal, Form, Input, Row, Col, message } from "antd";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface Props {
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
  data?: BCBaoCaoType;
}

const CreateOrUpdate: React.FC<Props> = ({
  isOpen,
  onSuccess,
  onClose,
  data,
}) => {
  const [form] = Form.useForm<BCBaoCaoRequestType>();
  const [templateId, setTemplateId] = useState<string>("");
  const [templateFileObj, setTemplateFileObj] =
    useState<TaiLieuDinhKemType | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const isEdit = !!data;

  useEffect(() => {
    if (isOpen) {
      if (data) {
        setSubmitting(true);
        bcBaoCaoService
          .get(data.id || "")
          .then((res) => {
            const detail = res.data;
            if (detail) {
              form.setFieldsValue({
                id: detail.id,
                name: detail.name || "",
                description: detail.description || "",
                itemId: detail.itemId || "",
                templateFilePath: detail.templateFilePath || "",
              });
              setTemplateId(detail.itemId || detail.id || "");
              if (detail.templateFilePath) {
                const fileName =
                  detail.templateFilePath.split("/").pop() || "Template File";
                const parts = detail.templateFilePath.split("/");
                const fileIdIndex = parts.indexOf("fileserver") + 1;
                const fileId =
                  fileIdIndex > 0 && fileIdIndex < parts.length
                    ? parts[fileIdIndex]
                    : "";

                setTemplateFileObj({
                  id: fileId || detail.itemId || detail.id || "",
                  tenTaiLieu: fileName,
                  duongDanFile: detail.templateFilePath,
                  duongDanFilePDF: "",
                  extension: detail.templateFilePath.split(".").pop() || "",
                  tenTaiLieuText: fileName,
                  isXoaFile: false,
                });
              } else {
                setTemplateFileObj(null);
              }
            }
          })
          .catch(() => {
            message.error("Lỗi lấy thông tin biểu mẫu báo cáo");
          })
          .finally(() => {
            setSubmitting(false);
          });
      } else {
        const newUuid = uuidv4();
        setTemplateId(newUuid);
        form.resetFields();
        setTemplateFileObj(null);
      }
    }
  }, [isOpen, data, form]);

  const handleSubmit = async (values: BCBaoCaoRequestType) => {
    setSubmitting(true);
    try {
      const payload: BCBaoCaoRequestType = {
        ...values,
        id: isEdit ? data!.id : undefined,
        itemId: templateId,
        templateFilePath: templateFileObj?.duongDanFile || undefined,
      };

      const response = isEdit
        ? await bcBaoCaoService.update(payload)
        : await bcBaoCaoService.create(payload);

      if (response.status) {
        message.success(isEdit ? "Cập nhật thành công" : "Thêm mới thành công");
        form.resetFields();
        onSuccess();
      } else {
        message.error(response.message || "Lưu dữ liệu thất bại");
      }
    } catch (error) {
      message.error("Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        isEdit ? "Chỉnh sửa biểu mẫu báo cáo" : "Thêm mới biểu mẫu báo cáo"
      }
      open={isOpen}
      onOk={() => form.submit()}
      onCancel={onClose}
      okText="Xác nhận"
      cancelText="Đóng"
      width={600}
      destroyOnClose
      confirmLoading={submitting}
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Tên biểu mẫu báo cáo"
              name="name"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên biểu mẫu báo cáo",
                },
              ]}
            >
              <Input placeholder="Nhập tên biểu mẫu báo cáo" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Mô tả"
              name="description"
              rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
            >
              <Input.TextArea
                rows={4}
                placeholder="Mô tả chi tiết biểu mẫu báo cáo"
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="File template mẫu"
              required
              help="Định dạng: .doc, .docx"
            >
              <SingleFileUploader
                value={templateFileObj}
                onChange={setTemplateFileObj}
                category={FileCategoryConstant.General}
                loaiTaiLieu={LoaiTaiLieuConstant.BIEUMAUBAOCAO}
                itemId={templateId || "temp-template"}
                accept=".doc,.docx"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default CreateOrUpdate;
