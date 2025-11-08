import React from "react";
import {
  TextField,
  InputAdornment,
  styled,
  type TextFieldProps,
} from "@mui/material";

const StyledTextField = styled(TextField)({
  // "label + &": {
  //   marginTop: "20px",
  // },
  "& label.Mui-focused": {
    color: "#A0AAB4",
  },
  "& .MuiInput-underline:after": {
    borderBottomColor: "#B2BAC2",
  },
  "& .MuiOutlinedInput-root": {
    // padding: '0px',
    padding: "8px 16px",
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
    // padding: "8px 16px",
    padding: 0,
  },
});

export interface InputBlockNoFormProps extends Omit<TextFieldProps, "variant"> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  variant?: "outlined" | "filled" | "standard";
  onChange?: any;
}

const InputBlockNoForm: React.FC<InputBlockNoFormProps> = ({
  startIcon,
  endIcon,
  variant = "outlined",
  onChange,
  ...props
}) => {
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
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  );
};

export default InputBlockNoForm;
