import React, { forwardRef } from "react";
import Icon from "@ant-design/icons";
import { SVGProps } from "react";

interface CustomIconProps {
  svg: React.ComponentType<SVGProps<SVGSVGElement>>;
  className?: string;
}

const CustomIcon = forwardRef<HTMLSpanElement, CustomIconProps>(
  (props, ref) => {
    return <Icon component={props.svg} className={props.className} ref={ref} />;
  },
);

CustomIcon.displayName = "CustomIcon";

export default CustomIcon;
