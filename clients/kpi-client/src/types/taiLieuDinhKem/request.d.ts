
import { SearchBase } from "@/types/general";
export interface DeleteFileRequestType  {
  ids?: string[];
}

export interface TaiLieuDinhKemRequestType  {
  id?: string;
  item_ID?: string;
  idBuocThucHienDVC?: string;
  userId?: string;
  idDonViUpload?: string;
  idDotKeKhaiSoLieu?: string;
  idDonViKhaoSat?: string;
  idDotKhaoSat?: string;
  idRootItem?: string;
  createdId?: string;
  updatedId?: string;
  soLuongDownload: number;
  lanKeKhai?: number;
  thangKhaoSat?: number;
  quyKhaoSat?: number;
  namKhaoSat?: number;
  isTempDelete?: boolean;
  isKySo?: boolean;
  kichThuoc?: number;
  tenTaiLieu?: string;
  loaiTaiLieu?: string;
  moTa?: string;
  duongDanFile?: string;
  duongDanFilePDF?: string;
  dinhDangFile?: string;
  ngayPhatHanh?: string;
  guid?: string;
  keyTieuChiKeKhai?: string;
  nguoiKy?: string;
  donViPhatHanh?: string;
  ngayKy?: string;
}

export interface TaiLieuDinhKemSearchType extends SearchBase {
  itemId?: string;
  kichThuocMax?: number;
  kichThuocMin?: number;
  tenTaiLieu?: string;
  loaiTaiLieu?: string;
  dinhDangFile?: string;
  isDonVi?: boolean;
}

export interface UpdateItemIdRequestType  {
  fileIds: string[];
  itemId: string;
}

export interface UploadAndSaveFileRequestType  {
  file: IFormFile;
  tenTaiLieuText?: string;
  folderType: string;
  itemId?: string;
  tagIds?: string[];
}

export interface UploadFileRequestType  {
  files?: IFormFileCollection;
  fileType?: string;
  itemId?: string;
  isTemp?: boolean;
}

