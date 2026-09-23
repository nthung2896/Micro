import { createConstant } from "./Constant";

const CompanyInfoStatusConstant = createConstant(
  {
    MoiTao: 0,
    DaDuyet: 1,
    BoSung: 2,
    ChinhSua: 3,
    TuChoi: 4,
    BiKhoa: 5,
    ChamDut: 6,
    ChoDuyet: 7,
    DeNghiChamDut: 8,
  } as const,
  {
    0: { displayName: "Mới tạo", color: "#8c8c8c" },
    1: { displayName: "Đã duyệt", color: "#16a34a" },
    2: { displayName: "Bổ sung", color: "#faad14" },
    3: { displayName: "Chỉnh sửa", color: "#faad14" },
    4: { displayName: "Từ chối", color: "#ff4d4f" },
    5: { displayName: "Bị khoá", color: "#ff4d4f" },
    6: { displayName: "Chấm dứt", color: "#ff4d4f" },
    7: { displayName: "Chờ duyệt", color: "#0355a2" },
    8: { displayName: "Đề nghị chấm dứt", color: "#faad14" },
  },
);

export default CompanyInfoStatusConstant;
