import React, { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Paper,
  ThemeProvider,
  createTheme,
  type SxProps,
  type Theme,
  Grid,
  Stack,
} from "@mui/material";
import { Form, Formik } from "formik";
import SelectFieldBlock from "../../../components/molecules/form-fields/SelectFieldBlock";
import ButtonBlock from "../../../components/atoms/ButtonBlock";
import ToothIcon from "./ui/ToothIcon";

// 2. Define an interface for the dental option data structure.
interface DentalOption {
  id: string;
  category: string;
  label: string;
  color: string;
}

// 3. Apply the interface to the data array for type safety.
const dentalOptionsData: DentalOption[] = [
  {
    id: "anat-krone",
    category: "Prep Art",
    label: "B.O.P.T. Vertikale Präparation",
    color: "#9c27b0",
  },
  {
    id: "anat-kappchen",
    category: "Prep Art",
    label: "Mit Mrep gränze",
    color: "#00695c",
  },
  {
    id: "anatomischer-pontic",
    category: "Implantatgetragen",
    label: "Okklusal Verschraubt",
    color: "#b71c1c",
  },
  {
    id: "reduzierter-pontic",
    category: "Implantatgetragen",
    label: "Zementiert",
    color: "#b71c1c",
  },
];

const dentalOptionsData2: DentalOption[] = [
  {
    id: "hollywood-natural",
    category: "Zahn Form",
    label: "Hollywood Natural",
    color: "#9c27b0",
  },
  {
    id: "oval",
    category: "Zahn Form",
    label: "Oval",
    color: "#00695c",
  },
  {
    id: "schmelz-dentinfarben",
    category: "Transluzenz Art",
    label: "Schmelz/Dentinfarben",
    color: "#b71c1c",
  },
  {
    id: "leicht",
    category: "Transluzenz Art",
    label: "Leicht",
    color: "#b71c1c",
  },
  {
    id: "prominente-mammelonen",
    category: "Transluzenz Art",
    label: "Prominente Mammelonen",
    color: "#b71c1c",
  },
];

// 4. Define a type for the grouped options object.
type GroupedOptions = {
  [category: string]: DentalOption[];
};

// 5. Explicitly type the accumulator in the reduce function.
const groupedOptions = dentalOptionsData.reduce<GroupedOptions>(
  (acc, option) => {
    const { category } = option;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(option);
    return acc;
  },
  {}
);

const groupedOptions2 = dentalOptionsData2.reduce<GroupedOptions>(
  (acc, option) => {
    const { category } = option;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(option);
    return acc;
  },
  {}
);

// Create a theme for custom styling
const theme = createTheme({
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
  },
  components: {
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          padding: "16px 8px",
          fontSize: "1rem",
          fontWeight: "500",
          backgroundColor: "#f0f0f0",
          cursor: "pointer",
        },
        label: {
          paddingLeft: "8px",
        },
      },
    },
  },
});

interface OptionenUndParameterProps {
  onSelect: (options: Record<string, string>) => void;
}

const OptionenUndParameter: React.FC<OptionenUndParameterProps> = ({
  onSelect,
}) => {
  // State to track selected options by category
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const initialValues = {
    implantatSystem: "",
    scanBodyName: "",
    tiBaseZFHoehe: "",
  };

  const handleSelectOption = (optionId: string, category: string): void => {
    const option = [...dentalOptionsData, ...dentalOptionsData2].find(opt => opt.id === optionId);
    if (option) {
      setSelectedOptions(prev => ({
        ...prev,
        [category]: option.label,
      }));
    }
  };

  const handleFormSubmit = (values: typeof initialValues) => {
    // Combine chip selections with form values
    const allOptions = {
      ...selectedOptions,
      implantatSystem: values.implantatSystem,
      scanBodyName: values.scanBodyName,
      tiBaseZFHoehe: values.tiBaseZFHoehe,
    };

    console.log("Selected options:", allOptions);
    onSelect(allOptions);
  };

  const handleReset = () => {
    setSelectedOptions({});
  };

  const isOptionSelected = (optionId: string, category: string) => {
    const option = [...dentalOptionsData, ...dentalOptionsData2].find(opt => opt.id === optionId);
    return option && selectedOptions[category] === option.label;
  };

  return (
    <ThemeProvider theme={theme}>
      <Stack flex="1" gap="20px">
        <Typography
          variant="h2"
          sx={{
            fontWeight: "600",
            fontSize: "24px",
            color: "rgba(146, 146, 146, 1)",
          }}
        >
          Zahn 16{" "}
          <Typography variant="h6" component="span" color="text.secondary">
            Optionen und Parameter
          </Typography>
        </Typography>

        <Formik
          initialValues={initialValues}
          onSubmit={() => {}} // Empty submit handler since we handle it manually
        >
          {({ values }) => (
            <Form>
              <Paper
                sx={{
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 1)",
                  padding: "26px 40px",
                  height: "100%",
                }}
              >
                {Object.entries(groupedOptions).map(([category, options]) => (
                  <Box key={category} sx={{ mb: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: "10px",
                        fontWeight: "600",
                        fontSize: "16px",
                        color: "rgba(97, 97, 97, 1)",
                      }}
                    >
                      {category}
                    </Typography>
                    <Grid container spacing={2}>
                      {options.map((option) => {
                        const isSelected = isOptionSelected(option.id, category);
                        const chipStyles: SxProps<Theme> = {
                          borderColor: option.color,
                          backgroundColor: isSelected
                            ? option.color
                            : "rgba(235, 235, 235, 1)",
                          color: isSelected ? "white" : "black",
                          width: "100%",
                          fontSize: "14px",
                          fontWeight: "500",
                          borderRadius: "8px",
                          justifyContent: "flex-start",
                          cursor: "pointer",
                          "& .MuiChip-label": {
                            flex: 1,
                          },
                          "&:hover": {
                            backgroundColor: isSelected ? option.color : "#e0e0e0",
                          },
                        };

                        return (
                          <Grid key={option.id} size={4}>
                            <Chip
                              icon={<ToothIcon />}
                              label={option.label}
                              onClick={() => handleSelectOption(option.id, category)}
                              variant="outlined"
                              sx={chipStyles}
                            />
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                ))}

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid size={6}>
                    <SelectFieldBlock
                      name="implantatSystem"
                      label="Implantat System"
                      placeholder="Wählen Sie ein System"
                      options={[
                        { label: "Straumann", value: "Straumann" },
                        { label: "Nobel Biocare", value: "Nobel Biocare" },
                        { label: "Astra Tech", value: "Astra Tech" },
                        { label: "Zimmer Biomet", value: "Zimmer Biomet" },
                      ]}
                    />
                  </Grid>
                  <Grid size={6}>
                    <SelectFieldBlock
                      name="scanBodyName"
                      label="Scan body name"
                      placeholder="Wählen Sie einen Scan Body"
                      options={[
                        { label: "ScanBody Standard", value: "ScanBody Standard" },
                        { label: "ScanBody Premium", value: "ScanBody Premium" },
                        { label: "ScanBody Custom", value: "ScanBody Custom" },
                      ]}
                    />
                  </Grid>

                  <Grid size={6}>
                    <SelectFieldBlock
                      name="tiBaseZFHoehe"
                      label="TiBase ZF Höhe"
                      placeholder="Wählen Sie eine Höhe"
                      options={[
                        { label: "2mm", value: "2mm" },
                        { label: "4mm", value: "4mm" },
                        { label: "6mm", value: "6mm" },
                        { label: "8mm", value: "8mm" },
                      ]}
                    />
                  </Grid>
                </Grid>

                {Object.entries(groupedOptions2).map(([category, options]) => (
                  <Box key={category} sx={{ mb: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: "10px",
                        fontWeight: "600",
                        fontSize: "16px",
                        color: "rgba(97, 97, 97, 1)",
                      }}
                    >
                      {category}
                    </Typography>
                    <Grid container spacing={2}>
                      {options.map((option) => {
                        const isSelected = isOptionSelected(option.id, category);
                        const chipStyles: SxProps<Theme> = {
                          borderColor: option.color,
                          backgroundColor: isSelected
                            ? option.color
                            : "rgba(235, 235, 235, 1)",
                          color: isSelected ? "white" : "black",
                          width: "100%",
                          fontSize: "14px",
                          fontWeight: "500",
                          borderRadius: "8px",
                          justifyContent: "flex-start",
                          cursor: "pointer",
                          "& .MuiChip-label": {
                            flex: 1,
                          },
                          "&:hover": {
                            backgroundColor: isSelected ? option.color : "#e0e0e0",
                          },
                        };

                        return (
                          <Grid key={option.id} size={4}>
                            <Chip
                              icon={<ToothIcon />}
                              label={option.label}
                              onClick={() => handleSelectOption(option.id, category)}
                              variant="outlined"
                              sx={chipStyles}
                            />
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                ))}

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: "20px",
                  }}
                  gap="10px"
                >
                  <ButtonBlock
                    type="button"
                    onClick={handleReset}
                    style={{
                      borderRadius: "40px",
                      height: "40px",
                      color: "rgba(107, 107, 107, 1)",
                      width: "143px",
                      fontSize: "16px",
                      fontWeight: "500",
                      boxShadow: "1px 2px 1px 0px rgba(0, 0, 0, 0.25)",
                    }}
                  >
                    Zurücksetzen
                  </ButtonBlock>

                  <ButtonBlock
                    type="button"
                    onClick={() => handleFormSubmit(values)}
                    style={{
                      background: "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
                      borderRadius: "40px",
                      height: "40px",
                      color: "white",
                      width: "143px",
                      fontSize: "16px",
                      fontWeight: "500",
                    }}
                  >
                    OK
                  </ButtonBlock>
                </Box>
              </Paper>
            </Form>
          )}
        </Formik>
      </Stack>
    </ThemeProvider>
  );
};

export default OptionenUndParameter;
