import React from "react";
import { Upload, Button, Tooltip } from "antd";
import {
  UploadOutlined,
  LinkOutlined,
  ThunderboltOutlined,
  PictureOutlined,
  StarFilled,
  StarOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { ImageItem } from "../types";

interface HinhAnhSectionProps {
  images: ImageItem[];
  onCustomUpload: (options: any) => Promise<void>;
  onSetAvatar: (uid: string) => void;
  onDeleteImage: (uid: string) => void;
  onOpenUrlModal: () => void;
  onApplySampleImages: () => void;
  onPreviewImage: (url: string) => void;
}

export const HinhAnhSection: React.FC<HinhAnhSectionProps> = ({
  images,
  onCustomUpload,
  onSetAvatar,
  onDeleteImage,
  onOpenUrlModal,
  onApplySampleImages,
  onPreviewImage,
}) => {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Upload
          customRequest={onCustomUpload}
          multiple
          showUploadList={false}
          accept="image/*"
        >
          <Button type="primary" icon={<UploadOutlined />} className="bg-[#0355a2]">
            Tải ảnh từ máy tính
          </Button>
        </Upload>

        <Button icon={<LinkOutlined />} onClick={onOpenUrlModal}>
          Thêm bằng link ảnh URL
        </Button>

        <Button
          type="dashed"
          icon={<ThunderboltOutlined />}
          onClick={onApplySampleImages}
          className="text-emerald-600 border-emerald-500 hover:text-emerald-700"
        >
          ✨ Dùng bộ 4 ảnh mẫu thực tế
        </Button>
      </div>

      {/* Danh sách ảnh */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {images.map((img) => (
            <div
              key={img.uid}
              className={`relative rounded-lg overflow-hidden border-2 transition-all group ${
                img.isAvatar ? "border-amber-500 shadow-md" : "border-gray-200"
              }`}
              style={{ height: 130 }}
            >
              <img src={img.url} alt="Phòng trọ" className="w-full h-full object-cover" />

              {/* Badge ảnh đại diện */}
              {img.isAvatar && (
                <div className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
                  <StarFilled /> Ảnh đại diện
                </div>
              )}

              {/* Overlay actions on hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!img.isAvatar && (
                  <Tooltip title="Đặt làm ảnh đại diện">
                    <Button
                      size="small"
                      shape="circle"
                      icon={<StarOutlined />}
                      onClick={() => onSetAvatar(img.uid)}
                      className="bg-white text-amber-500 border-none"
                    />
                  </Tooltip>
                )}
                <Tooltip title="Xem phóng to">
                  <Button
                    size="small"
                    shape="circle"
                    icon={<EyeOutlined />}
                    onClick={() => onPreviewImage(img.url)}
                    className="bg-white text-blue-600 border-none"
                  />
                </Tooltip>
                <Tooltip title="Xóa ảnh">
                  <Button
                    size="small"
                    shape="circle"
                    icon={<DeleteOutlined />}
                    danger
                    onClick={() => onDeleteImage(img.uid)}
                    className="bg-white border-none"
                  />
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
          <PictureOutlined className="text-4xl text-gray-300 mb-2" />
          <p className="text-gray-500 text-sm mb-2">Chưa có hình ảnh nào được tải lên</p>
          <Button
            size="small"
            type="primary"
            onClick={onApplySampleImages}
            className="bg-[#0355a2]"
          >
            Bấm để dùng bộ ảnh phòng mẫu có sẵn
          </Button>
        </div>
      )}
    </>
  );
};
