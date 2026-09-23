import { createConstant } from "./Constant";

const RoleConstant = createConstant(
  {
    Admin: "Admin",
    DoanhNghiep: "DoanhNghiep",
    ChuyenVienSo: "ChuyenVienSo",
    TruongPhongSo: "TruongPhongSo",
    LanhDaoSo: "LanhDaoSo",
    ChuyenVienCuc: "ChuyenVienCuc",
    TruongPhongCuc: "TruongPhongCuc",
    LanhDaoCuc: "LanhDaoCuc",
    CVQUANLYTHITRUONG: "CVQUANLYTHITRUONG",
  } as const,
  {
    Admin: { displayName: "Quản trị viên" },
    DoanhNghiep: { displayName: "Doanh nghiệp" },
    ChuyenVienSo: { displayName: "Chuyên viên sở" },
    TruongPhongSo: { displayName: "Trưởng phòng sở" },
    LanhDaoSo: { displayName: "Lãnh đạo sở" },
    ChuyenVienCuc: { displayName: "Chuyên viên cục" },
    TruongPhongCuc: { displayName: "Trưởng phòng cục" },
    LanhDaoCuc: { displayName: "Lãnh đạo cục" },
    CVQUANLYTHITRUONG: { displayName: "Chuyên viên quản lý thị trường" },
  }
);

export default RoleConstant;
