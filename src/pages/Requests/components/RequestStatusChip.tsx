import React from "react";
import { Chip, ChipProps } from "@mui/material";
import {
  getRequestStatusConfig,
  RequestStatus,
} from "../../../constants/statusConfig";

interface RequestStatusChipProps extends Omit<ChipProps, "color"> {
  status: string;
}

const RequestStatusChip: React.FC<RequestStatusChipProps> = ({
  status,
  sx,
  ...props
}) => {
  const config = getRequestStatusConfig(status);

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
