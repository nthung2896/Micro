import React from "react";
import { Drawer, Divider } from "antd";
import { DM_NhomDanhMucType } from "@/types/dM_NhomDanhMuc/dto";

interface NhomDanhMucViewProps {
  NhomDanhMuc?: DM_NhomDanhMucType | null;
  isOpen: boolean;
  onClose: () => void;
}

const NhomDanhMucDetail: React.FC<NhomDanhMucViewProps> = ({
  NhomDanhMuc,
  isOpen,
  onClose,
}) => {
  return (
    <Drawer
      title={`Thông tin nhóm danh mục`}
      width="20%"
      placement="right"
      onClose={onClose}
      closable={true}
      open={isOpen}
    >
      <Divider dashed />
      <div>
        {/* <h6 className="text-muted text-uppercase mb-3">Thông tin chi tiết</h6> */}
        <p>
          <span className="ml-3 text-dark">ID: {NhomDanhMuc?.id}</span>
        </p>
        <p>
          <span className="ml-3 text-dark">
            Mã nhóm danh mục: {NhomDanhMuc?.groupCode || "Chưa có"}
          </span>
        </p>
        <p>
          <span className="ml-3 text-dark">
            Tên nhóm danh mục: {NhomDanhMuc?.groupName || "Chưa có"}
          </span>
        </p>
      </div>
    </Drawer>
  );
};

export default NhomDanhMucDetail;
