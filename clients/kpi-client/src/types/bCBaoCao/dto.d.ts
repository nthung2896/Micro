import { EntityType } from "@/types/general";

export interface BCBaoCaoType extends EntityType {
  name: string;
  description: string;
  mongoFormTemplateId?: string;
  chuKyBaoCao?: string;
  isActive?: boolean;
  itemId?: string;
  templateFilePath?: string;
}
