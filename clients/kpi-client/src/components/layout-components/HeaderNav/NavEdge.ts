import styled from "@emotion/styled";

interface NavEdgeProps {
  left?: boolean;
  right?: boolean;
}

const NavEdge = styled.div<NavEdgeProps>(({ left, right }) => {
  if (left) {
    return {
      display: "flex",
      marginRight: "auto",
    };
  }

  if (right) {
    return {
      marginLeft: "auto",
      padding: "0 1rem",
      display: "flex",
    };
  }

  return {};
});

export default NavEdge;
