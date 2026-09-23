import { createConstant } from "./Constant";

const DangKyXemStatusConstant = createConstant(
  {
    TamLuu: 0,
    ChoDuyet: 1,
    DaPheDuyet: 2,
    DaTuChoi: 3,
  } as const,
  {
    0: { displayName: "Tạm lưu", color: "#0355a2" },
    1: { displayName: "Chờ duyệt", color: "#0355a2" },
    2: { displayName: "Đã phê duyệt", color: "#43c511ff" },
    3: { displayName: "Từ chối", color: "#ff4d4f" },
  },
);

export default DangKyXemStatusConstant;
