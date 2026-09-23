import React from "react";
import { Drawer, Divider } from "antd";
import * as extensions from "@/utils/extensions";
import { HuyenType } from "@/types/huyen/dto";

interface Props {
  item?: HuyenType | null;
  onClose: () => void;
}

const HuyenDetail: React.FC<Props> = ({ item, onClose }) => {
  return (
    <Drawer
      title={`Thông tin nhóm danh mục`}
      width="20%"
      placement="right"
      onClose={onClose}
      closable={true}
      open={true}
    >
      <Divider dashed />
      <div>
        <p>
          <span className="ml-3 text-dark">Loại huyện: {item?.loaiHuyen}</span>
        </p>
        <p>
          <span className="ml-3 text-dark">Tên huyện: {item?.tenHuyen}</span>
        </p>
        <p>
          <span className="ml-3 text-dark">Mã: {item?.ma}</span>
        </p>
        <p>
          <span className="ml-3 text-dark">Tên tỉnh: {item?.tenTinh}</span>
        </p>
      </div>
    </Drawer>
  );
};

export default HuyenDetail;
