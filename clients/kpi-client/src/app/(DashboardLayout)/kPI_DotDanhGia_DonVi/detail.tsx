import React from "react";
import { Drawer, Divider } from "antd";
import { KPI_DotDanhGia_DonViType } from "@/types/kPI_DotDanhGia_DonVi/kPI_DotDanhGia_DonVi";
import * as extensions from "@/utils/extensions";

interface Props {
  item?: KPI_DotDanhGia_DonViType | null;
  onClose: () => void;
}

const KPI_DotDanhGia_DonViDetail: React.FC<Props> = ({ item, onClose }) => {
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
						: {item?.idDotDanhGia}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						: {item?.idDonVi}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						: {item?.idBoChiSoNhiemVu}
					</span>
				</p>
      </div>
    </Drawer>
  );
};

export default KPI_DotDanhGia_DonViDetail;
