import React from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import styled from "@emotion/styled";

const Icon = <LoadingOutlined style={{ fontSize: 35 }} spin />;

interface LoadingProps {
  content: string | "";
}

const Loading = (loading: LoadingProps) => {
  const LoadingWrapper = styled("div")`
    ${loading.content === "content"
      ? `
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
        `
      : ""}

    ${loading.content === "page"
      ? `
            position: fixed;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        `
      : ""}
  `;
  return (
    <LoadingWrapper className="text-center">
      <Spin indicator={Icon} />
    </LoadingWrapper>
  );
};
export default Loading;
