import { Box, Typography } from "@mui/material";
import { ReactNode } from "react";

interface ValueFieldBlockProps {
  label: string;
  value: ReactNode;
}

const ValueFieldBlock: React.FC<ValueFieldBlockProps> = ({ label, value }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <Typography
        sx={{
          fontWeight: "400",
          fontSize: "14px",
          color: "rgba(10, 77, 130, 1)",
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontWeight: "500",
          fontSize: "16px",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};

export default ValueFieldBlock;
