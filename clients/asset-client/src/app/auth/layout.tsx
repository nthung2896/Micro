"use client";
import React from "react";
import styled from "@emotion/styled";
import "../(DashboardLayout)/layout.css";
import "@/app/assets/css/global.css";

const AuthContainer = styled.div(() => ({
  height: "100vh",
}));

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthContainer>{children}</AuthContainer>;
}
