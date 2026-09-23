"use client";
import { message } from "antd";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./store";

// Global config cho antd message toast.
message.config({
  top: 80,
  duration: 3,
  maxCount: 3,
});

export function Providers({ children }: { children: any }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
