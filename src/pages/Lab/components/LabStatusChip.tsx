import React from "react";
import { Chip, ChipProps } from "@mui/material";
import { getLabStatusConfig, LabStatus } from "../../../constants/statusConfig";

interface LabStatusChipProps extends Omit<ChipProps, "color"> {
  status: LabStatus | string;
}

const LabStatusChip: React.FC<LabStatusChipProps> = ({
  status,
  sx,
  ...props
}) => {
  const config = getLabStatusConfig(status);

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
