import LoaiTaiLieuConstant from "@/constants/LoaiTaiLieuConstant";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";
import { UploadListType, UploadType } from "antd/es/upload/interface";
import { UploadFile, UploadProps } from "antd/lib";

type LoaiTaiLieuType = keyof Omit<
  typeof LoaiTaiLieuConstant,
  "data" | "getDisplayName" | "getDropdownList"
>;

export type UseFileUploaderOptions = {
  maxCount?: number;
  initFiles?: TaiLieuDinhKemType[];
  FileType: LoaiTaiLieuType | string;
  uploadType?: UploadType;
  listType?: UploadListType;
  itemId?: string;
  beforeUpload?: (file: File) => boolean | Promise<boolean>;
  requiredKySo?: boolean;
  includeExportInfo?: boolean;
  category?: string;
  subCategory?: string;
  taxCode?: string;
};

export type UseFileUploaderReturnType = {
  // Danh sách file
  files: TaiLieuDinhKemType[];
  setFiles: React.Dispatch<React.SetStateAction<TaiLieuDinhKemType[]>>;
  getFiles: () => TaiLieuDinhKemType[];
  getFileIds: () => string[];
  resetFiles: () => void;
  setFilesByItemId: (itemId: string, type?: string) => Promise<void>;

  // Cấu hình upload
  maxCount: number;
  uploadType?: UploadType;
  listType?: UploadListType;
  itemId?: string;
  FileType: LoaiTaiLieuType | string;
  category?: string;
  subCategory?: string;
  taxCode?: string;

  // Danh sách file hiển thị trong Upload của Antd
  uploadFileList: UploadFile[];

  // Preview chung
  handlePreview: (file: UploadFile) => void;
  handleCheckFile: (file: UploadFile) => void;

  // ⬇⬇⬇ PREVIEW FILE KHÔNG PHẢI ẢNH (PDF / OFFICE) ⬇⬇⬇
  previewFileVisible: boolean;
  previewFileUrl: string;
  handleCancelPreviewFile: () => void;

  // ⬇⬇⬇ PREVIEW ẢNH (popup mặc định của AntD) ⬇⬇⬇
  imagePreviewVisible: boolean;
  imagePreviewUrl: string;
  setImagePreviewVisible: React.Dispatch<React.SetStateAction<boolean>>;

  // Xoá / tải / upload
  handleRemove: (file: UploadFile) => Promise<void>;
  customRequest: UploadProps["customRequest"];
  handleDownload: (file: UploadFile) => void;

  // Validate upload
  beforeUpload?: (file: File) => boolean | Promise<boolean>;

  // Other
  readonly: boolean;
  uploading: boolean;
};

export interface CertificateInfoType {
  cn?: string;
  issuer?: string;
  serialNumber?: string;
  signedAt: Date;
  isValid: boolean;
  isExpired: boolean;
  documentModified: boolean;
}

export interface FileValidationType {
  isValid: boolean;
  fileType?: string;
  sizeKB: number;
  isRealExtension: boolean;
  isNotCorrupted: boolean;
  isSignedPdf: boolean;
  pdfSignatureValid: boolean;
  pdfNotTampered: boolean;
  imageEdited: boolean;
  containsMalware: boolean;
  message?: string;
  errors: string[];
  pdfCertificates: CertificateInfoType[];
  containsMacro: boolean;
  containsPdfJavaScript: boolean;
}
