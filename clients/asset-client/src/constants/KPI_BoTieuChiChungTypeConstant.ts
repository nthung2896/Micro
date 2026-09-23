import { createConstant } from "./Constant";

const KPI_BoTieuChiChungTypeConstant = createConstant(
  {
    CaNhan: "CaNhan",
    TapThe: "TapThe",
  } as const,
  {
    CaNhan: { displayName: "Cá nhân" },
    TapThe: { displayName: "Tập thể" },
  }
);

export type KPI_BoTieuChiChungTypeValue = "CaNhan" | "TapThe";

export const KPI_BoTieuChiChungTypeOptions =
  KPI_BoTieuChiChungTypeConstant.getDropdownList();

export function getKPI_BoTieuChiChungTypeLabel(
  value?: string | null
): string {
  if (value === KPI_BoTieuChiChungTypeConstant.CaNhan) {
    return "Cá nhân";
  }
  if (value === KPI_BoTieuChiChungTypeConstant.TapThe) {
    return "Tập thể";
  }
  return "Chưa phân loại";
}

export default KPI_BoTieuChiChungTypeConstant;
