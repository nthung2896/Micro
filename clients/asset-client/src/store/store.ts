import { configureStore } from "@reduxjs/toolkit";
import { combineReducers } from "redux";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

import authReducer from "./auth/AuthSlice";
import counterReducer from "./counter/counterSlice";
import CustomizerReducer from "./customizer/CustomizerSlice";
import generalReducer from "./general/GeneralSlice";
import menuReducer from "./menu/MenuSlice";
import searchParamsReducer from "./searchParams/searchParams";

const persistConfig = {
  key: "root",
  storage,
};

const customizerPersistConfig = {
  key: "customizer",
  storage,
  blacklist: ["isCollapse"], // Do not persist isCollapse, always use initialState
};

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    customizer: persistReducer<any>(customizerPersistConfig, CustomizerReducer),
    // auth: persistReducer<any>(persistConfig, authReducer),
    auth: authReducer,
    agencyCode: persistReducer<any>(persistConfig, searchParamsReducer),
    general: generalReducer,
    menu: menuReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false, immutableCheck: false }),
});

const rootReducer = combineReducers({
  counter: counterReducer,
  customizer: CustomizerReducer,
  auth: authReducer,
  general: generalReducer,
  menu: menuReducer,
  agencyCode: searchParamsReducer,
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppState = ReturnType<typeof rootReducer>;
