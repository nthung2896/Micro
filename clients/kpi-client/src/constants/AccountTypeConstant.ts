import { createConstant } from "./Constant";

const AccountTypeConstant = createConstant(
  {
    CanBo: "CanBo",
    DoanhNghiep: "DoanhNghiep",
  } as const,
  {
    CanBo: { displayName: "Cán bộ" },
    DoanhNghiep: { displayName: "Doanh nghiệp" },
  }
);

export default AccountTypeConstant;
