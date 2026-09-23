import React from "react";
import { Drawer, Divider } from "antd";
import { KPI_ThoiDiemDongBoVanBanType } from "@/types/kPI_ThoiDiemDongBoVanBan/kPI_ThoiDiemDongBoVanBan";
import * as extensions from "@/utils/extensions";

interface Props {
  item?: KPI_ThoiDiemDongBoVanBanType | null;
  onClose: () => void;
}

const KPI_ThoiDiemDongBoVanBanDetail: React.FC<Props> = ({ item, onClose }) => {
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
						IdVanBan: {item?.idVanBan}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						TypeVanBan: {item?.typeVanBan}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						ThoiGianDongBoVanBan: {extensions.toDateString(item?.thoiGianDongBoVanBan)}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						IsTuNhap: {item?.isTuNhap}
					</span>
				</p>
      </div>
    </Drawer>
  );
};

export default KPI_ThoiDiemDongBoVanBanDetail;
