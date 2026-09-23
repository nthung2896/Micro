
import React, { ReactNode } from 'react';
import Loading from '../effect-components/Loading';

interface CustomCardProps {
  title?: React.ReactNode | null;
  children?: React.ReactNode | null;
  className?: string | null;
  classTitle?: string | null;
  icon?: ReactNode | null;
  menuBar?: React.ReactNode | null;
  loading?: boolean;
  extra?: React.ReactNode | null;
}

const CustomCard: React.FC<CustomCardProps> = ({
  title,
  children,
  className = '',
  classTitle = '',
  icon,
  menuBar,
  loading = false,
  extra,
}) => {
  return (
    <>
      <div
        className={`rounded-none w-full border border-x-slate-200 mb-2 bg-white ${className}`}
      >
        {title && (
          <div
            className={`border-b border-slate-200 p-2 text-md flex items-center bg-[#f0f0f0] ${classTitle}`}
          >
            <span className="uppercase font-weight-bold">
              {icon} {loading ? 'Đang tải dữ liệu' : title}
            </span>
            <div className="ml-auto">{menuBar ?? extra}</div>
          </div>
        )}
        {loading ? (
          <Loading className="h-56"></Loading>
        ) : (
          <div className="p-2 relative">{children}</div>
        )}
      </div>
    </>
  );
};

export default CustomCard;
