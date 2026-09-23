/** Tham chiếu khi mở form sửa — chi tiết load qua API Get */
export type PlatformManageItemRef = { id: string };

export interface AppInfoItemType {
  id: string;
  platformManageId: string;
  appName?: string;
  osCode?: string;
  osName?: string;
  appLink?: string;
  appLogo?: string;
}

export interface PlatformManageType {
  id: string;
  status: number;
  statusName?: string;
  appManageTypeId?: number;
  platformManageTypeId?: string;
  platformType?: string;
  availabilityType?: number;
  chucNangNenTang?: string;
  platformManageTypeName?: string;
  organizationId?: string;
  companyName?: string;
  companyTaxCode?: string;
  companyAddress?: string;
  companyEmail?: string;
  websiteNumber?: string;
  name?: string;
  domain?: string;
  chuSoHuu?: string;
  logo?: string;
  domainOwner?: string;
  imagePath?: string;
  appIconPath?: string;
  ispId?: string;
  ispIdKhac?: string;
  ispName?: string;
  urlApp?: string;
  uRLApp?: string;
  appOS?: string;
  loaiHangHoaKhac?: string;
  loaiHangHoaKhacName?: string;
  phuongThucLienHe?: string;
  phuongThucLienHeOnline?: string;

  // --- 9.4.1. Thông tin đại diện được chỉ định theo uỷ quyền tại Việt Nam ---
  representerNameUyQuyen?: string;
  representerJobUyQuyen?: string;
  representerCCCDUyQuyen?: string;
  representerDiaChiUyQuyen?: string;
  representerMobileUyQuyen?: string;
  representerEmailUyQuyen?: string;

  ngonNgu?: string;
  ngonNguTxt?: string;
  chinhSachBaoMat?: string;
  tiepNhanKhieuNai?: string;
  chinhSachGia?: string;
  chinhSachThanhToan?: string;
  dieuKienCungCap?: string;
  chinhSachGiaoHang?: string;

  // --- 7.1. Các chính sách bổ sung theo yêu cầu mới ---
  phuongThucGiaiQuyetPhanAnh?: string;
  dieuKienOrHanCheCungCapHHDV?: string;
  chinhSachApDungHHDV?: string;
  hinhThucHoTroTrucTuyen?: string;

  representerName?: string;
  representerJob?: string;
  representerCCCD?: string;
  representerDiaChi?: string;
  addressDaiDien?: string;
  representerMobile?: string;
  representerEmail?: string;
  representerNameOnline?: string;
  representerJobOnline?: string;
  representerCCCDOnline?: string;
  addressOnline?: string;
  representerDiaChiOnline?: string;
  representerMobileOnline?: string;
  representerEmailOnline?: string;
  submitDate?: Date;
  submitName?: string;
  reviewDate?: Date;
  reviewName?: string;
  reviewMaCanBo?: string;
  reviewId?: string;
  requestChangeDate?: Date;
  requestChangeName?: string;
  requestChangeMaCanBo?: string;
  createdBy?: string;
  updatedDate: Date;
  updatedBy?: string;
  createdDate: Date;
  dateLine?: Date | string | null;
  dateLineEnterprise?: Date | string | null;
  companyPhone?: string;
  staffNumber?: number;
  detail?: string;
  detailName?: string;

  // Thông tin mở rộng (Decoupled)
  appInfoItems?: AppInfoItemType[];
  productCategoryCodes?: string[];

  websiteNumberSo?: string;
  websiteNumberNgay?: string | Date;
  websiteNumberNoiCap?: string;
  representerJobDaiDienSo?: string;
  representerJobDaiDienNgay?: string | Date;
  representerJobDaiDienNoiCap?: string;
  representerJobDaiDien?: string;
  representerMobileDaiDien?: string;
  representerEmailDaiDien?: string;
  phuongThucLienHeDaiDien?: string;
  domainAdd?: string;
  userApp?: string;
  seal?: string;
  representerCCCDDL?: string;
  representerMobileDL?: string;
  representerEmailDL?: string;
  addressDL?: string;
  qlHdtmdt_HoTen?: string;
  qlHdtmdt_ChucDanh?: string;
  qlHdtmdt_CCCD?: string;
  qlHdtmdt_SDT?: string;
  qlHdtmdt_Email?: string;
  qlHdtmdt_DiaChi?: string;
  qlKhieuNai_HoTen?: string;
  qlKhieuNai_ChucDanh?: string;
  qlKhieuNai_CCCD?: string;
  qlKhieuNai_SDT?: string;
  qlKhieuNai_Email?: string;
  qlKhieuNai_DiaChi?: string;
  phapNhanChiDinh_HoTen?: string;
  phapNhanChiDinh_CCCD?: string;
  phapNhanChiDinh_SDT?: string;
  phapNhanChiDinh_Email?: string;
  phapNhanChiDinh_DiaChi?: string;
  isNuocNgoai?: boolean;
  representerNameDaiDien?: string;

  // --- 9.5. Nhân sự chịu trách nhiệm quản lý, vận hành Hệ thống tiếp nhận và giải quyết phản ánh... ---
  representerNameVanHanh?: string;
  representerJobVanHanh?: string;
  representerCCCDVanHanh?: string;
  representerDiaChiVanHanh?: string;
  representerMobileVanHanh?: string;
  representerEmailVanHanh?: string;

  // --- 9.6. Thông tin pháp nhân ủy quyền tại Việt Nam (Cho Nền tảng Nước ngoài) ---
  organizationNameUyQuyen?: string;
  organizationCodeUyQuyen?: string;
  organizationFileDangKyUyQuyen?: string;
  organizationDiaChiUyQuyen?: string;
  organizationEmailUyQuyen?: string;

  // --- 9.7. Đầu mối liên hệ ủy quyền (Cho Nền tảng Nước ngoài) ---
  representerNameDauMoiUyQuyen?: string;
  representerJobDauMoiUyQuyen?: string;
  representerCCCDDauMoiUyQuyen?: string;
  representerDiaChiDauMoiUyQuyen?: string;
  representerMobileDauMoiUyQuyen?: string;
  representerEmailDauMoiUyQuyen?: string;
  isNenTangLon?: boolean;
  appCount?: number;

  // DVC Sync fields
  dvcMaHoSo?: string;
  dvcIdHoSo?: string;
  dvcSyncStatus?: number;
  dvcSyncDate?: string | Date;
  dvcErrorMessage?: string;
}

export type PlatformManage = PlatformManageType;

/** DTO danh sách nền tảng trực tuyến — chỉ trường hiển thị trên lưới */
export interface PlatformManageListType {
  id: string;
  organizationId?: string;
  status: number;
  statusName?: string;
  imagePath?: string;
  platformManageTypeId?: string;
  platformManageTypeName?: string;    // Tên loại nền tảng (cho cột CV)
  name?: string;
  domain?: string;
  companyName?: string;
  companyTaxCode?: string;            // MST/Mã GCN (cho CV tra cứu nhanh)
  createdDate?: Date | string | null; // Ngày tạo (cho DN theo dõi)
  submitDate?: Date | string | null;
  reviewDate?: Date | string | null;  // Ngày duyệt (fix bug: đang dùng nhưng thiếu trong type)
  reviewName?: string | null;
  reviewMaCanBo?: string | null;
  reviewId?: string | null;
  detail?: string | null;             // Ghi chú trả về — DN xem lý do từ chối/bổ sung
  isNenTangLon?: boolean;
  companyEmail?: string;
  appCount?: number;
  dateLine?: Date | string | null;
  dateLineEnterprise?: Date | string | null;
  representerName?: string;
  representerMobile?: string;
  representerEmail?: string;

  // DVC Sync fields
  dvcMaHoSo?: string;
  dvcSyncStatus?: number;
  dvcErrorMessage?: string;

  // Dành cho hiển thị đăng ký xem
  allowedTabs?: string;
  allowedFromDate?: Date | string | null;
  allowedToDate?: Date | string | null;
}
