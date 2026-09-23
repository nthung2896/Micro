import React, { useState, useEffect } from "react";
import { Form, FormProps, Input, Modal, Row, Col, ColorPicker, Switch, Image } from "antd";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { buildFileUrl } from "@/utils/file";
import {
  AppConfigurationCreateOrUpdateType,
  AppConfigurationType,
} from "@/types/appConfiguration/appConfiguration";
import appConfigurationService from "@/services/appConfiguration/appConfigurationService";
import { setAppConfig } from "@/store/general/GeneralSlice";
import FileUploader from "@/libs/file-uploader";
import LoaiTaiLieuConstant from "@/constants/LoaiTaiLieuConstant";

import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";

const createFileFromPath = (path?: string | null, loaiTaiLieu?: string): TaiLieuDinhKemType[] => {
  if (!path?.trim()) return [];
  const normalized = path.trim();
  const fileName = normalized.split("/").pop() || normalized.split("\\").pop() || "file";
  const extension = fileName.split(".").pop() || "png";
  return [
    {
      id: normalized,
      tenTaiLieu: fileName,
      tenTaiLieuText: fileName,
      duongDanFile: normalized,
      duongDanFilePDF: "",
      extension: extension,
      loaiTaiLieu: loaiTaiLieu || "",
      isXoaFile: false,
    } as TaiLieuDinhKemType,
  ];
};

interface Props {
  item?: AppConfigurationType | null;
  onClose: () => void;
  onSuccess: () => void;
}

const AppConfigurationCreateOrUpdate: React.FC<Props> = (props: Props) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm<AppConfigurationCreateOrUpdateType>();
  const [colorValue, setColorValue] = useState<string>("#0960a5");

  const logoUploader = FileUploader.useFileUploader({
    maxCount: 1,
    FileType: LoaiTaiLieuConstant.LOGO,
    initFiles: [],
  });

  const bgUploader = FileUploader.useFileUploader({
    maxCount: 1,
    FileType: LoaiTaiLieuConstant.ImageTinTuc,
    initFiles: [],
  });

  const modalImageUploader = FileUploader.useFileUploader({
    maxCount: 1,
    FileType: LoaiTaiLieuConstant.ImageTinTuc,
    initFiles: [],
  });

  const handleOnFinish: FormProps<AppConfigurationCreateOrUpdateType>["onFinish"] =
    async (formData: AppConfigurationCreateOrUpdateType) => {
      try {
        let cleanColor = (formData.primaryColor || colorValue || "#0960a5").trim();
        if (/^[0-9A-Fa-f]{6}$/.test(cleanColor) || /^[0-9A-Fa-f]{3}$/.test(cleanColor)) {
          cleanColor = `#${cleanColor}`;
        }

        const logoFiles = logoUploader.getFiles();
        const bgFiles = bgUploader.getFiles();
        const modalFiles = modalImageUploader.getFiles();

        const logoFile = logoFiles.at(0);
        const bgFile = bgFiles.at(0);
        const modalImageFile = modalFiles.at(0);

        const isValidGuid = (id?: string | null): boolean => {
          if (!id) return false;
          return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        };

        const rawLogoId = logoUploader.getFileIds()?.at(0);
        const rawBgId = bgUploader.getFileIds()?.at(0);
        const rawModalId = modalImageUploader.getFileIds()?.at(0);

        const logoFileId = isValidGuid(rawLogoId) ? rawLogoId : undefined;
        const bgFileId = isValidGuid(rawBgId) ? rawBgId : undefined;
        const modalImageFileId = isValidGuid(rawModalId) ? rawModalId : undefined;

        const dataToSend: AppConfigurationCreateOrUpdateType = {
          ...formData,
          primaryColor: cleanColor,
          isActive: !!formData.isActive,
          logoFileId: logoFileId || undefined,
          bgFileId: bgFileId || undefined,
          loginModalImageFileId: modalImageFileId || undefined,
          logoLink: logoFiles.length > 0 ? (logoFile?.duongDanFile || "") : "",
          loginBackgroundLink: bgFiles.length > 0 ? (bgFile?.duongDanFile || "") : "",
          loginModalImage: modalFiles.length > 0 ? (modalImageFile?.duongDanFile || "") : "",
        };

        if (props.item?.id) {
          dataToSend.id = props.item.id;
          const response = await appConfigurationService.update(dataToSend);
          if (response?.status) {
            toast.success("Chỉnh sửa cấu hình ứng dụng thành công");
            form.resetFields();
            logoUploader.resetFiles();
            bgUploader.resetFiles();
            modalImageUploader.resetFiles();
            props.onSuccess();
            props.onClose();

            // Refresh active config in store
            const activeRes = await appConfigurationService.getActiveConfig();
            if (activeRes?.status && activeRes?.data) {
              dispatch(setAppConfig(activeRes.data));
            }
          } else {
            toast.error(response?.message || "Chỉnh sửa cấu hình ứng dụng thất bại");
          }
        } else {
          const response = await appConfigurationService.create(dataToSend);
          if (response?.status) {
            toast.success("Thêm mới cấu hình ứng dụng thành công");
            form.resetFields();
            logoUploader.resetFiles();
            bgUploader.resetFiles();
            modalImageUploader.resetFiles();
            props.onSuccess();
            props.onClose();

            // Refresh active config in store
            const activeRes = await appConfigurationService.getActiveConfig();
            if (activeRes?.status && activeRes?.data) {
              dispatch(setAppConfig(activeRes.data));
            }
          } else {
            toast.error(response?.message || "Thêm mới cấu hình ứng dụng thất bại");
          }
        }
      } catch (err: any) {
        console.error("Lỗi khi lưu cấu hình:", err);
        toast.error(err?.message || "Đã xảy ra lỗi khi lưu cấu hình");
      }
    };

  const handleCancel = () => {
    form.resetFields();
    logoUploader.resetFiles();
    bgUploader.resetFiles();
    modalImageUploader.resetFiles();
    props.onClose();
  };

  const handleMapEdit = () => {
    form.setFieldsValue({
      ...(props.item || {}),
      isActive: props.item?.isActive ?? false,
    });
    setColorValue(props.item?.primaryColor || "#0960a5");

    if (props.item?.logoLink) {
      logoUploader.setFiles(createFileFromPath(props.item.logoLink, LoaiTaiLieuConstant.LOGO));
    } else if (props.item?.id) {
      logoUploader.setFilesByItemId(props.item.id);
    } else {
      logoUploader.resetFiles();
    }

    if (props.item?.loginBackgroundLink) {
      bgUploader.setFiles(createFileFromPath(props.item.loginBackgroundLink, LoaiTaiLieuConstant.ImageTinTuc));
    } else if (props.item?.id) {
      bgUploader.setFilesByItemId(props.item.id);
    } else {
      bgUploader.resetFiles();
    }

    if (props.item?.loginModalImage) {
      modalImageUploader.setFiles(createFileFromPath(props.item.loginModalImage, LoaiTaiLieuConstant.ImageTinTuc));
    } else if (props.item?.id) {
      modalImageUploader.setFilesByItemId(props.item.id);
    } else {
      modalImageUploader.resetFiles();
    }
  };

  useEffect(() => {
    if (props.item) {
      handleMapEdit();
    } else {
      form.resetFields();
      form.setFieldsValue({ isActive: false });
      logoUploader.resetFiles();
      bgUploader.resetFiles();
      modalImageUploader.resetFiles();
      setColorValue("#0960a5");
    }
  }, [props.item]);

  return (
    <Modal
      title={
        props.item != null
          ? "Chỉnh sửa cấu hình ứng dụng"
          : "Thêm mới cấu hình ứng dụng"
      }
      open={true}
      onOk={() => form.submit()}
      onCancel={handleCancel}
      okText="Lưu"
      cancelText="Hủy"
      width={900}
    >
      <Form<AppConfigurationCreateOrUpdateType>
        form={form}
        layout="vertical"
        onFinish={handleOnFinish}
      >
        <Form.Item<AppConfigurationCreateOrUpdateType> name="id" hidden>
          <Input />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item<AppConfigurationCreateOrUpdateType>
              label="Tên ứng dụng"
              name="tenApp"
              rules={[
                { required: true, message: "Vui lòng nhập tên ứng dụng!" },
              ]}
            >
              <Input placeholder="Nhập tên ứng dụng" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item<AppConfigurationCreateOrUpdateType>
              label="Tên doanh nghiệp / Đơn vị"
              name="tenDoanhNghiep"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập tên doanh nghiệp / đơn vị!",
                },
              ]}
            >
              <Input placeholder="Nhập tên doanh nghiệp / đơn vị" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item<AppConfigurationCreateOrUpdateType>
              label="Số điện thoại"
              name="soDienThoai"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
              ]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item<AppConfigurationCreateOrUpdateType>
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không đúng định dạng!" },
              ]}
            >
              <Input placeholder="Nhập địa chỉ email" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item<AppConfigurationCreateOrUpdateType>
              label="Địa chỉ"
              name="diaChi"
              rules={[
                { required: true, message: "Vui lòng nhập địa chỉ!" },
              ]}
            >
              <Input placeholder="Nhập địa chỉ" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item<AppConfigurationCreateOrUpdateType>
              label="Màu chủ đạo (Trang đăng nhập)"
              name="primaryColor"
              rules={[
                { required: true, message: "Vui lòng chọn hoặc nhập màu chủ đạo!" },
              ]}
            >
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <ColorPicker
                  value={colorValue}
                  onChange={(color) => {
                    const hex = typeof color === "string" ? color : color.toHexString();
                    setColorValue(hex);
                    form.setFieldsValue({ primaryColor: hex });
                  }}
                />
                <Input
                  placeholder="Ví dụ: #0960a5"
                  value={colorValue}
                  onChange={(e) => {
                    const val = e.target.value;
                    setColorValue(val);
                    form.setFieldsValue({ primaryColor: val });
                  }}
                />
              </div>
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item<AppConfigurationCreateOrUpdateType>
              label="Áp dụng ngay"
              name="isActive"
              valuePropName="checked"
            >
              <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label="Logo" name="logoFileId">
              <FileUploader controller={logoUploader} />
              {logoUploader.files && logoUploader.files.length > 0 && (
                <div style={{ marginTop: 8, width: "100%", height: 120, borderRadius: 4, border: "1px solid #d9d9d9", padding: 4, display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <Image
                    src={buildFileUrl(logoUploader.files[0].duongDanFile)}
                    alt="Logo preview"
                    style={{ maxHeight: 110, maxWidth: "100%", objectFit: "contain" }}
                    wrapperStyle={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}
                    fallback="/img/no-image.png"
                  />
                </div>
              )}
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Ảnh nền đăng nhập" name="bgFileId">
              <FileUploader controller={bgUploader} />
              {bgUploader.files && bgUploader.files.length > 0 && (
                <div style={{ marginTop: 8, width: "100%", height: 120, borderRadius: 4, border: "1px solid #d9d9d9", padding: 4, display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <Image
                    src={buildFileUrl(bgUploader.files[0].duongDanFile)}
                    alt="Bg preview"
                    style={{ maxHeight: 110, maxWidth: "100%", objectFit: "cover" }}
                    wrapperStyle={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}
                    fallback="/img/no-image.png"
                  />
                </div>
              )}
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item label="Ảnh modal đăng nhập" name="loginModalImageFileId">
              <FileUploader controller={modalImageUploader} />
              {modalImageUploader.files && modalImageUploader.files.length > 0 && (
                <div style={{ marginTop: 8, width: "100%", height: 120, borderRadius: 4, border: "1px solid #d9d9d9", padding: 4, display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <Image
                    src={buildFileUrl(modalImageUploader.files[0].duongDanFile)}
                    alt="Modal preview"
                    style={{ maxHeight: 110, maxWidth: "100%", objectFit: "cover" }}
                    wrapperStyle={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}
                    fallback="/img/no-image.png"
                  />
                </div>
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AppConfigurationCreateOrUpdate;
