import { EntityType } from "@/types/general";

export interface BCFormTemplateType extends EntityType {
    idBaoCao: string;
    name: string;
    doiTuongTypes: string[]; // ["DOANH_NGHIEP", "HTX"]
    templateFilePath: string;
    huongTrang?: string | null; 
    itemId?: string;
    thanhPhanForms: BCThanhPhanFormType[];
}

export interface BCThanhPhanFormType {
    idThanhPhan: number;
    name: string;
    htmlContent: string;
    orderNumber: number;
    inputs: BCInputConfigType[];
}

export interface BCInputConfigType {
    inputKey: string;
    displayName: string;
    dataType: string;
    required: boolean;
    placeHolder?: string;
    isCombobox: boolean;
    localOptions?: BCCategoryItemType[];
    globalCategoryCode?: string;
}

export interface BCCategoryItemType {
    value: string;
    label: string;
}