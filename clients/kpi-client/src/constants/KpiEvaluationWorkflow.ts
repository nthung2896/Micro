export type KpiEvaluationRole =
  | "CaNhan"
  | "PhoTruongPhong"
  | "TruongPhong"
  | "PhoCucTruong"
  | "CucTruong"
  | "PhoVuTruong"
  | "VuTruong"
  | "PhoGiamDocTT"
  | "GiamDocTT"
  | "PhoGDTT"
  | "GD"
  | "PhoChanhVanPhong"
  | "ChanhVanPhong"
  | "PHOCHANHVANPHONG";

type WorkflowRoleConfig = {
  label: string;
  shortLabel: string;
  scoreTitle: string;
  nextRole: KpiEvaluationRole | null;
};

export const KPI_EVALUATION_WORKFLOW: Record<KpiEvaluationRole, WorkflowRoleConfig> = {
  CaNhan: {
    label: "Cá nhân tự đánh giá",
    shortLabel: "Cá nhân",
    scoreTitle: "Điểm do cá nhân tự chấm",
    nextRole: "PhoTruongPhong",
  },
  PhoTruongPhong: {
    label: "Phó Trưởng phòng",
    shortLabel: "Phó phòng",
    scoreTitle: "Điểm Phó Trưởng phòng đánh giá",
    nextRole: "TruongPhong",
  },
  TruongPhong: {
    label: "Trưởng phòng",
    shortLabel: "Trưởng phòng",
    scoreTitle: "Điểm Trưởng phòng đánh giá",
    nextRole: "PhoCucTruong",
  },
  PhoCucTruong: {
    label: "Phó Cục trưởng",
    shortLabel: "Phó Cục trưởng",
    scoreTitle: "Điểm Phó Cục trưởng đánh giá",
    nextRole: "CucTruong",
  },
  CucTruong: {
    label: "Cục trưởng",
    shortLabel: "Cục trưởng",
    scoreTitle: "Điểm Cục trưởng đánh giá",
    nextRole: null,
  },
  PhoVuTruong: {
    label: "Phó Vụ trưởng",
    shortLabel: "Phó Vụ trưởng",
    scoreTitle: "Điểm Phó Vụ trưởng đánh giá",
    nextRole: "VuTruong",
  },
  VuTruong: {
    label: "Vụ trưởng",
    shortLabel: "Vụ trưởng",
    scoreTitle: "Điểm Vụ trưởng đánh giá",
    nextRole: null,
  },
  PhoGiamDocTT: {
    label: "Phó Giám đốc TT",
    shortLabel: "Phó GĐ TT",
    scoreTitle: "Điểm Phó Giám đốc TT đánh giá",
    nextRole: "GiamDocTT",
  },
  GiamDocTT: {
    label: "Giám đốc TT",
    shortLabel: "Giám đốc TT",
    scoreTitle: "Điểm Giám đốc TT đánh giá",
    nextRole: null,
  },
  PhoGDTT: {
    label: "Phó Giám đốc TT",
    shortLabel: "Phó GĐ TT",
    scoreTitle: "Điểm Phó Giám đốc TT đánh giá",
    nextRole: "GD",
  },
  GD: {
    label: "Giám đốc TT",
    shortLabel: "Giám đốc TT",
    scoreTitle: "Điểm Giám đốc TT đánh giá",
    nextRole: null,
  },
  PhoChanhVanPhong: {
    label: "Phó Chánh Văn phòng",
    shortLabel: "Phó CVP",
    scoreTitle: "Điểm Phó Chánh Văn phòng đánh giá",
    nextRole: "ChanhVanPhong",
  },
  PHOCHANHVANPHONG: {
    label: "Phó Chánh Văn phòng",
    shortLabel: "Phó CVP",
    scoreTitle: "Điểm Phó Chánh Văn phòng đánh giá",
    nextRole: "ChanhVanPhong",
  },
  ChanhVanPhong: {
    label: "Chánh Văn phòng",
    shortLabel: "Chánh VP",
    scoreTitle: "Điểm Chánh Văn phòng đánh giá",
    nextRole: null,
  },
};

export function isVuDepartment(donViNameOrType?: string | null): boolean {
  if (!donViNameOrType) return false;
  const s = donViNameOrType.trim().toLowerCase();
  return (
    s === "vu" ||
    s.startsWith("vụ") ||
    s.includes("vụ ") ||
    s.includes("cấp vụ") ||
    s.includes("tochuccanbo") ||
    s.includes("tổ chức cán bộ")
  );
}

export function normalizeRoleValue(value: unknown): string {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function getOwnerEvaluationRole(
  chucVuCode?: string | null,
  donViNameOrType?: string | null,
): KpiEvaluationRole {
  if (!chucVuCode) return "CaNhan";
  const norm = normalizeRoleValue(chucVuCode);

  // 1. Cấp Giám đốc / Phó Giám đốc Trung tâm
  if (
    ["phogdtt", "phogiamdoctt", "pgdtt", "phogd", "pgd", "phogiamdoc"].includes(norm) ||
    norm.includes("phogiamdoc") ||
    norm.includes("phogd")
  ) {
    return "PhoGiamDocTT";
  }
  if (
    ["gd", "giamdoctt", "gdtt", "giamdoc", "quyengiamdoc"].includes(norm) ||
    norm.includes("giamdoc")
  ) {
    return "GiamDocTT";
  }

  // 2. Cấp Chánh / Phó Chánh Văn phòng
  if (
    ["phochanhvanphong", "phocvp", "phovp", "phochadnhvanphong"].includes(norm) ||
    norm.includes("phochanhvanphong") ||
    norm.includes("phocvp")
  ) {
    return "PhoChanhVanPhong";
  }
  if (
    ["chanhvanphong", "cvp", "chanhvp", "truongvanphong"].includes(norm) ||
    norm.includes("chanhvanphong") ||
    norm.includes("chanhvp")
  ) {
    return "ChanhVanPhong";
  }

  // 3. Cấp Vụ trưởng / Phó Vụ trưởng
  if (
    ["phovutruong", "phovu", "pvt"].includes(norm) ||
    norm.includes("phovu")
  ) {
    return "PhoVuTruong";
  }
  if (
    ["vutruong", "vt", "truongvu"].includes(norm) ||
    norm.includes("vutruong")
  ) {
    return "VuTruong";
  }

  // 4. Cấp Cục trưởng / Phó Cục trưởng
  if (
    ["phocuctruong", "phocuc", "pct"].includes(norm) ||
    norm.includes("phocuc")
  ) {
    return "PhoCucTruong";
  }
  if (
    ["cuctruong", "ct"].includes(norm) ||
    norm.includes("cuctruong")
  ) {
    return "CucTruong";
  }

  // 5. Cấp Trưởng / Phó Trưởng phòng
  if (
    ["photruongphong", "photp", "ptp", "phophong"].includes(norm) ||
    norm.includes("photruongphong") ||
    norm.includes("phophong")
  ) {
    return "PhoTruongPhong";
  }
  if (
    ["truongphong", "tp"].includes(norm) ||
    norm.includes("truongphong")
  ) {
    return "TruongPhong";
  }

  return "CaNhan";
}

export function getNextEvaluationRole(
  ownerRole: KpiEvaluationRole,
  donViNameOrType?: string | null,
): KpiEvaluationRole | null {
  const isVu = isVuDepartment(donViNameOrType);
  if (ownerRole === "CaNhan") {
    return isVu ? "PhoVuTruong" : "PhoTruongPhong";
  }
  return KPI_EVALUATION_WORKFLOW[ownerRole]?.nextRole ?? null;
}

export function getEvaluationRoleLabel(role?: KpiEvaluationRole | string | null): string {
  if (!role) return "Hoàn tất";
  return KPI_EVALUATION_WORKFLOW[role as KpiEvaluationRole]?.label || role;
}

export function getEvaluationRoleShortLabel(role?: KpiEvaluationRole | string | null): string {
  if (!role) return "Hoàn tất";
  return KPI_EVALUATION_WORKFLOW[role as KpiEvaluationRole]?.shortLabel || role;
}

export function getEvaluationScoreTitle(role?: KpiEvaluationRole | string | null): string {
  if (!role) return "Điểm cấp trên đánh giá";
  return KPI_EVALUATION_WORKFLOW[role as KpiEvaluationRole]?.scoreTitle || `Điểm ${role} đánh giá`;
}
