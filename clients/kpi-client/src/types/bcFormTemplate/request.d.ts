import { SearchBase } from "@/types/general";
import { BCInputConfigType } from "./dto";

export interface BCFormTemplateRequest {
    id?: string | null;
    idBaoCao: string; // Guid trong C# map sang string
    name: string;
    doiTuongTypes: string[];
    templateFilePath: string;
    huongTrang?: string | null;
    itemId: string;
}

export interface BCFormTemplateSearchType extends SearchBase {
    idBaoCao?: string | undefined; // Guid trong C# map sang string
    name?: string | undefined;
}

export interface UpdateFormInputsRequest {
    id?: string | null;
    idBaoCao: string;
    idThanhPhan: number;
    inputs: BCInputConfigType[];
}

export interface UpdateInputDropdownRequest {
    id: string; 
    idThanhPhan: number;
    inputKey: string;
    displayName: string;
    dataType: string;
    required: boolean;
    placeHolder: string;
    isCombobox: boolean;
    localOptions: import("./dto").BCCategoryItemType[];
    globalCategoryCode?: string | null;
}