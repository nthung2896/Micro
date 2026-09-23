import { uploadFileService } from "@/services/common/uploadFile.service";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { Upload, message } from "antd";
import type { UploadChangeParam } from "antd/es/upload";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
import React, { useEffect, useState } from "react";

interface UploadImageProps {
  value?: string;
  onChange?: (value: string) => void;
  readonly?: boolean;
  folder?: string;
  isPublic?: boolean;
  itemId?: string;
}

const beforeUpload = (file: RcFile) => {
  const isJpgOrPng =
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    file.type === "image/jpg";
  if (!isJpgOrPng) {
    message.error("Bạn chỉ có thể tải lên file JPG/PNG!");
  }
  const isLt5M = file.size / 1024 / 1024 < 5;
  if (!isLt5M) {
    message.error("Kích thước ảnh phải nhỏ hơn 5MB!");
  }
  return isJpgOrPng && isLt5M;
};

const UploadImage: React.FC<UploadImageProps> = ({
  value,
  onChange,
  readonly = false,
  folder = "",
  isPublic = false,
  itemId,
}) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();

  useEffect(() => {
    if (value) {
      setImageUrl(value);
    } else {
      setImageUrl(undefined);
    }
  }, [value]);

  const customRequest: UploadProps["customRequest"] = async (options) => {
    const { file, onSuccess, onError } = options;
    setLoading(true);

    const formData = new FormData();
    formData.append("Files", file as RcFile);
    if (folder) {
      formData.append("FileType", folder);
    }
    if (itemId) {
      formData.append("ItemId", itemId);
    }

    try {
      const response = isPublic
        ? await uploadFileService.uploadPublish(formData)
        : await uploadFileService.upload(formData);
      if (response.status && response.data && response.data.length > 0) {
        const uploadedFileUrl = response.data[0].duongDanFile; // Tùy thuộc vào response API trả về
        setImageUrl(uploadedFileUrl);
        if (onChange) {
          onChange(uploadedFileUrl);
        }
        onSuccess?.(response.data[0], new XMLHttpRequest());
        message.success("Tải ảnh lên thành công");
      } else {
        onError?.(new Error("Upload failed"));
        message.error(response.message || "Tải ảnh lên thất bại");
      }
    } catch (error) {
      onError?.(error as Error);
      message.error("Lỗi khi tải ảnh lên");
    } finally {
      setLoading(false);
    }
  };

  const handleChange: UploadProps["onChange"] = (
    info: UploadChangeParam<UploadFile>,
  ) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      setLoading(false);
    } else if (info.file.status === "error") {
      setLoading(false);
    }
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
    </div>
  );

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  const displayUrl = imageUrl
    ? imageUrl.startsWith("http")
      ? imageUrl
      : imageUrl.startsWith("/")
        ? `${baseUrl}${imageUrl}`
        : `${baseUrl}/uploads/${imageUrl}`
    : "";

  return (
    <Upload
      name="avatar"
      listType="picture-card"
      className="avatar-uploader"
      showUploadList={false}
      beforeUpload={beforeUpload}
      customRequest={customRequest}
      onChange={handleChange}
      disabled={readonly}
    >
      {imageUrl ? (
        <img
          src={displayUrl}
          alt="avatar"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        uploadButton
      )}
    </Upload>
  );
};

export default UploadImage;
