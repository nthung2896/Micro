//CreatedBy:TruongTD
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/vi";
dayjs.locale("vi");
export const convertDayjsToISOString = (dayjsObject: Dayjs): string => {
  const date = dayjsObject.toDate();
  date.setHours(date.getHours() + 7);
  return date.toISOString();
};

export const convertDateTime = (DateStr: Date | string | null | undefined) => {
  if (!DateStr) return "";
  if (typeof DateStr !== "string") {
    const fixedString = DateStr.toISOString().replace(/(\.\d{3})\d+/, "$1");
    const date = dayjs(fixedString).format("DD/MM/YYYY");
    return date;
  } else {
    const fixedString = DateStr.replace(/(\.\d{3})\d+/, "$1");
    const date = dayjs(fixedString).format("DD/MM/YYYY");
    return date;
  }
};
