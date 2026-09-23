import { Spin } from 'antd';
import { title } from 'process';
import React from 'react';

type LoadingProps = {
  className?: string;
  title?: string;
  style?: React.CSSProperties;
};

const Loading = ({ className = '', title, style }: LoadingProps) => {
  return (
    <div
      className={`w-full flex flex-col justify-center items-center ${className}`}
      style={style}
    >
      <Spin size="default"></Spin>
      <div className="mt-2">{title ? title : 'Đang tải dữ liệu...'}</div>
    </div>
  );
};

export default Loading;
