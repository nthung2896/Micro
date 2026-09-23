import React, { useEffect, useState } from "react";
import { Upload, Button, message, Space, Tooltip } from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  FileTextOutlined,
  LoadingOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import type { UploadProps } from "antd";
import type { RcFile } from "antd/es/upload/interface";
import taiLieuDinhKemService from "@/services/taiLieuDinhKem/taiLieuDinhKem.service";
import LoaiTaiLieuConstant from "@/constants/LoaiTaiLieuConstant";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";

interface UploadFileGuidProps {
  value?: string;
  onChange?: (value: string | undefined) => void;
  readonly?: boolean;
  fileType?: string;
}

const UploadFileGuid: React.FC<UploadFileGuidProps> = ({
  value,
  onChange,
  readonly = false,
  fileType = LoaiTaiLieuConstant.THU_TUC_HOC_VIEN,
}) => {
  const [loading, setLoading] = useState(false);
  const [fileInfo, setFileInfo] = useState<TaiLieuDinhKemType>();

  useEffect(() => {
    const fetchFileInfo = async () => {
      if (value && value !== "00000000-0000-0000-0000-000000000000") {
        try {
          const res = await taiLieuDinhKemService.getById(value);
          if (res.status && res.data) {
            setFileInfo(res.data);
          }
        } catch (error) {
          console.error("Lỗi khi lấy thông tin file:", error);
        }
      } else {
        setFileInfo(undefined);
      }
    };
    fetchFileInfo();
  }, [value]);

  const customRequest: UploadProps["customRequest"] = async (options) => {
    const { file, onSuccess, onError } = options;
    setLoading(true);

    const formData = new FormData();
    formData.append("Files", file as RcFile);
    formData.append("FileType", fileType);

    try {
      const response = await taiLieuDinhKemService.upload(formData);
      if (response.status && response.data && response.data.length > 0) {
        const newFile = response.data[0];
        setFileInfo(newFile);
        if (onChange) {
          onChange(newFile.id);
        }
        onSuccess?.(newFile);
        message.success(`Tải file "${newFile.tenTaiLieu}" thành công`);
      } else {
        onError?.(new Error(response.message || "Tải file thất bại"));
        message.error(response.message || "Tải file thất bại");
      }
    } catch (error) {
      onError?.(error as Error);
      message.error("Lỗi khi tải file lên");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    if (onChange) {
      onChange(undefined);
    }
    setFileInfo(undefined);
  };

  const handlePreview = () => {
    if (fileInfo?.duongDanFile) {
      const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}/uploads/${fileInfo.duongDanFile}`;
      const extension =
        fileInfo.extension?.toLowerCase() ||
        fileInfo.tenTaiLieu?.split(".").pop()?.toLowerCase();

      const officeExtensions = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"];

      if (officeExtensions.includes(extension || "")) {
        const officeUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fullUrl)}`;
        window.open(officeUrl, "_blank");
      } else {
        window.open(fullUrl, "_blank");
      }
    }
  };

  if (value && value !== "00000000-0000-0000-0000-000000000000" && fileInfo) {
    return (
      <div className="flex items-center gap-2 overflow-hidden max-w-full">
        <Tooltip title={fileInfo.tenTaiLieu}>
          <div className="flex items-center gap-1 cursor-default text-blue-600 min-w-0 flex-1">
            <FileTextOutlined className="shrink-0" />
            <span className="truncate max-w-[200px] text-sm">
              {fileInfo.tenTaiLieu}
            </span>
          </div>
        </Tooltip>
        <Space size={4} className="shrink-0">
          <Tooltip title="Xem trước">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={handlePreview}
            />
          </Tooltip>
          {!readonly && (
            <Tooltip title="Xóa file">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={handleRemove}
              />
            </Tooltip>
          )}
        </Space>
      </div>
    );
  }

  return (
    <Upload
      customRequest={customRequest}
      showUploadList={false}
      disabled={readonly || loading}
    >
      <Button
        size="small"
        icon={loading ? <LoadingOutlined /> : <UploadOutlined />}
        loading={loading}
        disabled={readonly}
      >
        Tải lên
      </Button>
    </Upload>
  );
};

export default UploadFileGuid;
