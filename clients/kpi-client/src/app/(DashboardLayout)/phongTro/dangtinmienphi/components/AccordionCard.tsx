import React from "react";
import { DownOutlined, UpOutlined, RightOutlined } from "@ant-design/icons";
import { Button } from "antd";

interface AccordionCardProps {
  id: string;
  title: string;
  stepText: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  onNext?: () => void;
  nextLabel?: string;
  children: React.ReactNode;
}

export const AccordionCard: React.FC<AccordionCardProps> = ({
  id,
  title,
  stepText,
  icon,
  isOpen,
  onToggle,
  onNext,
  nextLabel = "Tiếp tục",
  children,
}) => {
  return (
    <div
      id={id}
      className={`bg-white rounded-xl shadow-sm border transition-all duration-200 overflow-hidden ${
        isOpen ? "border-blue-300 ring-1 ring-blue-100" : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* Header bar bấm để đóng/mở */}
      <div
        onClick={onToggle}
        className="px-6 py-4 flex items-center justify-between cursor-pointer select-none bg-white hover:bg-gray-50/80 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#0355a2] flex items-center justify-center text-lg shadow-xs">
            {icon}
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-800 m-0 flex items-center gap-2">
              {title}
            </h2>
            <span className="text-xs text-gray-400 font-medium">{stepText}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
            {isOpen ? "Thu gọn" : "Mở rộng"}
          </span>
          <div className="text-gray-400 text-sm">
            {isOpen ? <UpOutlined /> : <DownOutlined />}
          </div>
        </div>
      </div>

      {/* Body content */}
      {isOpen && (
        <div className="px-6 pb-6 pt-2 border-t border-gray-100">
          {children}

          {onNext && (
            <div className="mt-5 pt-3 border-t border-gray-100 flex justify-end">
              <Button
                type="dashed"
                size="middle"
                icon={<RightOutlined />}
                onClick={onNext}
                className="text-blue-600 border-blue-300 hover:text-blue-700 hover:border-blue-500 font-medium"
              >
                {nextLabel}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
