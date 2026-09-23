"use client";
import React from "react";
import BieuChamDiemComponent from "./BieuChamDiemComponent";

export default function BieuChamDiemPage(props: { params?: any; searchParams?: any }) {
  return <BieuChamDiemComponent {...props} />;
}
