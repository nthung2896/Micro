import React from 'react';
import styled from "@emotion/styled";

interface FlexProps {
  justifyContent?: string;
  alignItems?: string;
  flexDirection?: "row" | "column" | "row-reverse" | "column-reverse";
  gap?: number | string;
  padding?: string;
  margin?: string;
}

const Flex = styled.div<FlexProps>(
  ({ justifyContent, alignItems, flexDirection, gap, padding, margin }) => {
    const baseStyle: React.CSSProperties = {
      display: "flex",
      justifyContent: justifyContent,
      alignItems: alignItems,
      gap: typeof gap === "number" ? `${gap}px` : gap,
    };

    if (flexDirection) {
      baseStyle.flexDirection = flexDirection;
    }

    if (padding) {
      baseStyle.padding = padding;
    }

    if (margin) {
      baseStyle.margin = margin;
    }

    return { ...baseStyle };
  },
);

export default Flex;
