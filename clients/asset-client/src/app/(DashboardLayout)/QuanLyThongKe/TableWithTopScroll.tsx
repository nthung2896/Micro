"use client";

import React, { useEffect, useRef } from "react";
import "./TableWithTopScroll.css";

interface TableWithTopScrollProps {
  fixedLeftWidth: number;
  refreshDeps?: unknown[];
  children: React.ReactNode;
  className?: string;
}

export default function TableWithTopScroll({
  fixedLeftWidth,
  refreshDeps = [],
  children,
  className,
}: TableWithTopScrollProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const topScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const top = topScrollRef.current;
    if (!wrapper || !top) return;

    const getBody = () =>
      wrapper.querySelector(".ant-table-body") as HTMLElement | null;
    const inner = top.firstElementChild as HTMLElement;
    let syncing = false;

    const sync = (from: HTMLElement, to: HTMLElement) => {
      if (syncing) return;
      syncing = true;
      to.scrollLeft = from.scrollLeft;
      requestAnimationFrame(() => {
        syncing = false;
      });
    };

    const update = () => {
      const body = getBody();
      if (!body) return;
      inner.style.width = `${body.scrollWidth}px`;
      top.scrollLeft = body.scrollLeft;
    };

    const onTopScroll = () => {
      const body = getBody();
      if (body) sync(top, body);
    };

    const onBodyScroll = (event: Event) => {
      sync(event.target as HTMLElement, top);
    };

    top.addEventListener("scroll", onTopScroll);

    const observer = new ResizeObserver(update);
    let detachBody: (() => void) | undefined;

    const attachBody = () => {
      detachBody?.();
      const body = getBody();
      if (!body) return;

      body.addEventListener("scroll", onBodyScroll);
      observer.observe(body);
      update();
      detachBody = () => {
        body.removeEventListener("scroll", onBodyScroll);
        observer.unobserve(body);
      };
    };

    attachBody();
    const timer = window.setTimeout(attachBody, 0);

    return () => {
      window.clearTimeout(timer);
      top.removeEventListener("scroll", onTopScroll);
      detachBody?.();
      observer.disconnect();
    };
  }, refreshDeps);

  return (
    <div
      ref={wrapperRef}
      className={["thong-ke-table-top-scroll-wrapper", className].filter(Boolean).join(" ")}
      style={
        {
          ["--thong-ke-fixed-left-width" as string]: `${fixedLeftWidth}px`,
        } as React.CSSProperties
      }
    >
      <div ref={topScrollRef} className="thong-ke-table-top-scroll">
        <div className="thong-ke-table-top-scroll-inner" />
      </div>
      {children}
    </div>
  );
}
