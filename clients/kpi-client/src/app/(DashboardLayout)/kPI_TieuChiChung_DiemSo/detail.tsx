import React from "react";
import { Drawer, Divider } from "antd";
import { KPI_TieuChiChung_DiemSoType } from "@/types/kPI_TieuChiChung_DiemSo/kPI_TieuChiChung_DiemSo";
import * as extensions from "@/utils/extensions";

interface Props {
  item?: KPI_TieuChiChung_DiemSoType | null;
  onClose: () => void;
}

const KPI_TieuChiChung_DiemSoDetail: React.FC<Props> = ({ item, onClose }) => {
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
						: {item?.idTieuChiChung}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						: {item?.idLyLich}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						: {item?.idDotDanhGia}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						: {item?.diemTuCham}
					</span>
				</p>
      </div>
    </Drawer>
  );
};

export default KPI_TieuChiChung_DiemSoDetail;
