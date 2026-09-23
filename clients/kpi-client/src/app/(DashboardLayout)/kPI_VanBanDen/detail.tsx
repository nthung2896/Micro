import React from "react";
import { Drawer, Divider } from "antd";
import { KPI_VanBanDenType } from "@/types/kPI_VanBanDen/kPI_VanBanDen";
import * as extensions from "@/utils/extensions";

interface Props {
  item?: KPI_VanBanDenType | null;
  onClose: () => void;
}

const KPI_VanBanDenDetail: React.FC<Props> = ({ item, onClose }) => {
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
						: {item?.idVanBanDongBo}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						: {item?.soVanBan}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						: {extensions.toDateString(item?.ngayVanBan)}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						: {item?.trichYeu}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						: {item?.trangThai}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						: {extensions.toDateString(item?.ngayHoanThanh)}
					</span>
				</p>
      </div>
    </Drawer>
  );
};

export default KPI_VanBanDenDetail;
