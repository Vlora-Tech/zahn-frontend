import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  Typography,
  IconButton,
  Box,
  TextField,
  InputAdornment,
  Paper,
  Pagination,
  Stack,
  Alert,
  Tooltip,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  useTheme,
  useMediaQuery,
  InputLabel,
  Chip,
} from "@mui/material";
import {
  Search,
  Settings,
  Print,
  Refresh,
  Warning,
  FilterAlt,
  Error as ErrorIcon,
  CalendarToday,
  MedicalServices,
  Science,
} from "@mui/icons-material";
import MobileFilterPanel from "../../components/MobileFilterPanel";
import {
  getRequestStatusConfig,
  getLabStatusConfig,
} from "../../constants/statusConfig";
import { debounce } from "lodash";
import { useGetTreatmentRequests } from "../../api/treatment-requests/hooks";
import { useGetDoctors } from "../../api/doctors/hooks";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LabStatusChip from "../Lab/components/LabStatusChip";
import { LabStatus } from "../../api/lab-requests/types";
import RequestStatusChip from "./components/RequestStatusChip";
import { formatDateDE } from "../../utils/formatDate";
import DateText from "../../components/atoms/DateText";
import ResponsiveTable, { ColumnDef } from "../../components/ResponsiveTable";
import { TreatmentRequest } from "../../api/treatment-requests/types";

type RequestStatus =
  | "pending_approval"
  | "approved"
  | "rejected"
  | "received_from_lab"
  | "delivered_to_patient";

const requestStatusOptions: { value: RequestStatus | "all"; label: string }[] =
  [
    { value: "all", label: "Alle Stand" },
    { value: "pending_approval", label: "Genehmigung ausstehend" },
    { value: "approved", label: "Genehmigt" },
    { value: "rejected", label: "Abgelehnt" },
    { value: "received_from_lab", label: "Vom Labor erhalten" },
    { value: "delivered_to_patient", label: "An Patient geliefert" },
  ];

const labStatusOptions: { value: LabStatus | "all"; label: string }[] = [
  { value: "all", label: "Alle Labor-Stand" },
  { value: "new", label: "Neu" },
  { value: "notified", label: "Benachrichtigt" },
  { value: "read", label: "Gelesen" },
  { value: "in_progress", label: "In Bearbeitung" },
  { value: "completed", label: "Abgeschlossen" },
  { value: "rejected", label: "Abgelehnt" },
  { value: "dispatched", label: "Versandt" },
];

const rejectionReasonLabels: Record<string, string> = {
  incomplete_information: "Unvollständige Informationen",
  invalid_specifications: "Ungültige Spezifikationen",
  material_unavailable: "Material nicht verfügbar",
  equipment_issue: "Geräteproblem",
  other: "Sonstiges",
};

const LabStatusCell: React.FC<{
  requestStatus: string;
  isDoctorApprovalNeeded: boolean;
  labRequest?: {
    labStatus: LabStatus;
    rejectionReason?: string;
    rejectionDetails?: string;
  };
}> = ({ requestStatus, labRequest }) => {
  const shouldShowLabStatus =
    requestStatus !== "pending_approval" && requestStatus !== "rejected";
  if (!shouldShowLabStatus || !labRequest) return <span>-</span>;

  const isRejected = labRequest.labStatus === "rejected";
  if (isRejected) {
    const reasonLabel =
      rejectionReasonLabels[labRequest.rejectionReason || ""] ||
      labRequest.rejectionReason ||
      "Unbekannt";
    return (
      <Tooltip
        title={
          <Box>
            <Typography variant="body2" fontWeight={600}>
              Ablehnungsgrund: {reasonLabel}
            </Typography>
            {labRequest.rejectionDetails && (
              <Typography variant="body2">
                Details: {labRequest.rejectionDetails}
              </Typography>
            )}
          </Box>
        }
        arrow
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Warning sx={{ color: "#C62828", fontSize: 18 }} />
          <LabStatusChip status={labRequest.labStatus} />
        </Box>
      </Tooltip>
    );
  }
  return <LabStatusChip status={labRequest.labStatus} />;
};

const getDeliveryDateUrgency = (
  deliveryDate: string,
): "overdue" | "today" | "normal" => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const delivery = new Date(deliveryDate);
  delivery.setHours(0, 0, 0, 0);
  if (delivery < today) return "overdue";
  if (delivery.getTime() === today.getTime()) return "today";
  return "normal";
};

const DeliveryDateCell: React.FC<{ deliveryDate?: string; status: string }> = ({
  deliveryDate,
  status,
}) => {
  if (!deliveryDate) return <span>-</span>;
  const isDelivered = status === "delivered_to_patient";
  const urgency = isDelivered ? "normal" : getDeliveryDateUrgency(deliveryDate);
  const getStyles = () => {
    switch (urgency) {
      case "overdue":
        return { color: "#C62828", fontWeight: 600 };
      case "today":
        return { color: "#F9A825", fontWeight: 600 };
      default:
        return {};
    }
  };
  const showIcon = urgency === "overdue" || urgency === "today";
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        whiteSpace: "nowrap",
        fontVariantNumeric: "tabular-nums",
        ...getStyles(),
      }}
    >
      {formatDateDE(deliveryDate)}
      {showIcon && (
        <ErrorIcon
          sx={{
            fontSize: 18,
            color: urgency === "overdue" ? "#C62828" : "#F9A825",
          }}
        />
      )}
    </Box>
  );
};

// Mobile card renderer for requests
const RequestMobileCard = ({ request }: { request: TreatmentRequest }) => {
  const statusConfig = getRequestStatusConfig(
    request.status || "pending_approval",
  );
  const labStatusConfig = request.labRequest
    ? getLabStatusConfig(request.labRequest.labStatus)
    : null;

  return (
    <Box>
      {/* Request number and patient name */}
      <Box sx={{ mb: 1.5 }}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, color: "rgba(51, 51, 51, 1)" }}
        >
          #{request.requestNumber || "-"}
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(51, 51, 51, 1)" }}>
          {request.patient?.firstName && request.patient?.lastName
            ? `${request.patient.firstName} ${request.patient.lastName}`
            : "-"}
        </Typography>
      </Box>

      {/* Status chips - stacked vertically */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
          mb: 1.5,
        }}
      >
        <Chip
          icon={
            <MedicalServices
              sx={{
                fontSize: 14,
                color: `${statusConfig.textColor} !important`,
              }}
            />
          }
          label={`Stand: ${statusConfig.label}`}
          size="small"
          sx={{
            backgroundColor: statusConfig.bgColor,
            color: statusConfig.textColor,
            fontWeight: 500,
            fontSize: "11px",
            height: 24,
            width: "fit-content",
          }}
        />
        {labStatusConfig && (
          <Chip
            icon={
              <Science
                sx={{
                  fontSize: 14,
                  color: `${labStatusConfig.textColor} !important`,
                }}
              />
            }
            label={`Labor: ${labStatusConfig.label}`}
            size="small"
            sx={{
              backgroundColor: labStatusConfig.bgColor,
              color: labStatusConfig.textColor,
              fontWeight: 500,
              fontSize: "11px",
              height: 24,
              width: "fit-content",
            }}
          />
        )}
      </Box>

      {/* Delivery date */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <CalendarToday
          sx={{ fontSize: 16, color: "rgba(146, 146, 146, 0.7)" }}
        />
        <Typography variant="body2" sx={{ color: "rgba(100, 100, 100, 1)" }}>
          Liefertermin:{" "}
          <DeliveryDateCell
            deliveryDate={request.deliveryDate}
            status={request.status || "pending_approval"}
          />
        </Typography>
      </Box>
    </Box>
  );
};

const Requests = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useAuth();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">(
    "all",
  );
  const [labStatusFilter, setLabStatusFilter] = useState<LabStatus | "all">(
    "all",
  );
  const [doctorFilter, setDoctorFilter] = useState<string>("all");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState("createdAt");

  const { data: doctorsData } = useGetDoctors();

  const {
    data: requests,
    isLoading,
    error,
  } = useGetTreatmentRequests({
    page,
    limit: 15,
    search,
    sortBy: orderBy,
    sortOrder: order,
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(labStatusFilter !== "all" && { labStatus: labStatusFilter }),
    ...(doctorFilter !== "all" && { doctor: doctorFilter }),
    ...(user?.role === "doctor" ? { doctor: user?.id } : {}),
    ...(user?.role === "nurse" ? { clinic: user?.clinic?._id } : {}),
  });

  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      setSearch(searchTerm);
      setPage(1);
    }, 500),
    [],
  );

  useEffect(() => {
    debouncedSearch(searchInput);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchInput, debouncedSearch]);

  const handleSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSearchInput(event.target.value);
  const handleStatusFilterChange = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value as RequestStatus | "all");
    setPage(1);
  };
  const handleLabStatusFilterChange = (event: SelectChangeEvent<string>) => {
    setLabStatusFilter(event.target.value as LabStatus | "all");
    setPage(1);
  };
  const handleDoctorFilterChange = (event: SelectChangeEvent<string>) => {
    setDoctorFilter(event.target.value);
    setPage(1);
  };
  const handleRowClick = (request: TreatmentRequest) =>
    navigate(`/requests/${request._id}`);

  // Count active filters for mobile filter panel
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== "all") count++;
    if (labStatusFilter !== "all") count++;
    if (doctorFilter !== "all") count++;
    return count;
  }, [statusFilter, labStatusFilter, doctorFilter]);

  // Clear all filters
  const handleClearFilters = () => {
    setStatusFilter("all");
    setLabStatusFilter("all");
    setDoctorFilter("all");
    setPage(1);
  };

  const hasData = requests?.data && requests.data.length > 0;
  const mobileCardRenderer = (request: TreatmentRequest) => (
    <RequestMobileCard request={request} />
  );

  const columns: ColumnDef<TreatmentRequest>[] = [
    {
      id: "requestNumber",
      label: "Auftragsnr.",
      accessor: (r) => r.requestNumber || "-",
      sortable: true,
      width: 120,
    },
    {
      id: "deliveryDate",
      label: "Liefertermin",
      accessor: (r) => (
        <DeliveryDateCell
          deliveryDate={r.deliveryDate}
          status={r.status || "pending_approval"}
        />
      ),
      sortable: true,
      width: 130,
    },
    {
      id: "patient",
      label: "Patientenname",
      accessor: (r) =>
        r.patient?.firstName && r.patient?.lastName
          ? `${r.patient.firstName} ${r.patient.lastName}`
          : "-",
      sortable: true,
      width: 180,
    },
    {
      id: "doctor",
      label: "Zahnarzt",
      accessor: (r) =>
        r.doctor?.firstName && r.doctor?.lastName
          ? `${r.doctor.firstName} ${r.doctor.lastName}`
          : "-",
      sortable: true,
      width: 150,
    },
    {
      id: "status",
      label: "Stand",
      accessor: (r) => (
        <RequestStatusChip status={r.status || "pending_approval"} />
      ),
      sortable: true,
      width: 150,
    },
    {
      id: "labStatus",
      label: "Labor-Stand",
      accessor: (r) => (
        <LabStatusCell
          requestStatus={r.status}
          isDoctorApprovalNeeded={r.isDoctorApprovalNeeded}
          labRequest={r.labRequest}
        />
      ),
      width: 130,
    },
    {
      id: "createdAt",
      label: "Erstellt am",
      accessor: (r) => <DateText date={r.createdAt} showTime />,
      sortable: true,
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
        Auftragen
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Fehler beim Laden der Aufträge. Bitte versuchen Sie es erneut.
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
              variant="outlined"
              size="small"
              placeholder="Patient oder Auftragsnr. suchen..."
              value={searchInput}
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
              onChange={handleSearch}
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
                    {requestStatusOptions.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth>
                  <InputLabel id="mobile-lab-status-filter-label">
                    Labor-Stand
                  </InputLabel>
                  <Select
                    labelId="mobile-lab-status-filter-label"
                    value={labStatusFilter}
                    onChange={handleLabStatusFilterChange}
                    label="Labor-Stand"
                  >
                    {labStatusOptions.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth>
                  <InputLabel id="mobile-doctor-filter-label">
                    Zahnarzt
                  </InputLabel>
                  <Select
                    labelId="mobile-doctor-filter-label"
                    value={doctorFilter}
                    onChange={handleDoctorFilterChange}
                    label="Zahnarzt"
                  >
                    <MenuItem value="all">Alle Zahnärzte</MenuItem>
                    {doctorsData?.data?.map((doctor) => (
                      <MenuItem key={doctor._id} value={doctor._id}>
                        {doctor.firstName} {doctor.lastName}
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
                {requestStatusOptions.map((opt) => (
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
                value={labStatusFilter}
                onChange={handleLabStatusFilterChange}
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
                {labStatusOptions.map((opt) => (
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
                value={doctorFilter}
                onChange={handleDoctorFilterChange}
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
                <MenuItem value="all">Alle Zahnärzte</MenuItem>
                {doctorsData?.data?.map((doctor) => (
                  <MenuItem key={doctor._id} value={doctor._id}>
                    {doctor.firstName} {doctor.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <IconButton>
              <Print />
            </IconButton>
            <IconButton>
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
            <ResponsiveTable<TreatmentRequest>
              data={requests?.data || []}
              columns={columns}
              mobileCardRenderer={mobileCardRenderer}
              onRowClick={handleRowClick}
              isLoading={isLoading}
              emptyMessage={
                search
                  ? "Keine Aufträge gefunden"
                  : "Keine Aufträge vorhanden. Erstellen Sie einen neuen Auftrag."
              }
              getItemId={(r) => r._id}
              sortBy={orderBy}
              sortOrder={order}
              onSort={handleSort}
            />
          </Box>
          {hasData && requests?.pagination && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                p: { xs: "16px", sm: "24px" },
                flexShrink: 0,
              }}
            >
              <Pagination
                count={requests.pagination.totalPages || 1}
                page={requests.pagination.currentPage || 1}
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

export default Requests;
