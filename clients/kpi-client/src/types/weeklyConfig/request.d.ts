
import { SearchBase } from "@/types/general";
export interface WeeklyConfigRequestType  {
  id?: string;
  dayOfWeek: number;
  isWorking: boolean;
}

export interface WeeklyConfigSearchType extends SearchBase {
  dayOfWeek?: number;
  isWorking?: boolean;
}

