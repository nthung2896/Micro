import { UploadOutlined } from "@ant-design/icons";
import { Button, Image, Modal, Upload } from "antd";
import { useState } from "react";
import styles from "./avatar.module.css";
import authService from "@/services/auth/auth.service";

const ChangeAvatar = ({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const handleCancel = () => {
    onClose();
  };
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleBeforeUpload = (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      alert("Chỉ cho phép tải file ảnh!");
      return false;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setFile(file);
    return false; // Không upload ngay
  };

  const handleOK = async () => {
    if (file) {
      // Gửi file lên API của bạn tại đây
      const formData = new FormData();
      formData.append("avatar", file);
      const response = await authService.updateAvatar(formData);
      if (response.status) {
        onSuccess();
      }
    }
  };
  return (
    <div className={styles.modalWrapper}>
      <Modal
        title="Thay đổi ảnh đại diện"
        open={true}
        onOk={handleOK}
        onCancel={handleCancel}
        okText="Xác nhận"
        cancelText="Đóng"
      >
        <div className={styles.uploadContainer}>
          <div className={styles.previewImage}>
            <Image
              src={preview ?? "/images/default-avatar.svg"}
              alt="Ảnh đại diện mới"
              width={200}
              height={200}
              fallback="/images/default-avatar.svg"
            />
          </div>
          <Upload
            accept="image/*"
            beforeUpload={handleBeforeUpload}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />} className={styles.uploadButton}>
              Chọn ảnh từ máy
            </Button>
          </Upload>
        </div>
      </Modal>
    </div>
  );
};
export default ChangeAvatar;
