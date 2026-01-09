import { styled } from "@mui/material";
import { Link } from "react-router-dom";

const StyledLink = ({
  to,
  children,
}: {
  to: string;
  children: React.ReactElement | Array<React.ReactElement>;
}) => {
  const StyledLink = styled(Link)(({ theme }) => ({
    textDecoration: "none",
    color: theme.palette.secondary.main,
    "&:visited": theme.palette.secondary.main,
    fontWeight: "600",
  }));

  return <StyledLink to={to}>{children}</StyledLink>;
};

export default StyledLink;
