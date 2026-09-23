import { createConstant } from "./Constant";

const DepartmentTypeConstant = createConstant(
  {
    KhoiCoQuanChiNhanh: "KhoiCoQuanChiNhanh",
    Phong: "Phong",
  } as const,
  {
    KhoiCoQuanChiNhanh: { displayName: "Khối Cơ Quan Chi nhánh" },
    Phong: { displayName: "Phòng" },
  }
);

export default DepartmentTypeConstant;
