import React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  TableSortLabel,
  Skeleton,
  Typography,
  Card,
  CardContent,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Inbox, ChevronRight } from "@mui/icons-material";

// Column definition for the table
export interface ColumnDef<T> {
  id: string;
  label: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  sortable?: boolean;
  width?: string | number;
  align?: "left" | "center" | "right";
}

export interface ResponsiveTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  mobileCardRenderer: (item: T, index: number) => React.ReactNode;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  // Selection support
  selectable?: boolean;
  selected?: string[];
  onSelect?: (id: string) => void;
  getItemId?: (item: T) => string;
  // Sorting support
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (columnId: string) => void;
  // Loading skeleton config
  loadingRowsCount?: number;
}

// Loading skeleton for table rows
const TableRowsLoader: React.FC<{ rowsNum: number; colNums: number }> = ({
  rowsNum,
  colNums,
}) => {
  return (
    <>
      {[...Array(rowsNum)].map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {[...Array(colNums)].map((_, colIndex) => (
            <TableCell key={`col-${colIndex}`}>
              <Skeleton animation="wave" variant="text" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
};

// Loading skeleton for mobile cards
const CardLoader: React.FC<{ count: number }> = ({ count }) => {
  return (
    <Stack spacing={2}>
      {[...Array(count)].map((_, index) => (
        <Card key={index} sx={{ borderRadius: 2 }}>
          <CardContent>
            <Skeleton variant="text" width="60%" height={28} />
            <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Skeleton variant="text" width="30%" height={20} />
              <Skeleton variant="text" width="30%" height={20} />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
};

// Empty state component
const EmptyState: React.FC<{
  message: string;
  colSpan?: number;
  isTable?: boolean;
}> = ({ message, colSpan, isTable = false }) => {
  const content = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        py: 8,
        color: "rgba(146, 146, 146, 1)",
      }}
    >
      <Inbox sx={{ fontSize: 64, opacity: 0.3 }} />
      <Typography variant="h6" sx={{ fontWeight: 500 }}>
        {message}
      </Typography>
    </Box>
  );

  if (isTable && colSpan) {
    return (
      <TableRow>
        <TableCell colSpan={colSpan} align="center">
          {content}
        </TableCell>
      </TableRow>
    );
  }

  return content;
};

function ResponsiveTable<T>({
  data,
  columns,
  mobileCardRenderer,
  onRowClick,
  isLoading = false,
  emptyMessage = "Keine Daten verfügbar",
  selectable = false,
  selected = [],
  onSelect,
  getItemId,
  sortBy,
  sortOrder = "asc",
  onSort,
  loadingRowsCount = 10,
}: ResponsiveTableProps<T>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));

  const hasData = data && data.length > 0;

  // Get cell value from column definition
  const getCellValue = (item: T, column: ColumnDef<T>): React.ReactNode => {
    if (typeof column.accessor === "function") {
      return column.accessor(item);
    }
    const value = item[column.accessor];
    if (value === null || value === undefined) {
      return "-";
    }
    return value as React.ReactNode;
  };

  // Check if item is selected
  const isSelected = (item: T): boolean => {
    if (!getItemId) return false;
    return selected.includes(getItemId(item));
  };

  // Show all columns (tablet uses horizontal scroll instead of hiding columns)
  const visibleColumns = columns;

  // Calculate total columns including checkbox
  const totalColumns = visibleColumns.length + (selectable ? 1 : 0);

  // Mobile card view
  if (isMobile) {
    if (isLoading) {
      return (
        <Box sx={{ px: "1rem" }}>
          <CardLoader count={loadingRowsCount} />
        </Box>
      );
    }

    if (!hasData) {
      return (
        <Box sx={{ px: "1rem" }}>
          <EmptyState message={emptyMessage} />
        </Box>
      );
    }

    return (
      <Stack spacing={2} sx={{ px: "1rem", py: "1.25rem" }}>
        {data.map((item, index) => (
          <Card
            key={getItemId ? getItemId(item) : index}
            sx={{
              borderRadius: 2,
              cursor: onRowClick ? "pointer" : "default",
              transition: "box-shadow 0.2s, transform 0.2s",
              "&:hover": onRowClick
                ? {
                    boxShadow: 3,
                    transform: "translateY(-2px)",
                  }
                : {},
              "&:active": onRowClick
                ? {
                    transform: "translateY(0)",
                  }
                : {},
            }}
            onClick={() => onRowClick?.(item)}
          >
            <CardContent
              sx={{
                position: "relative",
                pr: onRowClick ? 5 : 2,
                "&:last-child": { pb: 2 },
              }}
            >
              {mobileCardRenderer(item, index)}
              {onRowClick && (
                <ChevronRight
                  sx={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "rgba(146, 146, 146, 0.5)",
                  }}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  }

  // Desktop/Tablet table view
  return (
    <TableContainer
      sx={{
        borderRadius: 0,
        boxShadow: "none",
        overflowX: "auto",
        width: "100%",
        backgroundColor: "transparent",
      }}
    >
      <Table
        stickyHeader={isTablet}
        sx={{
          // Set minimum width to force horizontal scroll when needed
          minWidth: 700,
        }}
      >
        <TableHead
          sx={{
            backgroundColor: "rgba(232, 232, 232, 1)",
            "& .MuiTableCell-stickyHeader": {
              backgroundColor: "rgba(232, 232, 232, 1)",
            },
          }}
        >
          <TableRow>
            {selectable && (
              <TableCell padding="checkbox">
                <Checkbox />
              </TableCell>
            )}
            {visibleColumns.map((column) => (
              <TableCell
                key={column.id}
                align={column.align || "left"}
                sx={{
                  width: column.width,
                  minWidth: column.width,
                  whiteSpace: "nowrap",
                }}
              >
                {column.sortable && onSort ? (
                  <TableSortLabel
                    active={sortBy === column.id}
                    direction={sortBy === column.id ? sortOrder : "asc"}
                    onClick={() => onSort(column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                ) : (
                  column.label
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableRowsLoader
              rowsNum={loadingRowsCount}
              colNums={totalColumns}
            />
          ) : !hasData ? (
            <EmptyState message={emptyMessage} colSpan={totalColumns} isTable />
          ) : (
            data.map((item, index) => {
              const itemSelected = isSelected(item);
              const itemId = getItemId ? getItemId(item) : index;

              return (
                <TableRow
                  key={itemId}
                  hover
                  onClick={() => {
                    if (onRowClick) {
                      onRowClick(item);
                    } else if (selectable && onSelect && getItemId) {
                      onSelect(getItemId(item));
                    }
                  }}
                  role={selectable ? "checkbox" : undefined}
                  aria-checked={selectable ? itemSelected : undefined}
                  tabIndex={-1}
                  selected={itemSelected}
                  sx={{
                    cursor: onRowClick || selectable ? "pointer" : "default",
                  }}
                >
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Checkbox checked={itemSelected} />
                    </TableCell>
                  )}
                  {visibleColumns.map((column) => (
                    <TableCell
                      key={column.id}
                      align={column.align || "left"}
                      sx={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {getCellValue(item, column)}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ResponsiveTable;
