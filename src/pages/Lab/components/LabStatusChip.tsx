import React from "react";
import { Chip, ChipProps } from "@mui/material";
import { LabStatus } from "../../../api/lab-requests/types";

interface LabStatusChipProps extends Omit<ChipProps, "color"> {
  status: LabStatus;
}

// Status configuration with colors and labels
const statusConfig: Record<
  LabStatus,
  { label: string; bgColor: string; textColor: string }
> = {
  new: {
    label: "Neu",
    bgColor: "#E3F2FD",
    textColor: "#1565C0",
  },
  notified: {
    label: "Benachrichtigt",
    bgColor: "#FFF3E0",
    textColor: "#E65100",
  },
  read: {
    label: "Gelesen",
    bgColor: "#F3E5F5",
    textColor: "#7B1FA2",
  },
  in_progress: {
    label: "In Bearbeitung",
    bgColor: "#FFFDE7",
    textColor: "#F9A825",
  },
  completed: {
    label: "Abgeschlossen",
    bgColor: "#E8F5E9",
    textColor: "#2E7D32",
  },
  rejected: {
    label: "Abgelehnt",
    bgColor: "#FFEBEE",
    textColor: "#C62828",
  },
  dispatched: {
    label: "Versandt",
    bgColor: "#E0F2F1",
    textColor: "#00695C",
  },
};

const LabStatusChip: React.FC<LabStatusChipProps> = ({ status, sx, ...props }) => {
  const config = statusConfig[status] || statusConfig.new;

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

export default LabStatusChip;
