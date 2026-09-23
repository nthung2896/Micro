import React from "react";
import { Drawer, Divider } from "antd";
import * as extensions from "@/utils/extensions";
import { TinhType } from "@/types/tinh/dto";

interface Props {
  item?: TinhType | null;
  onClose: () => void;
}

const TinhDetail: React.FC<Props> = ({ item, onClose }) => {
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
          <span className="ml-3 text-dark">Số thứ tự: {item?.sTT}</span>
        </p>

        <p>
          <span className="ml-3 text-dark">Tên Tỉnh: {item?.tenTinh}</span>
        </p>
        <p>
          <span className="ml-3 text-dark">Mã Tỉnh: {item?.maTinh}</span>
        </p>
      </div>
    </Drawer>
  );
};

export default TinhDetail;
