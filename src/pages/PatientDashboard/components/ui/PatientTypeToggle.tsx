import React, { Dispatch } from "react";
import {
  Box,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  FormLabel,
  FormHelperText,
  type SxProps,
  type Theme,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { useField } from "formik";

// Define the props for the component, making 'name' required.
interface PatientTypeToggleProps {
  name: string;
  label?: string;
  disabled?: boolean;
  setInsurace?: Dispatch<string>;
  selectedInsurance?: string;
}

// Define the possible patient types for strict type safety.
type PatientType = "private" | "gkv";

/**
 * A styled, type-safe toggle switch component integrated with Formik.
 * It functions as a custom field within a Formik form.
 */
const PatientTypeToggle: React.FC<PatientTypeToggleProps> = ({
  name,
  label,
  disabled,
  setInsurace,
  selectedInsurance,
}) => {
  // useField hook connects the component to Formik's state.
  // 'field' contains { name, value, onChange, onBlur }.
  // 'meta' contains { touched, error }.
  // 'helpers' contains { setValue, setTouched }.
  const [field, meta, helpers] = useField(name);
  const value = field?.value ?? selectedInsurance;
  const { setValue } = helpers;

  console.log(field , "vvvvvvvvvvvvvvvvvvvvvv")

  // Handler now calls Formik's setValue to update the form state.
  const handlePatientTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newPatientType: PatientType | null // MUI sends null if a button is deselected
  ): void => {
    // We ensure a value is always selected.
    if (newPatientType !== null) {
      setValue(newPatientType);

      setInsurace?.(newPatientType);
    }
  };

  // Define common styles for the toggle buttons using MUI's SxProps type.
  const toggleButtonStyle: SxProps<Theme> = {
    flex: 1, // Make buttons share space equally
    border: "none",
    textTransform: "none",
    px: { xs: 2, sm: 4 },
    py: 1,
    fontWeight: "bold",
    fontSize: { xs: "1rem", sm: "1.1rem" },
    color: "grey.700",
    backgroundColor: "grey.200",
    // Styles for the selected button
    "&.Mui-selected": {
      color: "white",
      backgroundColor: "primary.main",
      "&:hover": {
        backgroundColor: "primary.dark",
      },
    },
    // Hover effect for unselected buttons
    "&:not(.Mui-selected):hover": {
      backgroundColor: "#e0e0e0",
    },
  };

  return (
    <FormControl
      fullWidth
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
      error={meta.touched && Boolean(meta.error)}
    >
      {/* Render the label if it's provided */}
      {label && (
        <FormLabel
          sx={{
            fontWeight: "400",
            fontSize: "14px",
            color: "rgba(10, 77, 130, 1)",
          }}
        >
          {label}
        </FormLabel>
      )}

      <ToggleButtonGroup
        value={value} // The value is now controlled by Formik
        exclusive
        onChange={handlePatientTypeChange}
        aria-label={label || "Patiententyp"}
        sx={{
          display: "flex",
          borderRadius: "8px",
          border: `1px solid #e0e0e0`,
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          overflow: "hidden",
          width: "100%",
          height: "39px",
        }}
        disabled={disabled}
      >
        <ToggleButton
          value="private"
          aria-label="Privatpatient"
          disableRipple
          sx={toggleButtonStyle}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {value === "private" && <CheckIcon />}
            Private
          </Box>
        </ToggleButton>

        <ToggleButton
          value="gkv"
          aria-label="GKV-Patient"
          disableRipple
          sx={toggleButtonStyle}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {value === "gkv" && <CheckIcon />}
            GKV
          </Box>
        </ToggleButton>
      </ToggleButtonGroup>

      {/* Display validation error message if the field is touched and has an error */}
      {meta.touched && meta.error && (
        <FormHelperText>{meta.error}</FormHelperText>
      )}
    </FormControl>
  );
};

export default PatientTypeToggle;
