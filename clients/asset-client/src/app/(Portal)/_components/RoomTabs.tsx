"use client";
import React from "react";
import { SortTabType } from "./types";

interface RoomTabsProps {
  activeTab: SortTabType;
  onTabChange: (tab: SortTabType) => void;
}

export default function RoomTabs({ activeTab, onTabChange }: RoomTabsProps) {
  const tabs: { key: SortTabType; label: string }[] = [
    { key: "dexuat", label: "Đề xuất" },
    { key: "moidang", label: "Mới đăng" },
    { key: "giare", label: "Giá rẻ nhất" },
    { key: "video", label: "Có video / Nhiều ảnh" },
  ];

  return (
    <div className="flex items-center gap-6 border-b border-gray-200 mb-5 text-sm bg-white px-4 pt-3 rounded-t-xl overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`pb-3 font-bold transition-all relative cursor-pointer shrink-0 ${
              isActive
                ? "text-gray-900 border-b-2 border-black"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
