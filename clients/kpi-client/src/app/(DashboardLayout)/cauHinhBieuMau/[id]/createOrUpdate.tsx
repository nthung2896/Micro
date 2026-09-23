"use client";

import { BCFormTemplateType } from "@/types/bcFormTemplate/dto";
import { BCFormTemplateRequest } from "@/types/bcFormTemplate/request";
import bcFormTemplateService from "@/services/bcFormTemplate/bcFormTemplate.service";
import SingleFileUploader from "@/components/upload-file/SingleFileUploader";
import FileCategoryConstant from "@/constants/FileCategoryConstant";
import LoaiTaiLieuConstant from "@/constants/LoaiTaiLieuConstant";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";
import { Modal, Form, Input, Select, Row, Col, message } from "antd";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

interface Props {
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
  idBaoCao: string;
  data?: BCFormTemplateType;
}

const CreateOrUpdate: React.FC<Props> = ({
  isOpen,
  onSuccess,
  onClose,
  idBaoCao,
  data,
}) => {
  const [form] = Form.useForm<BCFormTemplateRequest>();
  const [templateId, setTemplateId] = useState<string>("");
  const [templateFileObj, setTemplateFileObj] =
    useState<TaiLieuDinhKemType | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const isEdit = !!data;

  useEffect(() => {
    if (isOpen) {
      if (data) {
        setTemplateId(data.itemId || data.id || "");
        setSubmitting(true);
        bcFormTemplateService
          .get(data.id || "")
          .then((res) => {
            const detail = res.data;
            if (detail) {
              setTemplateId(detail.itemId || detail.id || "");
              form.setFieldsValue({
                id: detail.id,
                idBaoCao: detail.idBaoCao,
                name: detail.name || "",
                doiTuongTypes: detail.doiTuongTypes || [],
                templateFilePath: detail.templateFilePath || "",
                huongTrang: detail.huongTrang || "PORTRAIT",
              });

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
            message.error("Lỗi lấy thông tin form template");
          })
          .finally(() => {
            setSubmitting(false);
          });
      } else {
        const newUuid = uuidv4();
        setTemplateId(newUuid);
        form.resetFields();
        form.setFieldsValue({
          idBaoCao: idBaoCao,
          doiTuongTypes: [],
          huongTrang: "PORTRAIT",
        });
        setTemplateFileObj(null);
      }
    }
  }, [isOpen, data, form, idBaoCao]);

  const handleSubmit = async (values: BCFormTemplateRequest) => {
    if (!templateFileObj?.duongDanFile) {
      message.error("Vui lòng tải lên file template mẫu");
      return;
    }

    setSubmitting(true);
    try {
      const payload: BCFormTemplateRequest = {
        ...values,
        id: data?.id,
        idBaoCao: idBaoCao,
        templateFilePath: templateFileObj.duongDanFile,
        itemId: templateId,
      };

      const response = isEdit
        ? await bcFormTemplateService.update(payload)
        : await bcFormTemplateService.create(payload);

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
      title={isEdit ? "Chỉnh sửa template form" : "Thêm mới template form"}
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
              label="Tên template form"
              name="name"
              rules={[
                { required: true, message: "Vui lòng nhập tên template form" },
              ]}
            >
              <Input placeholder="Nhập tên template form" />
            </Form.Item>
          </Col>
          {/* <Col span={24}>
            <Form.Item
              label="Đối tượng áp dụng"
              name="doiTuongTypes"
              rules={[{ required: true, message: "Vui lòng chọn đối tượng áp dụng" }]}
            >
              <Select
                mode="multiple"
                placeholder="Chọn đối tượng áp dụng"
                options={[
                  { label: "Doanh nghiệp", value: "DOANH_NGHIEP" },
                  { label: "Hợp tác xã", value: "HTX" },
                  { label: "Hộ kinh doanh", value: "HO_KINH_DOANH" },
                ]}
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Hướng trang" name="huongTrang">
              <Select
                options={[
                  { label: "Trang dọc", value: "PORTRAIT" },
                  { label: "Trang ngang", value: "LANDSCAPE" },
                ]}
              />
            </Form.Item>
          </Col> */}
          <Col span={12}>
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
