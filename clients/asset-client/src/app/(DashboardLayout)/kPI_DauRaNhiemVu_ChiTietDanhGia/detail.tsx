import React from "react";
import { Drawer, Divider } from "antd";
import { KPI_DauRaNhiemVu_ChiTietDanhGiaType } from "@/types/kPI_DauRaNhiemVu_ChiTietDanhGia/kPI_DauRaNhiemVu_ChiTietDanhGia";
import * as extensions from "@/utils/extensions";

interface Props {
  item?: KPI_DauRaNhiemVu_ChiTietDanhGiaType | null;
  onClose: () => void;
}

const KPI_DauRaNhiemVu_ChiTietDanhGiaDetail: React.FC<Props> = ({ item, onClose }) => {
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
						: {item?.idDauRaNhiemVu}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						: {item?.idPhieuDanhGia}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						: {item?.vaiTroDanhGia}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						: {item?.nguoiDanhGiaId}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						: {item?.chamDiemSoLuong_HoanThanh}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						: {item?.chamDiemSoLuong_KhongHoanThanh}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						: {item?.chamDiemSoLuong_Diem}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						: {item?.chamDiemChatLuong_KhongDat}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						: {item?.chamDiemChatLuong_SoDiemConLai}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						: {item?.chamDiemChatLuong_Diem}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						: {item?.chamDiemTienDo_KhongDat}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						: {item?.chamDiemTienDo_SoDiemConLai}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						: {item?.chamDiemTienDo_Diem}
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

export default KPI_DauRaNhiemVu_ChiTietDanhGiaDetail;
