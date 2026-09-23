export interface MauTraLoiSearchType {
  keyword?: string;
  type?: string;
  nhomTaiLieu?: string;
  pageIndex: number;
  pageSize: number;
}

export interface MauTraLoiRequestType {
  id?: string;
  name: string;
  content: string;
  type: string;
  nhomTaiLieu: string;
}
