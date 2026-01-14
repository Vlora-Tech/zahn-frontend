import { useEffect } from "react";
import { Box, Paper, Typography, Alert, CircularProgress } from "@mui/material";
import { Description, Warning } from "@mui/icons-material";
import { useFindMatchingTemplate } from "../api/laborzettel-templates/hooks";
import {
  LaborzettelTemplate,
  TemplateMatchQuery,
  PatientType,
  ImpressionType,
} from "../api/laborzettel-templates/types";

interface TemplateSelectorProps {
  operationId: string;
  patientType: PatientType;
  impressionType: ImpressionType;
  materialId: string;
  onTemplateSelect: (template: LaborzettelTemplate | null) => void;
  selectedTemplate?: LaborzettelTemplate | null;
  disabled?: boolean;
}

const TemplateSelector = ({
  operationId,
  patientType,
  impressionType,
  materialId,
  onTemplateSelect,
}: TemplateSelectorProps) => {
  // Build query for template matching
  const matchQuery: TemplateMatchQuery | null =
    operationId && patientType && impressionType && materialId
      ? { operationId, patientType, impressionType, materialId }
      : null;

  // Fetch matched template
  const {
    data: matchedTemplate,
    isLoading: isMatchLoading,
    error: matchError,
  } = useFindMatchingTemplate(matchQuery);

  // Update parent when matched template changes
  useEffect(() => {
    if (matchedTemplate) {
      onTemplateSelect(matchedTemplate);
    }
  }, [matchedTemplate, onTemplateSelect]);

  // Check if all required fields are provided
  const hasAllFields =
    operationId && patientType && impressionType && materialId;

  if (!hasAllFields) {
    return (
      <Alert severity="info" sx={{ borderRadius: "8px" }}>
        <Typography variant="body2">
          Bitte wählen Sie Operation, Patientenart, Abformungsart und Material
          aus, um eine passende Vorlage zu finden.
        </Typography>
      </Alert>
    );
  }

  return (
    <Paper
      sx={{
        borderRadius: "12px",
        background: "white",
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
        border: "1px solid rgba(0,0,0,0.05)",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          background:
            "linear-gradient(90deg, rgba(92, 107, 192, 0.1) 0%, rgba(121, 134, 203, 0.1) 100%)",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {isMatchLoading ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : matchError || !matchedTemplate ? (
          /* No Match Found */
          <Alert
            severity="warning"
            icon={<Warning />}
            sx={{ borderRadius: "8px" }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Keine passende Vorlage gefunden
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Für diese Kombination aus Operation, Patientenart, Abformungsart
              und Material existiert keine Vorlage. Sie können manuell eine
              Vorlage auswählen oder die Leistungen manuell eingeben.
            </Typography>
          </Alert>
        ) : (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Description sx={{ color: "rgba(92, 107, 192, 1)" }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {matchedTemplate?.name}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default TemplateSelector;
