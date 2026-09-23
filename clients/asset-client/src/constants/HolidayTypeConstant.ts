import { createConstant } from "./Constant";

const HolidayTypeConstant = createConstant(
  {
    ANNUAL: "ANNUAL",
    AD_HOC: "AD_HOC",
    HolidayType: "HolidayType",
  } as const,
  {
    ANNUAL: { displayName: "Ngày lễ định kỳ hằng năm" },
    AD_HOC: { displayName: "Ngày nghỉ phát sinh/đặc biệt" },
    HolidayType: { displayName: "" },
  }
);

export default HolidayTypeConstant;
