import React from "react";
import { Drawer, Divider } from "antd";
import { KPI_VanBanDiType } from "@/types/kPI_VanBanDi/kPI_VanBanDi";
import * as extensions from "@/utils/extensions";

interface Props {
  item?: KPI_VanBanDiType | null;
  onClose: () => void;
}

const KPI_VanBanDiDetail: React.FC<Props> = ({ item, onClose }) => {
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
						DoMat: {item?.doMat}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						DepartmentId: {item?.departmentId}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						LoaiVanBan: {item?.loaiVanBan}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						SoHieu: {item?.soHieu}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						DoKhan: {item?.doKhan}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						TrichYeu: {item?.trichYeu}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						HanXuLy: {extensions.toDateString(item?.hanXuLy)}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						SoBan: {item?.soBan}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						SoDi: {item?.soDi}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						SoVanBanId: {item?.soVanBanId}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						NgayBanHanh: {extensions.toDateString(item?.ngayBanHanh)}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						IsCapSo: {item?.isCapSo}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						NgayVanBan: {extensions.toDateString(item?.ngayVanBan)}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						NguoiSoanThao: {item?.nguoiSoanThao}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						TrichYeuNormalized: {item?.trichYeuNormalized}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						TrangThai: {item?.trangThai}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						GhiChu: {item?.ghiChu}
					</span>
				</p>
      </div>
    </Drawer>
  );
};

export default KPI_VanBanDiDetail;
