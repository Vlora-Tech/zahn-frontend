import { useMemo } from "react";
import {
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardActionArea,
  Stack,
} from "@mui/material";
import { useGetMaterialsForOperation } from "../../../api/operations/hooks";
import LoadingSpinner from "../../../components/atoms/LoadingSpinner";
import { Error } from "@mui/icons-material";

interface MaterialProps {
  onSelect?: (material: any) => void;
  selectedMaterial?: any;
  selectedOperation?: any;
}

// Helper function to generate color based on material name
const generateMaterialColor = (name: string): string => {
  const colors = [
    "#e8f5e9",
    "#e0e0e0",
    "#fff3e0",
    "#e1f5fe",
    "#f3e5f5",
    "#aebfbe",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const Materials: React.FC<MaterialProps> = ({
  onSelect,
  selectedMaterial,
  selectedOperation,
}) => {
  const { data: materialsData, isLoading } = useGetMaterialsForOperation(
    selectedOperation?.id || ""
  );

  const materialOptions = useMemo(() => {
    if (
      materialsData &&
      Array.isArray(materialsData) &&
      materialsData.length > 0
    ) {
      return materialsData.map((material, index) => ({
        id: material._id || `material-${index}`,
        name: material.name || `Material ${index + 1}`,
        image: material.image || "",
        color: generateMaterialColor(material.name || `Material ${index + 1}`),
        description: material.description || "",
      }));
    } else {
      return [];
    }
  }, [materialsData]);

  return (
    <Stack flex="1" gap="20px">
      <Typography
        variant="h2"
        sx={{
          fontWeight: "600",
          fontSize: "24px",
          color: "rgba(146, 146, 146, 1)",
        }}
      >
        {"Materialien auswählen"}
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
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <Grid container spacing={"24px"} sx={{ width: "100%" }}>
            {materialOptions?.length > 0 ? (
              materialOptions.map((material) => {
                const isSelected = selectedMaterial?.id === material.id;

                return (
                  <Grid size={3} key={material.id}>
                    <Card
                      sx={{
                        borderRadius: "8px",
                        border: "1px solid rgba(10, 77, 130, 1)",
                        backgroundColor: isSelected
                          ? material.color
                          : "rgba(239, 239, 239, 1)",
                        cursor: "pointer",
                        width: "100%",
                        height: "100%",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: material.color,
                          opacity: "0.8",
                        },
                        boxShadow: "none",
                      }}
                      onClick={() => onSelect(material)}
                    >
                      <CardActionArea
                        sx={{
                          padding: "16px",
                          textAlign: "center",
                          width: "100%",
                          height: "100%",
                        }}
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
                          {material.image && (
                            <img
                              src={material.image}
                              alt={material.name}
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                              onError={(e) => {
                                // Hide broken images
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          )}
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "Montserrat",
                            fontWeight: "600",
                            marginTop: "8px",
                            fontSize: "14px",
                            color: "rgba(10, 77, 130, 1)",
                          }}
                        >
                          {material.name}
                        </Typography>
                      </CardActionArea>
                    </Card>
                  </Grid>
                );
              })
            ) : (
              <Stack
                width={"100%"}
                direction={"column"}
                justifyContent={"center"}
                alignItems={"center"}
              >
                <Error color="info" fontSize="large" />
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: "600",
                    marginTop: "8px",
                    fontSize: "14px",
                    color: "rgba(10, 77, 130, 1)",
                  }}
                >
                  Für den ausgewählten Vorgang stehen keine Materialien zur
                  Auswahl
                </Typography>
              </Stack>
            )}
          </Grid>
        )}
      </Paper>
    </Stack>
  );
};

export default Materials;
