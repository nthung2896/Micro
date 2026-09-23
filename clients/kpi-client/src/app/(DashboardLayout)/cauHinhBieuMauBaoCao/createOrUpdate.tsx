"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  message,
  Spin,
  Row,
  Col,
  Switch,
} from "antd";
import { v4 as uuidv4 } from "uuid";
import bcBaoCaoService from "@/services/bcBaoCao/bcBaoCao.service";
import bcSubmissionService from "@/services/bcSubmission/bcSubmission.service";
import RichTextEditor from "@/components/shared-components/RichTextEditor";
import SingleFileUploader from "@/components/upload-file/SingleFileUploader";
import { BCBaoCaoType } from "@/types/bCBaoCao/dto";
import dayjs from "dayjs";
import userService from "@/services/user/user.service";

interface Props {
  isOpen: boolean;
  onSuccess: () => void;
  onClose: () => void;
  data?: any;
}

const CreateOrUpdate: React.FC<Props> = ({
  isOpen,
  onSuccess,
  onClose,
  data,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [baoCaoList, setBaoCaoList] = useState<BCBaoCaoType[]>([]);
  const [itemId, setItemId] = useState<string>("");
  const isEdit = !!data;
  const [nguoiDuyetList, setNguoiDuyetList] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (data) {
        setItemId(data.id || uuidv4());
        setSubmitting(true);
        bcSubmissionService
          .getDotBaoCaoDetail(data.id)
          .then((res) => {
            const detail = res.data;
            if (detail) {
              form.setFieldsValue({
                idBaoCao: detail.idBaoCao,
                name: detail.name,
                namBaoCao: detail.namBaoCao
                  ? dayjs(`${detail.namBaoCao}-01-01`)
                  : dayjs(),
                timeStart: detail.timeStart ? dayjs(detail.timeStart) : null,
                timeEnd: detail.timeEnd ? dayjs(detail.timeEnd) : null,
                description: detail.description || "",
                isGuiMail: detail.isGuiMail,
                nguoiDuyetBaoCaos: detail.nguoiDuyetBaoCaos,
                scheduledSendDate: detail.scheduledSendDate
              });
            }
          })
          .catch(() => message.error("Lỗi lấy thông tin đợt báo cáo"))
          .finally(() => setSubmitting(false));
      } else {
        setItemId(
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : uuidv4(),
        );
        form.resetFields();
      }

      const fetchBaoCaoList = async () => {
        try {
          const response = await bcBaoCaoService.getData({
            pageIndex: 1,
            pageSize: 1000,
          });
          if (response?.data?.items) {
            setBaoCaoList(response.data.items);
          }
        } catch (error) {
          console.error(error);
          message.error("Lỗi khi tải danh sách biểu mẫu báo cáo");
        }
      };
      fetchBaoCaoList();
    }
  }, [isOpen, data, form]);

  const LoadNguoiDuyet = async () => {
    try {
      const response = await userService.getUserByRole({
        vaiTro: ["DUYETBAOCAO"],
        pageIndex: 1,
        pageSize: 1000,
      });
      if (response?.data?.items) {
        const data = response.data.items.map((item: any) => ({
          value: item.id,
          label: item.userName,
        }));
        setNguoiDuyetList(data);
      }
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi tải danh sách người duyệt báo cáo");
    }
  };

  useEffect(() => {
    LoadNguoiDuyet();
  }, [isOpen]);

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const selectedBaoCao = baoCaoList.find((b) => b.id === values.idBaoCao);

      const payload = {
        Id: itemId,
        idBaoCao: values.idBaoCao,
        name: values.name,
        description: values.description || "",
        timeStart: values.timeStart ? values.timeStart.toISOString() : null,
        timeEnd: values.timeEnd ? values.timeEnd.toISOString() : null,
        mongoFormTemplateId: selectedBaoCao?.mongoFormTemplateId || "",
        loaiKyBaoCao: "THANG",
        kySo: null,
        isGuiMail: values.isGuiMail,
        nguoiDuyetBaoCaos: values.nguoiDuyetBaoCaos,
        scheduledSendDate: values.scheduledSendDate
      };

      const response = isEdit
        ? await bcSubmissionService.updatePeriod(payload)
        : await bcSubmissionService.createNenTangLon(payload);

      if (response?.status) {
        message.success(
          response.message ||
            (isEdit
              ? "Cập nhật thành công"
              : "Tạo đợt báo cáo hàng năm thành công"),
        );
        form.resetFields();
        onSuccess();
      } else {
        message.error(response?.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error(error);
      message.error("Đã xảy ra lỗi hệ thống");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        isEdit ? "Chỉnh sửa đợt báo cáo" : "Khởi tạo đợt báo cáo định kỳ tháng"
      }
      open={isOpen}
      onOk={() => form.submit()}
      onCancel={onClose}
      okText="Lưu"
      cancelText="Hủy"
      width={1000}
      destroyOnClose
      confirmLoading={submitting}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="idBaoCao"
              label="Biểu mẫu báo cáo"
              rules={[
                { required: true, message: "Vui lòng chọn biểu mẫu báo cáo" },
              ]}
            >
              <Select
                placeholder="Chọn biểu mẫu báo cáo"
                allowClear
                showSearch
                optionFilterProp="children"
              >
                {baoCaoList.map((item) => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="name"
              label="Tên đợt báo cáo"
              rules={[
                { required: true, message: "Vui lòng nhập tên đợt báo cáo" },
              ]}
            >
              <Input placeholder="Nhập tên đợt báo cáo" />
            </Form.Item>
          </Col>
          {/* <Col xs={24} md={8}>
            <Form.Item
              name="timeStart"
              label="Thời gian bắt đầu"
              rules={[
                { required: true, message: "Vui lòng chọn thời gian bắt đầu" },
              ]}
            >
              <DatePicker
                showTime
                style={{ width: "100%" }}
                placeholder="Chọn thời gian bắt đầu"
                format="DD/MM/YYYY HH:mm"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="timeEnd"
              label="Thời gian kết thúc"
              rules={[
                { required: true, message: "Vui lòng chọn thời gian kết thúc" },
              ]}
            >
              <DatePicker
                showTime
                style={{ width: "100%" }}
                placeholder="Chọn thời gian kết thúc"
                format="DD/MM/YYYY HH:mm"
              />
            </Form.Item>
          </Col> */}
          <Col xs={24} md={8}>
            <Form.Item
              name="nguoiDuyetBaoCaos"
              label="Người duyệt báo cáo"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn người duyệt báo cáo",
                },
              ]}
            >
              <Select
                placeholder="Chọn người duyệt báo cáo"
                allowClear
                showSearch
                optionFilterProp="children"
                options={nguoiDuyetList}
                mode="multiple"
              ></Select>
            </Form.Item>
          </Col>

          <Col xs={24} md={8}>
            <Form.Item
              name="scheduledSendDate"
              label="Ngày gửi mail/thông báo tự động"
              tooltip="Hệ thống sẽ tự động gửi mail và thông báo nhắc nhở vào thời điểm này"
            >
            <Input type="number" placeholder="Nhập ngày gửi mail/thông báo tự động (trước ngày 15)" max={15} min={1} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              name="isGuiMail"
              label="Gửi email thông báo"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label="Mô tả / Nội dung chi tiết">
          <RichTextEditor placeholder="Nhập mô tả đợt báo cáo" />
        </Form.Item>

        {itemId && (
          <Form.Item label="Tài liệu đính kèm">
            <SingleFileUploader
              itemId={itemId}
              category="BAO_CAO_HANG_NAM"
              loaiTaiLieu="DINH_KEM"
              uploadLabel="Chọn tài liệu đính kèm"
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};

export default CreateOrUpdate;
