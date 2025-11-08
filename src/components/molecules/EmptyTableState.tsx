import { TableRow, TableCell, Box, Typography } from "@mui/material";
import { Inbox } from "@mui/icons-material";

interface EmptyTableStateProps {
  colSpan: number;
  message?: string;
}

const EmptyTableState = ({ colSpan, message = "Keine Daten verfügbar" }: EmptyTableStateProps) => {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} align="center" sx={{ py: 8 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            color: "rgba(146, 146, 146, 1)",
          }}
        >
          <Inbox sx={{ fontSize: 64, opacity: 0.3 }} />
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            {message}
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default EmptyTableState;

