import {
  Box,
  Typography,
  Paper,
  type SxProps,
  type Theme,
  Grid,
  Stack,
} from "@mui/material";
import { useGetOperations } from "../../../api/operations/hooks";
import OperationChip from "./ui/OperationChip";
import ToothIcon from "./ui/ToothIcon";
import LoadingSpinner from "../../../components/atoms/LoadingSpinner";
import { useMemo } from "react";

interface DentalOption {
  id: string;
  category: string;
  label: string;
  color: string;
}

const containerStyles: SxProps<Theme> = {
  padding: "26px 40px",
  display: "flex",
  flexGrow: "1",
  flexDirection: "column",
  gap: "20px",
  alignItems: "baseline",
  borderRadius: "10px",
  background: "rgba(255, 255, 255, 1)",
  overflowY: "auto",
};

type GroupedOptions = {
  [category: string]: DentalOption[];
};

const groupOptionsByCategory = (options: DentalOption[]): GroupedOptions => {
  return options.reduce((acc, option) => {
    if (!acc[option.category]) {
      acc[option.category] = [];
    }
    acc[option.category].push(option);
    return acc;
  }, {} as GroupedOptions);
};

interface OperationsProps {
  selectedOperation?: any;
  onSelect: (optionId: string) => void;
}

const Operations: React.FC<OperationsProps> = ({
  selectedOperation,
  onSelect,
}) => {
  const { data: operations, isLoading } = useGetOperations({
    page: 1,
    limit: 100,
    sortBy: "createdAt",
    sortOrder: "asc",
  });

  const handleSelectOption = (option: any): void => {
    onSelect(option);
  };

  const operationOptions = useMemo(() => {
    if (
      operations &&
      operations?.data &&
      Array.isArray(operations?.data) &&
      operations?.data.length > 0
    ) {
      return operations?.data.map((option) => ({
        id: option._id,
        category: option.category.name,
        label: option.name,
        color: option.color,
      }));
    }
    return [];
  }, [operations]);

  const groupedOptions = groupOptionsByCategory(operationOptions);

  return (
    <Stack flex="1" gap="20px">
      <Typography
        variant="h2"
        sx={{
          fontWeight: "600",
          fontSize: "24px",
          color: "rgba(146, 146, 146, 1)",
        }}
      >
        {"Vorgang auswählen"}
      </Typography>
      <Paper sx={containerStyles}>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          Object.entries(groupedOptions).map(([category, options]) => (
            <Box key={category} sx={{ width: "100%" }}>
              <Typography
                variant="h6"
                sx={{ mb: 2, color: "#666", fontWeight: "700" }}
              >
                {category}
              </Typography>
              <Grid container spacing={2}>
                {options.map((option) => {
                  const isSelected = selectedOperation?.id === option.id;

                  return (
                    <OperationChip
                      id={option.id}
                      category={category}
                      label={option.label}
                      icon={<ToothIcon />}
                      color={option.color}
                      selected={isSelected}
                      onSelect={handleSelectOption}
                    />
                  );
                })}
              </Grid>
            </Box>
          ))
        )}
      </Paper>
    </Stack>
  );
};

export default Operations;
