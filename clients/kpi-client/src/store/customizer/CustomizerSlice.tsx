import { createSlice } from "@reduxjs/toolkit";
import { NAV_TYPE_SIDE } from "@/constants/ThemeConstant";
interface StateType {
  isCollapse?: boolean;
  SidebarWidth?: number;
  MiniSidebarWidth?: number;
  TopbarHeight?: number;
  isSidebarHover?: boolean;
  isMobileSidebar?: boolean;
  isHorizontal?: boolean;
  isMobile?: boolean;
  borderRadius?: number;
  navType?: string;
  topNavColor?: string;
}

const initialState: StateType = {
  isCollapse: true,
  SidebarWidth: 270,
  MiniSidebarWidth: 87,
  TopbarHeight: 70,
  isSidebarHover: false,
  isMobileSidebar: false, //mobileNav
  isHorizontal: false,
  borderRadius: 7,
  isMobile: false,
  navType: NAV_TYPE_SIDE,
  topNavColor: "#3e82f7",
};

export const CustomizerSlice = createSlice({
  name: "customizer",
  initialState,
  reducers: {
    toggleSidebar: (state: StateType) => {
      state.isCollapse = !state.isCollapse;
    },
    hoverSidebar: (state: StateType, action) => {
      state.isSidebarHover = action.payload;
    },
    toggleMobileSidebar: (state: StateType) => {
      state.isMobileSidebar = !state.isMobileSidebar;
    },
    setIsMobileSidebar: (state: StateType, action) => {
      state.isMobileSidebar = action.payload;
    },
    toggleHorizontal: (state: StateType, action) => {
      state.isHorizontal = action.payload;
    },
    setBorderRadius: (state: StateType, action) => {
      state.borderRadius = action.payload;
    },
    setIsMobile: (state: StateType, action) => {
      state.isMobile = action.payload;
    },
    setCollapse: (state: StateType, action) => {
      state.isCollapse = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  hoverSidebar,
  toggleMobileSidebar,
  setIsMobileSidebar,
  setBorderRadius,
  toggleHorizontal,
  setIsMobile,
  setCollapse,
} = CustomizerSlice.actions;

export default CustomizerSlice.reducer;
