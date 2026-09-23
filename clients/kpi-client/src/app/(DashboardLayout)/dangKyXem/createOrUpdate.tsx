"use client";
import { useEffect, useState } from "react";
import { Form, Input, Modal, message, Select, Row, Col, Button, DatePicker } from "antd";
import dangKyXemService from "@/services/dangKyXem/dangKyXem.service";
import { DangKyXemType } from "@/types/dang-ky-xem/dto";
import { DangKyXemRequestType } from "@/types/dang-ky-xem/request";
import { useSelector } from "react-redux";
import { Dictionary, DropdownOption } from "@/types/general";
import duLieuDanhMucService from "@/services/duLieuDanhMuc/duLieuDanhMuc.service";
import DigitalSignatureModal from "@/components/sign-components/DigitalSignatureModal";
import FileUploader from "@/components/upload-file/FileUploader";
import taiLieuDinhKemService from "@/services/taiLieuDinhKem/taiLieuDinhKem.service";
import dayjs from "dayjs";

// Hàm sinh GUID ngẫu nhiên cho ItemId liên kết tài liệu đính kèm
const generateGuid = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item: DangKyXemType | null;
  isEdit: boolean;
}

const DangKyXemCreateOrUpdate: React.FC<Props> = ({
  open,
  onClose,
  onSuccess,
  item,
  isEdit,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dropdowns, setDropdowns] = useState<Dictionary<DropdownOption[]>>({});
  const [isSignDangKyXem, setIsSignDangKyXem] = useState<boolean>(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState<boolean>(false);
  const [signIds, setSignIds] = useState<string[]>([]);
  const [savedRecord, setSavedRecord] = useState<DangKyXemType | null>(null);

  // Khởi tạo ItemId đồng bộ — dùng id có sẵn nếu edit, hoặc sinh mới nếu thêm mới
  const [formItemId, setFormItemId] = useState<string>(() => item?.id || generateGuid());

  useEffect(() => {
    if (open) {
      // Cập nhật formItemId mỗi khi modal mở, đảm bảo đúng id cho từng mode
      setFormItemId(item?.id || generateGuid());
    }
  }, [open, item?.id]);

  // Upload file
  const docUploader = FileUploader.useFileUploader({
    maxCount: 10,
    category: "DangKyXem",
    itemId: formItemId,
    FileType: "TepDinhKem",
  });

  // Lấy thông tin user hiện tại từ store auth
  const currentUser = useSelector((state: any) => state.auth?.User);
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const res = await dangKyXemService.getDropdowns();
        if (res.status && res.data) {
          setDropdowns(res.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách dropdown:", error);
      }
    };
    const getIsSignDangKyXem = async () => {
      try {
        const res = await duLieuDanhMucService.getAllByGroupCode("CAUHINH_SIGN_NENTANG");
        if (res.status && res.data?.length) {
          const signConfig = res.data.find(
            (item: any) => item.code === "SING_DANGKYXEMNENTANG" || item.code === "SIGN_DANGKYXEMNENTANG"
          );
          setIsSignDangKyXem(signConfig?.priority === 1);
        }
      } catch (error) {
        console.error("Lỗi khi tải cấu hình ký số:", error);
      }
    };
    fetchDropdowns();
    getIsSignDangKyXem();
  }, []);

  useEffect(() => {
    if (open) {
      if (isEdit && item) {
        form.setFieldsValue({
          ...item,
          typeGuiDeXuat: item.typeGuiDeXuat?.toString(),
          tuNgay: item.tuNgay ? dayjs(item.tuNgay) : undefined,
          denNgay: item.denNgay ? dayjs(item.denNgay) : undefined,
        });
        // Tải danh sách tệp đính kèm
        if (item.id) {
          docUploader.setFilesByItemId(item.id, "TepDinhKem");
        }
      } else {
        form.resetFields();
        form.setFieldsValue({ hoTen: currentUser?.name, trangThai: 0 });
        docUploader.resetFiles();
      }
    }
  }, [open, isEdit, item, form, currentUser]);

  const handleSignSuccess = async (
    result: any[],
    certificate: any,
  ) => {
    setLoading(true);
    try {
      const responseSign = await dangKyXemService.sign({
        signResultItems: result,
        certificateInfo: certificate,
      });

      if (!responseSign.status) {
        message.error(responseSign.message || "Lỗi ký số hồ sơ");
        return;
      }

      if (savedRecord?.id) {
        const payload = {
          ...savedRecord,
          trangThai: 1,
        };
        const statusResponse = await dangKyXemService.update(payload);
        if (statusResponse.status) {
          message.success("Ký số và gửi duyệt thành công!");
          onSuccess();
          onClose();
        } else {
          message.error(statusResponse.message || "Ký số thành công nhưng cập nhật trạng thái thất bại");
        }
      }
    } catch (err: any) {
      console.error("Lỗi trong quá trình ký số:", err);
      message.error(err?.message || "Lỗi trong quá trình ký số và gửi duyệt");
    } finally {
      setLoading(false);
      setIsSignModalOpen(false);
    }
  };

  const handleCancelSign = () => {
    setIsSignModalOpen(false);
    message.info("Hồ sơ đã được lưu tạm thành công. Vui lòng ký số từ danh sách để gửi duyệt.");
    onSuccess();
    onClose();
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const isSending = values.trangThai === 1;

      const idDangKyXem = isEdit && item?.id ? item.id : formItemId;

      const submitData: DangKyXemRequestType = {
        ...values,
        id: idDangKyXem,
        hoTen: values.hoTen || currentUser?.name,
        tuNgay: values.tuNgay ? dayjs(values.tuNgay).format("YYYY-MM-DDTHH:mm:ss") : null,
        denNgay: values.denNgay ? dayjs(values.denNgay).format("YYYY-MM-DDTHH:mm:ss") : null,
        typeGuiDeXuat: values.typeGuiDeXuat ? Number(values.typeGuiDeXuat) : 0,
      };

      if (isEdit && item?.id) {
        if (isSending && isSignDangKyXem) {
          // Save with status 0 first
          submitData.trangThai = 0;
          const res = await dangKyXemService.update(submitData);
          if (res.status) {
            setSavedRecord({ ...submitData, id: item.id } as any);
            setSignIds([item.id]);
            setIsSignModalOpen(true);
          } else {
            message.error(res.message || "Cập nhật thất bại!");
          }
        } else {
          const res = await dangKyXemService.update(submitData);
          if (res.status) {
            // Cập nhật ItemId cho các file đã upload
            if (formItemId !== item.id) {
              await taiLieuDinhKemService.updateFileItem({ itemId: item.id, fileIds: docUploader.getFileIds() });
            }
            message.success(isSending ? "Gửi duyệt thành công!" : "Cập nhật thành công!");
            onSuccess();
            onClose();
          } else {
            message.error(res.message || "Cập nhật thất bại!");
          }
        }
      } else {
        const payload = { ...submitData, trangThai: isSending && isSignDangKyXem ? 0 : (values.trangThai ?? 0) };
        const res = await dangKyXemService.create(payload);
        if (res.status) {
          const createdItem = res.data;
          // Cập nhật ItemId cho các file đã upload lên Id thật của record
          if (createdItem?.id) {
            await taiLieuDinhKemService.updateFileItem({ itemId: createdItem.id, fileIds: docUploader.getFileIds() });
          }
          if (isSending && isSignDangKyXem && createdItem?.id) {
            setSavedRecord(createdItem);
            setSignIds([createdItem.id]);
            setIsSignModalOpen(true);
          } else {
            message.success(isSending ? "Lưu và gửi duyệt thành công!" : "Thêm mới thành công!");
            onSuccess();
            onClose();
          }
        } else {
          message.error(res.message || "Thêm mới thất bại!");
        }
      }
    } catch (error: any) {
      message.error(error?.message || "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Modal
      title={isEdit ? "Cập nhật Đăng ký xem" : "Thêm mới Đăng ký xem"}
      open={open}
      onCancel={onClose}
      width={1000}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        !isEdit ? (
          <Button
            key="draft"
            type="default"
            loading={loading}
            onClick={() => {
              form.setFieldsValue({ trangThai: 0 });
              form.submit();
            }}
          >
            Tạm lưu
          </Button>
        ) : null,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={() => {
            form.setFieldsValue({ trangThai: 1 });
            form.submit();
          }}
        >
          {isEdit ? "Gửi duyệt" : "Lưu và gửi duyệt"}
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ trangThai: 0 }}
      >
        <Form.Item name="trangThai" hidden>
          <Input />
        </Form.Item>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="hoTen"
              label="Họ và tên"
              initialValue={currentUser?.name}
            >
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="nenTangMuonXem"
              label="Nền tảng muốn xem"
              rules={[{ required: true, message: "Vui lòng nhập nền tảng muốn xem" }]}
            >
              <Input placeholder="Tên nền tảng" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="typeGuiDeXuat"
              label="Loại gửi đề xuất"
              rules={[{ required: true, message: "Vui lòng chọn loại đề xuất" }]}
            >
              <Select placeholder="Chọn loại đề xuất" allowClear options={dropdowns['LOAIDEXUAT']} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Thời gian muốn xem"
              style={{ marginBottom: 0 }}
            >
              <Row gutter={8}>
                <Col span={12}>
                  <Form.Item name="tuNgay">
                    <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="Từ ngày" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="denNgay">
                    <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="Đến ngày" />
                  </Form.Item>
                </Col>
              </Row>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="noiDungMuonXem"
              label="Nội dung muốn xem"
              rules={[{ required: true, message: "Vui lòng nhập nội dung muốn xem" }]}
            >
              <Input.TextArea rows={2} placeholder="Nhập nội dung muốn xem" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              name="noiDungKhac"
              label="Nội dung khác"
            >
              <Input.TextArea rows={2} placeholder="Nội dung khác" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Tệp đính kèm"
            >
              <FileUploader
                controller={docUploader}
                typeBtn="primary"
                uploadLabel="Tải lên tài liệu"
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
    <DigitalSignatureModal
      ids={signIds}
      open={isSignModalOpen}
      onCancel={handleCancelSign}
      onSignSuccess={handleSignSuccess}
      signerService={dangKyXemService}
    />
    </>
  );
};

export default DangKyXemCreateOrUpdate;
