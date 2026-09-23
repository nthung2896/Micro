import { EntityType, SearchBase } from "@/types/general";

export interface ProcessingDeadlineConfigDto extends EntityType {
  name: string;
  code: string;
  type?: string | null;
  statusBefore?: number | null;
  statusAfter?: number | null;
  limitDays: number;
  isCheckHoliday: boolean;
  stt?: number | null;
  isNenTang: boolean;
}

export interface ProcessingDeadlineConfigSearch extends SearchBase {
  keyword?: string;
  code?: string;
  type?: string;
  statusBefore?: number;
  statusAfter?: number;
  isCheckHoliday?: boolean;
  isNenTang?: boolean;
}

export interface ProcessingDeadlineConfigCreateRequest {
  id?: string;
  name: string;
  code: string;
  type?: string | null;
  statusBefore?: number | null;
  statusAfter?: number | null;
  limitDays: number;
  isCheckHoliday: boolean;
  stt?: number | null;
  isNenTang: boolean;
}
