export interface EnterprisePlatformItemCreateRequestType {
  platformManageId: string;
  name?: string;
  websiteLink?: string;
  note?: string;
}

export interface EnterprisePlatformItemUpdateRequestType
  extends EnterprisePlatformItemCreateRequestType {
  id: string;
}
