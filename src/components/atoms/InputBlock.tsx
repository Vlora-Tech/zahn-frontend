import React from "react";
import {
  TextField,
  InputAdornment,
  styled,
  useTheme,
  useMediaQuery,
  type TextFieldProps,
} from "@mui/material";

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& label.Mui-focused": {
    color: "#A0AAB4",
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "#B2BAC2",
  },
  "& .MuiOutlinedInput-root": {
    padding: "8px 16px",
    // Mobile: ensure minimum 44px height for touch targets
    [theme.breakpoints.down("sm")]: {
      minHeight: "44px",
    },
    "& fieldset": {
      borderColor: "#E0E3E7",
    },
    "&:hover fieldset": {
      borderColor: "#B2BAC2",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#6F7E8C",
    },
  },

  "& .MuiFilledInput-root": {
    "&:before": {
      borderBottom: "none",
    },
    "&:after": {
      borderBottom: "none",
    },
    "&:hover:not(.Mui-disabled):before": {
      borderBottom: "none",
    },
  },
  ".MuiTextField-root": {
    backgroundColor: "transparent",
  },
  "& .MuiFormHelperText-root": {
    backgroundColor: "transparent",
  },
  "&.MuiTextField-root": {
    backgroundColor: "transparent",
    border: "none",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderRadius: "8px",
  },
  "& .MuiInputBase-input": {
    padding: 0,
    // Mobile: ensure adequate font size to prevent zoom on iOS
    [theme.breakpoints.down("sm")]: {
      fontSize: "16px",
    },
  },
}));

export interface InputBlockProps extends Omit<TextFieldProps, "variant"> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  variant?: "outlined" | "filled" | "standard";
  mobileFullWidth?: boolean;
}

const InputBlock: React.FC<InputBlockProps> = ({
  startIcon,
  endIcon,
  variant = "outlined",
  mobileFullWidth = true,
  sx,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <StyledTextField
      id="bootstrap-input"
      size="medium"
      slotProps={{
        input: {
          startAdornment: startIcon && (
            <InputAdornment position="start">{startIcon}</InputAdornment>
          ),
          endAdornment: endIcon && (
            <InputAdornment position="end">{endIcon}</InputAdornment>
          ),
        },
      }}
      variant={variant}
      sx={{
        // Mobile: full width by default
        ...(isMobile && mobileFullWidth && { width: "100%" }),
        ...sx,
      }}
      {...props}
    />
  );
};

export default InputBlock;
