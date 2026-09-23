export interface FileValidationType {
  isValid?: boolean;
  message?: string;
  fileName?: string;
  duongDanFile?: string;
  duongDanFilePDF?: string;
  extension?: string;
  kichThuoc?: number;
  errors?: string[];
  warnings?: string[];
  [key: string]: any;
}
