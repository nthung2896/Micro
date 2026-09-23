import { UploadListType, UploadType } from "antd/es/upload/interface";
import { TaiLieuDinhKemType } from "@/types/taiLieuDinhKem/dto";
import { UploadFile, UploadProps } from "antd/lib";
import LoaiTaiLieuConstant from "@/constants/LoaiTaiLieuConstant";

type LoaiTaiLieuType = keyof Omit<
  typeof LoaiTaiLieuConstant,
  "data" | "getDisplayName" | "getDropdownList"
>;

export type UseFileUploaderOptions = {
  maxCount?: number;
  initFiles?: TaiLieuDinhKemType[];
  FileType: LoaiTaiLieuType;
  uploadType?: UploadType;
  listType?: UploadListType;
  itemId?: string;
  beforeUpload?: (file: File) => boolean | Promise<boolean>;
  category?: string;
  subCategory?: string;
  taxCode?: string;
};

export type UseFileUploaderReturnType = {
  files: TaiLieuDinhKemType[];
  setFiles: React.Dispatch<React.SetStateAction<TaiLieuDinhKemType[]>>;
  getFiles: () => TaiLieuDinhKemType[];
  getFileIds: () => string[];
  resetFiles: () => void;
  setFilesByItemId: (itemId: string) => Promise<void>;
  maxCount: number;
  uploadType?: UploadType;
  listType?: UploadListType;
  itemId?: string;
  FileType: LoaiTaiLieuType;
  category?: string;
  subCategory?: string;
  taxCode?: string;
  previewVisible: boolean;
  previewImage: string;
  uploadFileList: UploadFile[];
  handlePreview: (file: UploadFile) => void;
  handleCheckFile: (file: UploadFile) => void;
  handleCancel: () => void;
  handleRemove: (file: UploadFile) => Promise<void>;
  customRequest: UploadProps["customRequest"];
  handleDownload: (file: UploadFile) => void;
  beforeUpload?: (file: File) => boolean | Promise<boolean>;
};
