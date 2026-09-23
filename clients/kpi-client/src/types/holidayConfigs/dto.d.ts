import { EntityType } from "@/types/general";

export interface HolidayConfigsType extends EntityType {
  day: number;
  month: number;
  year?: number;
  isAnnualYear: boolean;
  type: string;
  description: string;
}

