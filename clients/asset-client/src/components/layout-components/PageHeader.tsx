/** @jsxImportSource @emotion/react */
import AppBreadcrumb from "@/components/layout-components/AppBreadcrumb";
import { MEDIA_QUERIES } from "@/constants/ThemeConstant";
import { css } from "@emotion/react";
import React from "react";

interface PageHeaderProps {
  title?: string;
  display: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, display }) => {
  return display ? (
    <div
      css={css`
        align-items: center;
        margin-bottom: 1rem;
        @media ${MEDIA_QUERIES.LAPTOP} {
          display: flex;
        }
      `}
    >
      <h3 className="mb-0 mr-3 font-weight-semibold">
        {title ? title : "Trang chủ"}
      </h3>
      <AppBreadcrumb />
    </div>
  ) : null;
};

export default PageHeader;
