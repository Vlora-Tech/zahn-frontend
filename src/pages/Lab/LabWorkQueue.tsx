import { useState, useMemo } from "react";
import {
  Typography,
  IconButton,
  Box,
  Paper,
  Pagination,
  Stack,
  Alert,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
  InputLabel,
} from "@mui/material";
import {
  Refresh,
  Search,
  FilterAlt,
  Print,
  Settings,
  CalendarToday,
} from "@mui/icons-material";
import MobileFilterPanel from "../../components/MobileFilterPanel";
import { useLabWorkQueue } from "../../api/lab-requests/hooks";
import { LabStatus, LabRequest } from "../../api/lab-requests/types";
import { useGetOperations } from "../../api/operations/hooks";
import { useNavigate } from "react-router-dom";
import LabStatusChip from "./components/LabStatusChip";
import DateText from "../../components/atoms/DateText";
import ResponsiveTable, { ColumnDef } from "../../components/ResponsiveTable";

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

// Mobile card renderer for lab requests
const LabRequestMobileCard = ({ labRequest }: { labRequest: LabRequest }) => {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 1,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, color: "rgba(51, 51, 51, 1)" }}
        >
          #{labRequest.request?.requestNumber || "-"}
        </Typography>
        <LabStatusChip status={labRequest.labStatus} />
      </Box>
      <Typography
        variant="body2"
        sx={{ color: "rgba(51, 51, 51, 1)", mb: 0.5 }}
      >
        {labRequest.request?.patient?.firstName &&
        labRequest.request?.patient?.lastName
          ? `${labRequest.request.patient.firstName} ${labRequest.request.patient.lastName}`
          : "-"}
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
          mt: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <CalendarToday
            sx={{ fontSize: 16, color: "rgba(146, 146, 146, 0.7)" }}
          />
          <Typography variant="body2" sx={{ color: "rgba(100, 100, 100, 1)" }}>
            <DateText date={labRequest.request?.deliveryDate} />
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

const LabWorkQueue = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<LabStatus | "all">("all");
  const [operationFilter, setOperationFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<
    "requestNumber" | "deliveryDate" | "createdAt"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { data: operationsData } = useGetOperations({ limit: 100 });

  const queryParams = {
    page,
    limit: 15,
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
  const handleSort = (property: string) => {
    const prop = property as "requestNumber" | "deliveryDate" | "createdAt";
    const isAsc = sortBy === prop && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortBy(prop);
    setPage(1);
  };

  // Count active filters for mobile filter panel
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== "all") count++;
    if (operationFilter !== "all") count++;
    return count;
  }, [statusFilter, operationFilter]);

  // Clear all filters
  const handleClearFilters = () => {
    setStatusFilter("all");
    setOperationFilter("all");
    setPage(1);
  };
  const handleRefresh = () => refetch();
  const handleRowClick = (labRequest: LabRequest) =>
    navigate(`/lab/requests/${labRequest._id}`);

  const hasData = labRequests?.data && labRequests.data.length > 0;
  const mobileCardRenderer = (labRequest: LabRequest) => (
    <LabRequestMobileCard labRequest={labRequest} />
  );

  const formatOperations = (request: LabRequest) => {
    const operations = request?.request?.operations;
    if (!operations || operations.length === 0) return "-";
    const operationNames = operations
      .map((op) => op.operation?.name || op.operation)
      .filter(Boolean);
    if (operationNames.length === 0) return "-";
    if (operationNames.length <= 2) return operationNames.join(", ");
    return `${operationNames.slice(0, 2).join(", ")} +${operationNames.length - 2}`;
  };

  const columns: ColumnDef<LabRequest>[] = [
    {
      id: "requestNumber",
      label: "Auftragsnr.",
      accessor: (r) => r.request?.requestNumber || "-",
      sortable: true,
      width: 120,
    },
    {
      id: "createdAt",
      label: "Erstellt am",
      accessor: (r) => <DateText date={r.createdAt} showTime />,
      sortable: true,
      width: 150,
    },
    {
      id: "patient",
      label: "Patient",
      accessor: (r) =>
        r.request?.patient?.firstName && r.request?.patient?.lastName
          ? `${r.request.patient.firstName} ${r.request.patient.lastName}`
          : "-",
      width: 180,
    },
    {
      id: "operations",
      label: "Vorgänge",
      accessor: (r) => formatOperations(r),
      width: 200,
    },
    {
      id: "labStatus",
      label: "Stand",
      accessor: (r) => <LabStatusChip status={r.labStatus} />,
      width: 130,
    },
    {
      id: "deliveryDate",
      label: "Liefertermin",
      accessor: (r) => <DateText date={r.request?.deliveryDate} />,
      sortable: true,
      width: 120,
    },
    {
      id: "assignedTechnician",
      label: "Zugewiesen an",
      accessor: (r) =>
        r.assignedTechnicianName ||
        (r.assignedTechnician?.firstName && r.assignedTechnician?.lastName
          ? `${r.assignedTechnician.firstName} ${r.assignedTechnician.lastName}`
          : "-"),
      width: 150,
    },
  ];

  return (
    <Stack
      flex="1"
      gap="20px"
      height="100%"
      sx={{ overflow: "hidden", minWidth: 0 }}
    >
      <Typography variant="h2" sx={{ color: "rgba(146, 146, 146, 1)" }}>
        Labor-Auftrage
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Fehler beim Laden der Laboraufträge. Bitte versuchen Sie es erneut.
        </Alert>
      )}

      <Paper
        sx={{
          borderRadius: { xs: 0, sm: "10px" },
          background: "rgba(255, 255, 255, 1)",
          display: "flex",
          flexDirection: "column",
          flex: "1",
          overflow: "hidden",
          maxWidth: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "center" },
            gap: { xs: 2, sm: 2 },
            p: { xs: "12px 16px", sm: "16px 28px" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              flexWrap: "wrap",
              flex: 1,
            }}
          >
            <TextField
              size="small"
              placeholder="Patient oder Auftragsnr. suchen..."
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{
                minWidth: { xs: "100%", sm: 200, md: 300 },
                width: { xs: "100%", sm: "auto" },
                flexShrink: 1,
                "& .MuiInputBase-root": {
                  minHeight: { xs: "44px", sm: "40px" },
                },
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            {/* Mobile Filter Panel */}
            {isMobile && (
              <MobileFilterPanel
                activeFilterCount={activeFilterCount}
                onClearFilters={handleClearFilters}
              >
                <FormControl size="small" fullWidth>
                  <InputLabel id="mobile-status-filter-label">Stand</InputLabel>
                  <Select
                    labelId="mobile-status-filter-label"
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                    label="Stand"
                  >
                    {statusOptions.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth>
                  <InputLabel id="mobile-operation-filter-label">
                    Vorgang
                  </InputLabel>
                  <Select
                    labelId="mobile-operation-filter-label"
                    value={operationFilter}
                    onChange={handleOperationFilterChange}
                    label="Vorgang"
                  >
                    <MenuItem value="all">Alle Vorgänge</MenuItem>
                    {operationsData?.data
                      ?.slice()
                      .sort((a, b) => a.name.localeCompare(b.name, "de"))
                      .map((op) => (
                        <MenuItem key={op._id} value={op._id}>
                          {op.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </MobileFilterPanel>
            )}

            {/* Desktop/Tablet Filter Controls */}
            <FormControl
              size="small"
              sx={{ minWidth: 150, display: { xs: "none", sm: "flex" } }}
            >
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
                {statusOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl
              size="small"
              sx={{ minWidth: 150, display: { xs: "none", md: "flex" } }}
            >
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
                <MenuItem value="all">Alle Vorgänge</MenuItem>
                {operationsData?.data
                  ?.slice()
                  .sort((a, b) => a.name.localeCompare(b.name, "de"))
                  .map((op) => (
                    <MenuItem key={op._id} value={op._id}>
                      {op.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
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
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          <Box
            sx={{ flex: 1, overflowX: "auto", overflowY: "auto", minWidth: 0 }}
          >
            <ResponsiveTable<LabRequest>
              data={labRequests?.data || []}
              columns={columns}
              mobileCardRenderer={mobileCardRenderer}
              onRowClick={handleRowClick}
              isLoading={isLoading}
              emptyMessage={
                searchTerm.trim()
                  ? `Keine Laboraufträge für "${searchTerm}" gefunden`
                  : statusFilter !== "all"
                    ? "Keine Laboraufträge mit diesem Status gefunden"
                    : "Keine Laboraufträge vorhanden"
              }
              getItemId={(r) => r._id}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
          </Box>
          {hasData && labRequests?.pagination && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                p: { xs: "16px", sm: "24px" },
                flexShrink: 0,
              }}
            >
              <Pagination
                count={labRequests.pagination.totalPages || 1}
                page={labRequests.pagination.currentPage || 1}
                onChange={(_, value) => setPage(value)}
                color="primary"
                size={isMobile ? "small" : "medium"}
              />
            </Box>
          )}
        </Box>
      </Paper>
    </Stack>
  );
};

export default LabWorkQueue;
