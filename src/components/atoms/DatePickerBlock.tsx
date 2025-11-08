import React from "react";
import {
  TextField,
  type TextFieldProps,
  InputAdornment,
  styled,
  InputLabel,
  FormControl,
} from "@mui/material";

const StyledTextField = styled(TextField)({
  "label + &": {
    marginTop: "20px",
  },
  "& label.Mui-focused": {
    color: "#A0AAB4",
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "#B2BAC2",
  },
  "& .MuiOutlinedInput-root": {
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
    backgroundColor: "transparent", // Set the background color to transparent
  },
  "&.MuiTextField-root": {
    backgroundColor: "transparent",
    border: "none",
  },

  "& .MuiOutlinedInput-notchedOutline": {
    borderRadius: "8px",
  },
  "& .MuiInputBase-input": {
    padding: "8px 16px",
  },
});

export interface DatePickerBlockProps extends Omit<TextFieldProps, "variant"> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  variant?: "outlined" | "filled" | "standard";
}

const DatePickerBlock: React.FC<DatePickerBlockProps> = ({
  startIcon,
  endIcon,
  label,
  variant = "outlined",
  ...props
}) => {
  return (
    <FormControl variant="standard">
      {label && (
        <InputLabel
          shrink
          htmlFor="bootstrap-input"
          sx={{
            fontSize: "14px",
            fontWeight: "500",
            lineHeight: "20px",
            color: "rgba(52, 64, 84, 1)",
          }}
        >
          {label}
        </InputLabel>
      )}
      <StyledTextField
        type="date"
        id="bootstrap-input"
        size="medium"
        InputProps={{
          startAdornment: startIcon && (
            <InputAdornment position="start">{startIcon}</InputAdornment>
          ),
          endAdornment: endIcon && (
            <InputAdornment position="end">{endIcon}</InputAdornment>
          ),
        }}
        variant={variant}
        {...props}
      />
    </FormControl>
  );
};

export default DatePickerBlock;
