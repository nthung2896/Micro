import { EntityType } from "@/types/general";

export interface DanhSachTaiLieuType {
  id: string;
  tenTaiLieu: string;
  loaiTaiLieu: string;
  duongDanFile: string;
}

export interface FileInfoResponseType {
  id: string;
  tenTaiLieuGoc: string;
  tenTaiLieuText: string;
  kichThuoc?: number;
  extension: string;
}

export interface TaiLieuDinhKemType extends EntityType {
  kichThuoc?: number;
  tenTaiLieu: string;
  loaiTaiLieu?: string;
  itemId?: string;
  duongDanFile: string;
  duongDanFilePDF: string;
  extension: string;
  userId?: string;
  tenTaiLieuText: string;
  isKySo?: boolean;
  nguoiKy?: string;
  donViPhatHanh?: string;
  ngayKy?: string;
  coChuKySo?: boolean;
  isXoaFile: boolean;
  groupTxt?: string;
  loaiTaiLieuTxt?: string;
}

export interface UploadFileType {
  files?: IFormFileCollection;
  fileType?: string;
  itemId?: string;
  isTemp?: boolean;
  moTa?: string;
  idBieuMau?: string;
}

