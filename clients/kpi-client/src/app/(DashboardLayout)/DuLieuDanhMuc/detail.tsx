import React from "react";
import { Drawer, Divider } from "antd";
import dynamic from "next/dynamic";
import { DM_DuLieuDanhMucType } from "@/types/dM_DuLieuDanhMuc/dto";
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const StaticFileUrl = process.env.NEXT_PUBLIC_STATIC_FILE_BASE_URL;

interface DuLieuDanhMucViewProps {
  DuLieuDanhMuc?: DM_DuLieuDanhMucType | null;
  isOpen: boolean;
  onClose: () => void;
}

const DuLieuDanhMucDetail: React.FC<DuLieuDanhMucViewProps> = ({
  DuLieuDanhMuc,
  isOpen,
  onClose,
}) => {
  return (
    <Drawer
      title={`Thông tin danh mục`}
      width="50%"
      placement="right"
      onClose={onClose}
      closable={true}
      open={isOpen}
    >
      <Divider dashed />
      <div>
        {/* <h6 className="text-muted text-uppercase mb-3">Thông tin chi tiết</h6> */}
        {/* <p>
          <span className="ml-3 text-dark">ID: {DuLieuDanhMuc?.id}</span>
        </p>
        <p>
          <span className="ml-3 text-dark">
            GroupID: {DuLieuDanhMuc?.groupId}
          </span>
        </p> */}
        <p>
          <span className="ml-3 text-dark">
            Mã danh mục: {DuLieuDanhMuc?.code || "Chưa có"}
          </span>
        </p>
        <p>
          <span className="ml-3 text-dark">
            Tên danh mục: {DuLieuDanhMuc?.name || "Chưa có"}
          </span>
        </p>
        <p>
          <span className="ml-3 text-dark">
            Thứ tự hiển thị: {DuLieuDanhMuc?.priority || "Chưa có"}
          </span>
        </p>
        <p>
          <span className="ml-3 text-dark">
            Đơn vị: {DuLieuDanhMuc?.tenDonVi || "Chưa có"}
          </span>
        </p>
        <p>
          <span className="ml-3 text-dark">
            Ghi chú: {DuLieuDanhMuc?.note || "Chưa có"}
          </span>
        </p>
        <p>
          <span className="ml-3 text-dark">
            Tài liệu đính kèm:
            {DuLieuDanhMuc?.duongDanFile ? (
              <a
                href={`${StaticFileUrl}/${DuLieuDanhMuc?.duongDanFile}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                tài liệu đính kèm
              </a>
            ) : (
              <span>Không có tài liệu</span>
            )}
          </span>
        </p>
        <p>
          <span className="ml-3 text-dark">
            Nội dung:
            {
              <ReactQuill
                readOnly
                value={DuLieuDanhMuc?.noiDung}
                theme="snow"
              />
            }
          </span>
        </p>
      </div>
    </Drawer>
  );
};

export default DuLieuDanhMucDetail;
