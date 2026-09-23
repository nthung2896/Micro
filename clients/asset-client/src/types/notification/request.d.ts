
import { SearchBase } from "@/types/general";
export interface NotificationNhacNhoRequestType  {
  message?: string;
  link?: string;
  fromUser?: string;
  fromUserName: string;
  itemId?: string;
}

export interface NotificationRequestType  {
  id?: string;
  itemId?: string;
  createdId?: string;
  updatedId?: string;
  fromUser?: string;
  toUser?: string;
  message?: string;
  link?: string;
  type?: string;
  donViId?: string;
  itemType?: string;
  isDisplay?: boolean;
  sendToFrontEndUser?: boolean;
  itemName?: string;
  isRead: boolean;
  email?: string;
  loaiThongBao?: string;
  productId?: string;
  productName?: string;
  tieuDe?: string;
  noiDung?: string;
  nguoiTao?: string;
  fileDinhKem?: string;
  isXuatBan?: boolean;
}

export interface NotificationSearchType extends SearchBase {
  itemId?: string;
  createdId?: string;
  updatedId?: string;
  fromUser?: string;
  fromUserName?: string;
  toUser?: string;
  message?: string;
  link?: string;
  type?: string;
  fromDate?: Date;
  toDate?: Date;
  isRead?: boolean;
  email?: string;
  loaiThongBao?: string;
  productId?: string;
  productName?: string;
}

