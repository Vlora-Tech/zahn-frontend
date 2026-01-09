import { useState } from "react";
import {
  Typography,
  IconButton,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Stack,
  TableSortLabel,
  Alert,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Refresh,
  Visibility,
  Search,
  FilterAlt,
  Print,
  Settings,
} from "@mui/icons-material";
import { useLabWorkQueue } from "../../api/lab-requests/hooks";
import { LabStatus } from "../../api/lab-requests/types";
import { useGetOperations } from "../../api/operations/hooks";
import StyledLink from "../../components/atoms/StyledLink";
import TableRowsLoader from "../../components/molecules/TableRowsLoader";
import EmptyTableState from "../../components/molecules/EmptyTableState";
import LabStatusChip from "./components/LabStatusChip";
import DateText from "../../components/atoms/DateText";

// Status filter options
const statusOptions: { value: LabStatus | "all"; label: string }[] = [
  { value: "all", label: "Alle Stand" },
  { value: "new", label: "Neu" },
  { value: "notified", label: "Benachrichtigt" },
  { value: "read", label: "Gelesen" },
  { value: "in_progress", label: "In Bearbeitung" },
  { value: "completed", label: "Abgeschlossen" },
  { value: "rejected", label: "Abgelehnt" },
  { value: "dispatched", label: "Versandt" },
];

const LabWorkQueue = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<LabStatus | "all">("all");
  const [operationFilter, setOperationFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "requestNumber" | "deliveryDate" | "createdAt"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch operations for filter dropdown
  const { data: operationsData } = useGetOperations({ limit: 100 });

  // Build query params
  const queryParams = {
    page,
    limit: 10,
    ...(statusFilter !== "all" && { labStatus: statusFilter }),
    ...(operationFilter !== "all" && { operation: operationFilter }),
    ...(searchTerm.trim() && { search: searchTerm.trim() }),
    sortBy,
    sortOrder,
  };

  const {
    data: labRequests,
    isLoading,
    error,
    refetch,
  } = useLabWorkQueue(queryParams);

  const handleStatusFilterChange = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value as LabStatus | "all");
    setPage(1);
  };

  const handleOperationFilterChange = (event: SelectChangeEvent<string>) => {
    setOperationFilter(event.target.value);
    setPage(1);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleSort = (
    property: "requestNumber" | "deliveryDate" | "createdAt",
  ) => {
    const isAsc = sortBy === property && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortBy(property);
    setPage(1);
  };

  const handleRefresh = () => {
    refetch();
  };

  const hasData = labRequests?.data && labRequests.data.length > 0;

  // Format operations list for display
  const formatOperations = (request: (typeof labRequests.data)[0]) => {
    const operations = request?.request?.operations;
    if (!operations || operations.length === 0) return "-";

    const operationNames = operations
      .map((op) => op.operation?.name || op.operation)
      .filter(Boolean);

    if (operationNames.length === 0) return "-";
    if (operationNames.length <= 2) return operationNames.join(", ");
    return `${operationNames.slice(0, 2).join(", ")} +${operationNames.length - 2}`;
  };

  return (
    <Stack flex="1" gap="20px" height="100%">
      <Typography
        variant="h2"
        sx={{
          color: "rgba(146, 146, 146, 1)",
        }}
      >
        Labor-Auftrage
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Fehler beim Laden der Laboraufträge. Bitte versuchen Sie es erneut.
        </Alert>
      )}

      <Paper
        sx={{
          borderRadius: "10px",
          background: "rgba(255, 255, 255, 1)",
          display: "flex",
          flexDirection: "column",
          flex: "1",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            p: "16px 28px",
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              size="small"
              placeholder="Patient oder Auftragsnr. suchen..."
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ minWidth: 500 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                displayEmpty
                startAdornment={
                  <InputAdornment position="start">
                    <FilterAlt
                      fontSize="small"
                      sx={{ color: "rgba(104, 201, 242, 1)" }}
                    />
                  </InputAdornment>
                }
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select
                value={operationFilter}
                onChange={handleOperationFilterChange}
                displayEmpty
                startAdornment={
                  <InputAdornment position="start">
                    <FilterAlt
                      fontSize="small"
                      sx={{ color: "rgba(104, 201, 242, 1)" }}
                    />
                  </InputAdornment>
                }
              >
                <MenuItem value="all">Alle Vorgangen</MenuItem>
                {operationsData?.data
                  ?.slice()
                  .sort((a, b) => a.name.localeCompare(b.name, "de"))
                  .map((operation) => (
                    <MenuItem key={operation._id} value={operation._id}>
                      {operation.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>
          <Box>
            <IconButton>
              <Print />
            </IconButton>
            <IconButton onClick={handleRefresh} title="Aktualisieren">
              <Refresh />
            </IconButton>
            <IconButton>
              <Settings />
            </IconButton>
          </Box>
        </Box>

        <Stack flex={1} justifyContent="space-between">
          <TableContainer>
            <Table>
              <TableHead
                sx={{
                  backgroundColor: "rgba(232, 232, 232, 1)",
                }}
              >
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "requestNumber"}
                      direction={sortBy === "requestNumber" ? sortOrder : "asc"}
                      onClick={() => handleSort("requestNumber")}
                    >
                      Auftragsnr.
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "createdAt"}
                      direction={sortBy === "createdAt" ? sortOrder : "asc"}
                      onClick={() => handleSort("createdAt")}
                    >
                      Erstellt am
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Vorgangen</TableCell>
                  <TableCell>Stand</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortBy === "deliveryDate"}
                      direction={sortBy === "deliveryDate" ? sortOrder : "asc"}
                      onClick={() => handleSort("deliveryDate")}
                    >
                      Liefertermin
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Zugewiesen an</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRowsLoader rowsNum={10} colNums={8} />
                ) : !hasData ? (
                  <EmptyTableState
                    colSpan={8}
                    message={
                      searchTerm.trim()
                        ? `Keine Laboraufträge für "${searchTerm}" gefunden`
                        : statusFilter !== "all"
                          ? "Keine Laboraufträge mit diesem Status gefunden"
                          : operationFilter !== "all"
                            ? "Keine Laboraufträge mit dieser Operation gefunden"
                            : "Keine Laboraufträge vorhanden"
                    }
                  />
                ) : (
                  <>
                    {labRequests?.data?.map((labRequest) => (
                      <TableRow key={labRequest._id} hover>
                        <TableCell>
                          {labRequest?.request?.requestNumber || "-"}
                        </TableCell>
                        <TableCell>
                          <DateText date={labRequest?.createdAt} showTime />
                        </TableCell>
                        <TableCell>
                          {labRequest?.request?.patient?.firstName &&
                          labRequest?.request?.patient?.lastName
                            ? `${labRequest.request.patient.firstName} ${labRequest.request.patient.lastName}`
                            : "-"}
                        </TableCell>
                        <TableCell>{formatOperations(labRequest)}</TableCell>
                        <TableCell>
                          <LabStatusChip status={labRequest.labStatus} />
                        </TableCell>
                        <TableCell>
                          <DateText date={labRequest?.request?.deliveryDate} />
                        </TableCell>
                        <TableCell>
                          {labRequest?.assignedTechnicianName ||
                          (labRequest?.assignedTechnician?.firstName &&
                            labRequest?.assignedTechnician?.lastName)
                            ? labRequest?.assignedTechnicianName ||
                              `${labRequest.assignedTechnician.firstName} ${labRequest.assignedTechnician.lastName}`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <StyledLink to={`/lab/requests/${labRequest._id}`}>
                            <Visibility />
                          </StyledLink>
                        </TableCell>
                      </TableRow>
                    ))}
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {hasData && labRequests?.pagination && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                p: "24px",
                marginTop: "auto",
              }}
            >
              <Pagination
                count={labRequests.pagination.totalPages || 1}
                page={labRequests.pagination.currentPage || 1}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
};

export default LabWorkQueue;
