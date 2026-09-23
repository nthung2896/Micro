"use client";

import React from "react";
import { Empty } from "antd";

interface Props {
  description: string;
}

const EmptyTabPanel: React.FC<Props> = ({ description }) => (
  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={description} />
);

export default EmptyTabPanel;
