import React from "react";
import { Alert, Typography, Box } from "@mui/material";
import { Warning } from "@mui/icons-material";
import { User } from "../../../api/users/types";
import { RejectionReason } from "../../../api/lab-requests/types";

interface RejectionAlertBannerProps {
  rejectionReason: RejectionReason | string;
  rejectionDetails?: string;
  rejectedBy?: User;
  rejectedAt?: string;
}

// Map rejection reason codes to human-readable German labels
const rejectionReasonLabels: Record<string, string> = {
  incomplete_information: "Unvollständige Informationen",
  invalid_specifications: "Ungültige Spezifikationen",
  material_unavailable: "Material nicht verfügbar",
  equipment_issue: "Geräteproblem",
  other: "Sonstiges",
};

const RejectionAlertBanner: React.FC<RejectionAlertBannerProps> = ({
  rejectionReason,
  rejectionDetails,
  rejectedBy,
  rejectedAt,
}) => {
  const reasonLabel =
    rejectionReasonLabels[rejectionReason] || rejectionReason;

  const rejectedByName = rejectedBy
    ? `${rejectedBy.firstName || ""} ${rejectedBy.lastName || ""}`.trim()
    : undefined;

  const formattedDate = rejectedAt
    ? new Date(rejectedAt).toLocaleString("de-DE")
    : undefined;

  return (
    <Alert
      severity="error"
      icon={<Warning fontSize="large" />}
      sx={{
        borderRadius: "10px",
        backgroundColor: "#FFEBEE",
        border: "1px solid #EF5350",
        "& .MuiAlert-icon": {
          color: "#C62828",
          alignItems: "center",
        },
        "& .MuiAlert-message": {
          width: "100%",
        },
      }}
    >
      <Box>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: "#C62828",
            mb: 1,
          }}
        >
          Dieser Auftrag wurde vom Labor abgelehnt
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography variant="body2" sx={{ color: "#B71C1C" }}>
            <strong>Ablehnungsgrund:</strong> {reasonLabel}
          </Typography>

          {rejectionDetails && (
            <Typography variant="body2" sx={{ color: "#B71C1C" }}>
              <strong>Details:</strong> {rejectionDetails}
            </Typography>
          )}

          {rejectedByName && (
            <Typography variant="body2" sx={{ color: "#B71C1C" }}>
              <strong>Abgelehnt von:</strong> {rejectedByName}
            </Typography>
          )}

          {formattedDate && (
            <Typography variant="body2" sx={{ color: "#B71C1C" }}>
              <strong>Abgelehnt am:</strong> {formattedDate}
            </Typography>
          )}
        </Box>
      </Box>
    </Alert>
  );
};

export default RejectionAlertBanner;
