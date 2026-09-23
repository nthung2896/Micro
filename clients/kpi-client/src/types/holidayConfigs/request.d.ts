
import { SearchBase } from "@/types/general";
export interface HolidayConfigsRequestType  {
  id?: string;
  day: number;
  month: number;
  year?: number;
  isAnnualYear: boolean;
  type: string;
  description: string;
}

export interface HolidayConfigsSearchType extends SearchBase {
  day?: number;
  month?: number;
  year?: number;
  isAnnualYear?: boolean;
  type?: string;
  description?: string;
}

