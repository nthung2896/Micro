import React from "react";
import { Drawer, Divider } from "antd";
import { KPI_NhiemVuType } from "@/types/kPI_NhiemVu/kPI_NhiemVu";
import * as extensions from "@/utils/extensions";

interface Props {
  item?: KPI_NhiemVuType | null;
  onClose: () => void;
}

const KPI_NhiemVuDetail: React.FC<Props> = ({ item, onClose }) => {
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
						IdNhiemVuTraVe: {item?.idNhiemVuTraVe}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						TenNhiemVuDayDu: {item?.tenNhiemVuDayDu}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						TenNhiemVuRutGon: {item?.tenNhiemVuRutGon}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						MaLoaiNhiemVu: {item?.maLoaiNhiemVu}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						TenLoaiNhiemVu: {item?.tenLoaiNhiemVu}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						NhiemVuTrongTam: {item?.nhiemVuTrongTam}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						ThoiHan: {extensions.toDateString(item?.thoiHan)}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						NgayHoanThanh: {extensions.toDateString(item?.ngayHoanThanh)}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						NgayVanBan: {extensions.toDateString(item?.ngayVanBan)}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						MaNhiemVuCha: {item?.maNhiemVuCha}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						LoaiHanXuLy: {item?.loaiHanXuLy}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						Email: {item?.email}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						IdDotTheoDoiDanhGia: {item?.idDotTheoDoiDanhGia}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						IdLyLich: {item?.idLyLich}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						IdPhongBan: {item?.idPhongBan}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						TenPhongBan: {item?.tenPhongBan}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						IdNguoiXuLy: {item?.idNguoiXuLy}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						TenNguoiXuLy: {item?.tenNguoiXuLy}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						IdLinhVuc: {item?.idLinhVuc}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						TenLinhVuc: {item?.tenLinhVuc}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						SoLanCapNhatTienDo: {item?.soLanCapNhatTienDo}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						IsHoanThanh: {item?.isHoanThanh}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						IsDaDuyet: {item?.isDaDuyet}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						Status: {item?.status}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						KetQuaXuLyMoiNhat: {item?.ketQuaXuLyMoiNhat}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						KetQuaTuXepLoai: {item?.ketQuaTuXepLoai}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						KetQuaPhoPhongXepLoai: {item?.ketQuaPhoPhongXepLoai}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						KetQuaLanhDaoXepLoai: {item?.ketQuaLanhDaoXepLoai}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						Type: {item?.type}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						TypeCaNhanTruongBan: {item?.typeCaNhanTruongBan}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						EmailsNguoiThucHien: {item?.emailsNguoiThucHien}
					</span>
				</p>
				<p>
					<span className="ml-3 text-dark">
						TimeDongBo: {extensions.toDateString(item?.timeDongBo)}
					</span>
				</p>
      </div>
    </Drawer>
  );
};

export default KPI_NhiemVuDetail;
