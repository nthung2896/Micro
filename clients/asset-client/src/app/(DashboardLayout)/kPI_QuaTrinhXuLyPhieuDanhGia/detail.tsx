import React from "react";
import { Drawer, Divider } from "antd";
import { KPI_QuaTrinhXuLyPhieuDanhGiaType } from "@/types/kPI_QuaTrinhXuLyPhieuDanhGia/kPI_QuaTrinhXuLyPhieuDanhGia";
import * as extensions from "@/utils/extensions";

interface Props {
  item?: KPI_QuaTrinhXuLyPhieuDanhGiaType | null;
  onClose: () => void;
}

const KPI_QuaTrinhXuLyPhieuDanhGiaDetail: React.FC<Props> = ({ item, onClose }) => {
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
						: {item?.idPhieuDanhGia}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						: {item?.isXuLy}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						: {item?.idNguoiXuLy}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						: {item?.idNguoiGui}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						: {item?.trangThai}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						: {item?.ghiChu}
					</span>
				</p>
      </div>
    </Drawer>
  );
};

export default KPI_QuaTrinhXuLyPhieuDanhGiaDetail;
