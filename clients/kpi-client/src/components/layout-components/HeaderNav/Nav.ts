import styled from "@emotion/styled";

interface NavProps {
  navWidth: string;
}

const Nav = styled.div<NavProps>(({ navWidth }) => ({
  display: "flex",
  justifyContent: "space-between",
  position: "relative",
  transition: "all .2s ease",
  width: `calc(100% - ${navWidth})`,
}));

export default Nav;
