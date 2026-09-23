import { SearchBase } from "@/types/general";
export interface BCBaoCaoRequestType {
  id?: string;
  name: string;
  description: string;
  chuKyBaoCao?: string;
  isActive?: boolean;
  itemId?: string;
  templateFilePath?: string;
}

export interface BCBaoCaoSearchType extends SearchBase {
  name?: string;
  description?: string;
  chuKyBaoCao?: string;
  isActive?: boolean;
}
