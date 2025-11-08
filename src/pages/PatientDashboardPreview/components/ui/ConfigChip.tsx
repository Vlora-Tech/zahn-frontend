import { Chip, Theme, type SxProps } from "@mui/material";

interface ConfigChipProps {
  id: string;
  category: string;
  label: string;
  icon?: React.ReactNode;
  color: string;
  selected?: boolean;
  onSelect: (id: string) => void;
  onDeselect?: (id: string) => void;
}

const ConfigChip: React.FC<ConfigChipProps> = (option) => {
  const isSelected = option?.selected;
  // Type sx prop for better autocompletion and type checking
  const chipStyles: SxProps<Theme> = {
    borderColor: option.color,
    backgroundColor: isSelected ? option.color : "rgba(235, 235, 235, 1)",
    color: isSelected ? "white" : "black",
    width: "100%",

    fontSize: "14px",
    fontWeight: "500",

    borderRadius: "8px",
    justifyContent: "flex-start",
    cursor: "pointer",

    "& .MuiChip-label": {
      flex: 1,
    },

    "& .MuiChip-deleteIcon": {
      color: "rgba(255, 255, 255, 0.7)",
      "&:hover": {
        color: "white",
      },
      justifySelf: "flex-end",
    },
    "&:hover": {
      backgroundColor: isSelected ? option.color : "#e0e0e0",
    },
  };

  return (
    <Chip
      key={option.id}
      icon={option?.icon as React.ReactElement}
      label={option.label}
      onClick={() => option?.onSelect(option.id)}
      onDelete={isSelected ? option?.onDeselect : undefined}
      variant={"outlined"}
      sx={chipStyles}
    />
  );
};

export default ConfigChip;
