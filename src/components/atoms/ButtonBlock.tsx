import React from "react";
import {
  Button,
  useTheme,
  useMediaQuery,
  type ButtonProps,
} from "@mui/material";

interface IButtonBlockProps extends ButtonProps {
  children?: React.ReactNode;
  className?: string;
  bgcolor?: string | undefined;
  mobileFullWidth?: boolean;
}

const ButtonBlock: React.FC<IButtonBlockProps> = ({
  children,
  className = "",
  sx = {},
  mobileFullWidth = false,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const variants = {
    outlined: {
      style: {},
    },
    contained: {
      style: {},
    },
    text: {
      style: {
        color: "#4F4F4F",
      },
    },
  };

  return (
    <Button
      disableElevation
      className={`${className}`}
      sx={{
        "& > .MuiButton-icon": {
          marginRight: "8px",
        },
        textTransform: "none",
        height: "40px",
        // Mobile: ensure minimum 44px height for touch targets
        minHeight: { xs: "44px", sm: "40px" },
        padding: "8px auto",
        borderRadius: "8px",
        // Mobile: full width option
        ...(isMobile && mobileFullWidth && { width: "100%" }),
        ...variants[props.variant || "outlined"].style,
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default ButtonBlock;
