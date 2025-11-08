import { Chip, Theme, type SxProps } from "@mui/material";

interface OperationChipProps {
  id: string;
  category: string;
  label: string;
  icon?: React.ReactNode;
  color: string;
  selected?: boolean;
  onSelect?: (option: any) => void;
  onDeselect?: (id: string) => void;
}

const OperationChip: React.FC<OperationChipProps> = (option) => {
  const isSelected = option?.selected;

  const chipStyles: SxProps<Theme> = {
    height: "38px",
    padding: "12px",
    borderColor: option.color,
    backgroundColor: isSelected
      ? option.color ?? "rgba(10, 77, 130, 1)"
      : "rgba(235, 235, 235, 1)",
    color: isSelected ? "white" : "black",
    width: "fit-content",
    fontSize: "16px",
    fontWeight: "500",
    borderRadius: "8px",
    justifyContent: "flex-start",
    cursor: "pointer",
    "& .MuiChip-deleteIcon": {
      color: "rgba(255, 255, 255, 0.7)",
      "&:hover": {
        color: "white",
      },
      justifySelf: "flex-end",
    },
    "&:hover": {
      backgroundColor: `${option.color ?? "rgba(10, 77, 130, 1)"} !important`,
      color: "white",
    },
  };

  return (
    <Chip
      key={option.id}
      icon={option?.icon as React.ReactElement}
      label={option.label}
      onClick={() => option?.onSelect(option)}
      onDelete={isSelected ? option?.onDeselect : undefined}
      variant={"outlined"}
      sx={chipStyles}
    />
  );
};

export default OperationChip;
