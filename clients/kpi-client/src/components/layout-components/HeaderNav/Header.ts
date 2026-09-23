import styled from "@emotion/styled";
import { TEMPLATE } from "@/constants/ThemeConstant";

// Định nghĩa các kiểu cho các props
interface HeaderProps {
  headerNavColor: string;
}

const Header = styled.div<HeaderProps>(({ headerNavColor }) => ({
  position: "fixed",
  width: "100%",
  left: 0,
  zIndex: 1000,
  display: "flex",
  flex: "0 0 auto",
  height: TEMPLATE.HEADER_HEIGHT,
  lineHeight: `${TEMPLATE.HEADER_HEIGHT}px`,
  backgroundColor: headerNavColor,
  boxShadow: "0 1px 4px -1px rgb(0 0 0 / 15%)",
  borderBottom: "1px solid #0355a2",
  overflow: "hidden",
  boxSizing: "border-box",
}));

export default Header;
