import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(customParseFormat);

/**
 * Converts a date to an ISO string representing midnight UTC of that date.
 * If the input is null, undefined, or an invalid date, it returns null.
 * @param date The date to convert (can be Dayjs object, string, Date object, null, or undefined).
 * @returns ISO string (e.g., "2023-10-26T00:00:00.000Z") or null.
 */
export const formatDateToUtcStartOfDayISO = (date: any): string | null => {
  if (date === null || typeof date === "undefined") {
    return null;
  }
  const d = dayjs(date);
  if (!d.isValid()) {
    // Optionally, you could log an error or return the original invalid input,
    // but for consistency with backend expectations of null for bad dates, returning null.
    console.warn(
      "Invalid date provided to formatDateToUtcStartOfDayISO:",
      date,
    );
    return null;
  }
  // Format to YYYY-MM-DD to effectively strip time, then interpret as UTC, then toISOString.
  // This ensures that if local time was e.g. 2023-10-26 03:00:00 GMT+7,
  // it becomes 2023-10-26T00:00:00.000Z
  return dayjs.utc(d.format("DD/MM/YYYY")).toISOString();
};

export const convertCSharpDateFormatToDayjs = (format: string): string => {
  if (!format) return "DD/MM/YYYY";

  let dayjsFormat = format
    .replace(/yyyy/g, "YYYY")
    .replace(/dd/g, "DD")
    .replace(/d/g, "D");

  // Replace quoted literals 'text' with [text]
  // Regex to find '...' and replace with [...]
  dayjsFormat = dayjsFormat.replace(/'([^']+)'/g, "[$1]");

  return dayjsFormat;
};

export const parseDateValue = (
  dateStr: string | null | undefined,
): dayjs.Dayjs | null => {
  if (!dateStr) return null;
  let d = dayjs(dateStr);
  if (d.isValid()) return d;

  // Try legacy format
  d = dayjs(dateStr, "DD/MM/YYYY");
  if (d.isValid()) return d;

  // Try legacy format with time
  d = dayjs(dateStr, "HH:mm DD/MM/YYYY");
  if (d.isValid()) return d;

  return null;
};
