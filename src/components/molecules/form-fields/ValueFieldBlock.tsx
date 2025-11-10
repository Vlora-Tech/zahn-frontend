import { Box, Typography } from "@mui/material";

interface ValueFieldBlockProps {
  label: string;
  value: string;
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
      <style>
        {`.summary-value::first-letter {
            text-transform: uppercase;
          }`}
      </style>
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
        <div className="summary-value">{value}</div>
      </Typography>
    </Box>
  );
};

export default ValueFieldBlock;
