import { EntityType } from "@/types/general";
import { FileDinhKemType } from "@/types/notification/dto";

export interface NotificationType extends EntityType {
  message: string;
  link: string;
  fromUser?: string;
  toUser?: string;
  isRead: boolean;
  type: string;
  sendToFrontEndUser?: boolean;
  itemId?: string;
  itemName: string;
  itemType?: string;
  isDisplay?: boolean;
  donViId?: string;
  email?: string;
  loaiThongBao?: string;
  productId?: string;
  productName?: string;
  tieuDe: string;
  noiDung: string;
  nguoiTao?: string;
  fileDinhKem?: string;
  isXuatBan?: boolean;
  fromUserName: string;
  fileTaiLieu?: FileDinhKemType;
  createStr: string;
}

export interface FileDinhKemType {
  id: string;
  name: string;
  url: string;
}

