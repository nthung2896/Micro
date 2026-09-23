import { createConstant } from "./Constant";

const MaDanhMucConstant = createConstant(
  {
    SOLANDANGNHAPTOIDA: "SOLANDANGNHAPTOIDA",
    SOLANDANGNHAP: "SOLANDANGNHAP",
    THOIGIANKHOA: "THOIGIANKHOA",
  } as const,
  {
    SOLANDANGNHAPTOIDA: { displayName: "" },
    SOLANDANGNHAP: { displayName: "" },
    THOIGIANKHOA: { displayName: "" },
  }
);

export default MaDanhMucConstant;
