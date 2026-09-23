import React from "react";
import { Drawer, Divider } from "antd";
import { KPI_CauHinhCongThucNhiemVuType } from "@/types/kPI_CauHinhCongThucNhiemVu/kPI_CauHinhCongThucNhiemVu";
import * as extensions from "@/utils/extensions";

interface Props {
  item?: KPI_CauHinhCongThucNhiemVuType | null;
  onClose: () => void;
}

const KPI_CauHinhCongThucNhiemVuDetail: React.FC<Props> = ({ item, onClose }) => {
  return (
    <Drawer
      title={`Thông tin chi tiết`}
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
						Đơn vị: {item?.idDonVi}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						Đợt đánh giá: {item?.idDotDanhGia}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						Bảng đích: {item?.targetTable}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						Cột đích: {item?.targetColumn}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						Công thức: {item?.fomula}
					</span>
				</p>
      </div>
    </Drawer>
  );
};

export default KPI_CauHinhCongThucNhiemVuDetail;
