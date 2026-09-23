import { EntityType } from "@/types/general";

export interface WeeklyConfigType extends EntityType {
  dayOfWeek: number;
  isWorking: boolean;
}

