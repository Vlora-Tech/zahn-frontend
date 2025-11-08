import React, { useState } from "react";
import {
  Typography,
  Box,
  Grid,
  Paper,
  ThemeProvider,
  createTheme,
  Card,
  CardActionArea,
  Stack,
} from "@mui/material";

interface MaterialProps {
  onSelect?: (materialId: string) => void;
  selectedMaterial?: string;
}

// Data for the material options
const materialData = [
  { id: "zirkon", label: "CADstar Zirkon", type: "circle", color: "#e8f5e9" },
  { id: "pmma", label: "CADstar PMMA clear", type: "circle", color: "#e0e0e0" },
  {
    id: "ips-emax",
    label: "CADstar IPS e.max",
    type: "image",
    src: "https://storage.googleapis.com/gemini-generative-ai-api-ref-storage/prod/images/501375d8-04f7-4180-874f-e144a141b219.png",
  },
  {
    id: "vita-enamic",
    label: "CADstar Vita Enamic",
    type: "image",
    src: "https://storage.googleapis.com/gemini-generative-ai-api-ref-storage/prod/images/b2ff43bc-2d17-48f8-b32d-28383e5828de.png",
  },
  {
    id: "titan-gefrast",
    label: "Titan Gefrast",
    type: "circle",
    color: "#aebfbe",
  },
  {
    id: "cocr-gefrast",
    label: "Cocr Gefrast",
    type: "circle",
    color: "#aebfbe",
  },
  { id: "titan-laser", label: "Titan Laser", type: "circle", color: "#aebfbe" },
  { id: "cocr-laser", label: "Cocr Laser", type: "circle", color: "#aebfbe" },
];

// Define a theme to match the color scheme
const theme = createTheme({
  palette: {
    primary: {
      main: "#43a047",
    },
    background: {
      default: "#f5f5f5",
    },
    text: {
      primary: "#333",
    },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
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

const Material: React.FC<MaterialProps> = ({
  onSelect,
  selectedMaterial: propSelectedMaterial,
}) => {
  const [selectedMaterial, setSelectedMaterial] = useState(
    propSelectedMaterial || "zirkon"
  );

  const handleSelectMaterial = (id: string) => {
    setSelectedMaterial(id);
    if (onSelect) {
      onSelect(id);
    }
  };

  // Update local state when prop changes
  React.useEffect(() => {
    if (propSelectedMaterial) {
      setSelectedMaterial(propSelectedMaterial);
    }
  }, [propSelectedMaterial]);

  return (
    <ThemeProvider theme={theme}>
      <Stack flex="1" gap="20px">
        <Typography
          variant="h2"
          sx={{
            fontWeight: "600",
            // font-style: Semi Bold;
            fontSize: "24px",
            color: "rgba(146, 146, 146, 1)",
            // leading-trim: NONE;
            // line-height: 100%;
            // letter-spacing: 0%;
          }}
        >
          Material{" "}
          <Typography variant="body2" color="text.secondary" component="span">
            5 Achse / Laser / 30 Druck
          </Typography>
        </Typography>

        <Paper
          sx={{
            borderRadius: "10px",
            background: "rgba(255, 255, 255, 1)",
            padding: "26px 40px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            alignItems: "center",
            height: "100%",
          }}
        >
          <Grid container spacing={2}>
            {materialData.map((material) => {
              const isSelected = selectedMaterial === material.id;
              return (
                <Grid size={3} key={material.id}>
                  <Card
                    sx={{
                      borderRadius: "8px",
                      border: isSelected
                        ? "2px solid #f76b6b"
                        : "1px solid #e0e0e0",
                      backgroundColor: isSelected ? "#fff5f5" : "white",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "#f5f5f5",
                      },
                    }}
                    onClick={() => handleSelectMaterial(material.id)}
                  >
                    <CardActionArea
                      sx={{ padding: "16px", textAlign: "center" }}
                    >
                      <Box
                        sx={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "50%",
                          backgroundColor: material.color,
                          margin: "0 auto 8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {material.type === "image" && material.src && (
                          <img
                            src={material.src}
                            alt={material.label}
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                            }}
                          />
                        )}
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "500",
                          fontSize: "12px",
                          color: isSelected ? "#f76b6b" : "#333",
                        }}
                      >
                        {material.label}
                      </Typography>
                    </CardActionArea>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      </Stack>
    </ThemeProvider>
  );
};

export default Material;
