import React from "react";
import { Chip, ChipProps } from "@mui/material";

type RequestStatus = "pending_approval" | "approved" | "rejected" | "received_from_lab" | "delivered_to_patient";

interface RequestStatusChipProps extends Omit<ChipProps, "color"> {
  status: string;
}

// Status configuration with colors and labels
const statusConfig: Record<
  RequestStatus,
  { label: string; bgColor: string; textColor: string }
> = {
  pending_approval: {
    label: "Genehmigung ausstehend",
    bgColor: "#FFF3E0",
    textColor: "#E65100",
  },
  approved: {
    label: "Genehmigt",
    bgColor: "#E8F5E9",
    textColor: "#2E7D32",
  },
  rejected: {
    label: "Abgelehnt",
    bgColor: "#FFEBEE",
    textColor: "#C62828",
  },
  received_from_lab: {
    label: "Vom Labor erhalten",
    bgColor: "#E0F2F1",
    textColor: "#00695C",
  },
  delivered_to_patient: {
    label: "An Patient übergeben",
    bgColor: "#E3F2FD",
    textColor: "#1565C0",
  },
};

const RequestStatusChip: React.FC<RequestStatusChipProps> = ({
  status,
  sx,
  ...props
}) => {
  const config =
    statusConfig[status as RequestStatus] || statusConfig.pending_approval;

  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        backgroundColor: config.bgColor,
        color: config.textColor,
        fontWeight: 500,
        fontSize: "0.75rem",
        height: "24px",
        ...sx,
      }}
      {...props}
    />
  );
};

export default RequestStatusChip;
