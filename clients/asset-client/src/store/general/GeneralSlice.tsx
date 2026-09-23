import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppConfigurationType } from "@/types/appConfiguration/appConfiguration";

interface StateType {
  isLoading?: boolean;
  showMessage?: boolean;
  appConfig?: AppConfigurationType | null;
}

const initialState: StateType = {
  isLoading: false,
  showMessage: false,
  appConfig: null,
};

export const GeneralSlice = createSlice({
  name: "general",
  initialState,
  reducers: {
    setIsLoading: (state: StateType, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setShowMessage: (state: StateType, action: PayloadAction<boolean>) => {
      state.showMessage = action.payload;
    },
    setAppConfig: (state: StateType, action: PayloadAction<AppConfigurationType | null>) => {
      state.appConfig = action.payload;
      if (typeof window !== "undefined") {
        try {
          if (action.payload) {
            localStorage.setItem("APP_CONFIG_CACHE", JSON.stringify(action.payload));
          } else {
            localStorage.removeItem("APP_CONFIG_CACHE");
          }
        } catch (e) {
          console.error("Error saving appConfig to localStorage", e);
        }
      }
    },
  },
});

export const { setIsLoading, setShowMessage, setAppConfig } = GeneralSlice.actions;

export default GeneralSlice.reducer;
