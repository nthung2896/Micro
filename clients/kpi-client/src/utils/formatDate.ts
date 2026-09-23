//CreatedBy:TruongTD
//EditedBy: Hsu 18/11/2025
import dayjs from "dayjs";

const formatDate = (
  date: Date | string | null,
  dateOnly: boolean = false,
): string => {
  if (!date) return "";

  // dayjs sẽ tự parse cả Date object lẫn ISO string
  const d = dayjs(date);

  if (!d.isValid()) return "";

  return dateOnly ? d.format("DD/MM/YYYY") : d.format("DD/MM/YYYY HH:mm:ss");
};

export default formatDate;
