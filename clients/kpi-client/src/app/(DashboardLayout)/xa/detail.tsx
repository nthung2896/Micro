import React from "react";
import { Drawer, Divider } from "antd";
import { XaType } from "@/types/xa/xa";
import * as extensions from "@/utils/extensions";

interface Props {
  item?: XaType | null;
  onClose: () => void;
}

const XaDetail: React.FC<Props> = ({ item, onClose }) => {
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
					<span className="ml-3 text-dark">
						: {item?.isXaMoi}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						: {item?.maXa}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						: {item?.tenXa}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						: {item?.maHuyen}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						: {item?.loai}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						: {item?.maTinh}
					</span>
				</p>
      </div>
    </Drawer>
  );
};

export default XaDetail;
