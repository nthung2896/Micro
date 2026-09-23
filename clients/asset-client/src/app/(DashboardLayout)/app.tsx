"use client";
import { baseTheme } from "@/constants/ThemeConstant";
import React from "react";
import "./assets/css/font.css";

const MyApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <div style={{ fontFamily: baseTheme.fontFamily }}>
      <h1>layout chung</h1>
      {children}
    </div>
  );
};

export default MyApp;
