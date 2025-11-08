import { Chip } from "@mui/material";
import FaceIcon from "@mui/icons-material/Face";

interface MaterialOptionProps {
  // Define any props if needed
  label?: string;
  borderColor?: string;
  isSelected?: boolean; // Optional prop to indicate if the option is selected
  onDelete?: () => void; // Optional prop for delete action
}

export default function MaterialOption({
  label = "",
  borderColor = "rgba(171, 9, 181, 1)",
  isSelected = false,
  onDelete,
}: MaterialOptionProps) {
  return (
    <Chip
      icon={<FaceIcon />}
      label={label}
      variant="outlined"
      sx={{
        borderRadius: "8px",
        backgroundColor: "rgba(235, 235, 235, 1)",
        borderColor,
        width: "100%",
        justifyContent: "flex-start",
        cursor: "pointer",
      }}
      {...(isSelected
        ? {
            onDelete,
          }
        : {})}
    />
  );
}
