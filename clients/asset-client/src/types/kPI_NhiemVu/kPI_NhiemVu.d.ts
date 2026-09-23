import { EntityType, SearchBase } from "../general";
import { TaiLieuDinhKemType } from "../taiLieuDinhKem/dto";

export interface KPI_DauRaNhiemVuAttachmentType {
  id?: string;
  clientKey?: string;
  tenSanPhamDauRa?: string;
  tieuChiId?: string;
  diemTheoBoTieuChi?: number;
  ghiChuGiaTrinh?: string;
  taiLieuDinhKem?: TaiLieuDinhKemType[];
  keptAttachmentIds?: string[];
  attachmentsTouched?: boolean;
}

export interface KPI_NhiemVuType extends EntityType {
  idNhiemVuTraVe: string;
	tenNhiemVuDayDu: string;
	tenNhiemVuRutGon: string;
	maLoaiNhiemVu: string;
	tenLoaiNhiemVu: string;
	nhiemVuTrongTam: string;
	thoiHan: Date;
	ngayHoanThanh: Date;
	ngayVanBan: Date;
	maNhiemVuCha: string;
	loaiHanXuLy: string;
	email: string;
	idDotTheoDoiDanhGia: string;
	idLyLich: string;
	idPhongBan: string;
	tenPhongBan: string;
	idNguoiXuLy: string;
	tenNguoiXuLy: string;
	idLinhVuc: string;
	tenLinhVuc: string;
	soLanCapNhatTienDo: number;
	isHoanThanh: boolean;
	isDaDuyet: boolean;
	status: string;
	ketQuaXuLyMoiNhat: string;
	ketQuaTuXepLoai: string;
	ketQuaPhoPhongXepLoai: string;
	ketQuaLanhDaoXepLoai: string;
	type: string;
	typeCaNhanTruongBan: string;
	emailsNguoiThucHien: string;
	timeDongBo: Date;
}

export interface KPI_NhiemVuCreateOrUpdateType {
  id?: string;
  idNhiemVuTraVe: string;
	tenNhiemVuDayDu: string;
	tenNhiemVuRutGon: string;
	maLoaiNhiemVu: string;
	tenLoaiNhiemVu: string;
	nhiemVuTrongTam: string;
	thoiHan: Date;
	ngayHoanThanh: Date;
	ngayVanBan: Date;
	maNhiemVuCha: string;
	loaiHanXuLy: string;
	email: string;
	idDotTheoDoiDanhGia: string;
	idLyLich: string;
	idPhongBan: string;
	tenPhongBan: string;
	idNguoiXuLy: string;
	tenNguoiXuLy: string;
	idLinhVuc: string;
	tenLinhVuc: string;
	soLanCapNhatTienDo: number;
	isHoanThanh: boolean;
	isDaDuyet: boolean;
	status: string;
	ketQuaXuLyMoiNhat: string;
	ketQuaTuXepLoai: string;
	ketQuaPhoPhongXepLoai: string;
	ketQuaLanhDaoXepLoai: string;
	type: string;
	typeCaNhanTruongBan: string;
	emailsNguoiThucHien: string;
	timeDongBo: Date;
}

export interface KPI_NhiemVuSearchType extends SearchBase {
  idNhiemVuTraVe?: string;
	tenNhiemVuDayDu?: string;
	tenNhiemVuRutGon?: string;
	maLoaiNhiemVu?: string;
	tenLoaiNhiemVu?: string;
	nhiemVuTrongTam?: string;
	thoiHan?: Date;
	thoiHanFrom?: Date;
	thoiHanTo?: Date;
	ngayHoanThanh?: Date;
	ngayHoanThanhFrom?: Date;
	ngayHoanThanhTo?: Date;
	ngayVanBan?: Date;
	ngayVanBanFrom?: Date;
	ngayVanBanTo?: Date;
	maNhiemVuCha?: string;
	loaiHanXuLy?: string;
	email?: string;
	idDotTheoDoiDanhGia?: string;
	idLyLich?: string;
	idPhongBan?: string;
	tenPhongBan?: string;
	idNguoiXuLy?: string;
	tenNguoiXuLy?: string;
	idLinhVuc?: string;
	tenLinhVuc?: string;
	soLanCapNhatTienDo?: number;
	isHoanThanh?: boolean;
	isDaDuyet?: boolean;
	status?: string;
	ketQuaXuLyMoiNhat?: string;
	ketQuaTuXepLoai?: string;
	ketQuaPhoPhongXepLoai?: string;
	ketQuaLanhDaoXepLoai?: string;
	type?: string;
	typeCaNhanTruongBan?: string;
	emailsNguoiThucHien?: string;
	timeDongBo?: Date;
	timeDongBoFrom?: Date;
	timeDongBoTo?: Date;
}
