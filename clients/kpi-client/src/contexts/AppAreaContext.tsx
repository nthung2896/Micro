import { createContext, useContext } from "react";

export const AppAreaContext = createContext<"dashboard" | "portal">(
  "dashboard",
);

export const useAppArea = () => useContext(AppAreaContext);
