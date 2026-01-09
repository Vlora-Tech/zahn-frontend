import React from "react";
import { Box, BoxProps } from "@mui/material";
import { formatDateDE, formatDateTimeDE } from "../../utils/formatDate";

interface DateTextProps extends Omit<BoxProps, "children"> {
  date: string | Date | undefined | null;
  fallback?: string;
  showTime?: boolean;
}

/**
 * Component to display formatted dates with tabular-nums for consistent digit width
 */
const DateText: React.FC<DateTextProps> = ({
  date,
  fallback = "-",
  showTime = false,
  sx,
  ...props
}) => {
  if (!date) return <span>{fallback}</span>;

  const formatFn = showTime ? formatDateTimeDE : formatDateDE;

  return (
    <Box
      component="span"
      sx={{
        fontVariantNumeric: "tabular-nums",
        ...sx,
      }}
      {...props}
    >
      {formatFn(date)}
    </Box>
  );
};

export default DateText;
