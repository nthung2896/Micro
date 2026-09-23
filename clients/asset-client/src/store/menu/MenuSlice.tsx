import { AppUserType } from "@/types/appUser/dto";
import { ApiResponse } from "@/types/general";
import { MenuDataType } from "@/types/operation/dto";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
interface StateType {
  menuData: MenuDataType[] | null;
}

const initialState: StateType = {
  menuData: null,
};

export const MenuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    setMenuData: (
      state: StateType,
      action: PayloadAction<ApiResponse<AppUserType>>,
    ) => {
      const userMenuData = action.payload.data?.menuData || [];
      state.menuData = userMenuData;
    },
    resetMenuData: (state: StateType) => {
      state.menuData = null;
    },
  },
});

export const { setMenuData, resetMenuData } = MenuSlice.actions;

export default MenuSlice.reducer;
