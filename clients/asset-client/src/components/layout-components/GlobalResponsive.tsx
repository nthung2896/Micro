"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setIsMobile } from "@/store/customizer/CustomizerSlice";

export function GlobalResponsive() {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleResize = () => {
      dispatch(setIsMobile(window.innerWidth < 1200));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

  return null;
}
