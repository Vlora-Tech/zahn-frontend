import React, { useState, useCallback, useEffect } from "react";
import {
  Typography,
  IconButton,
  Box,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Pagination,
  Stack,
  TableSortLabel,
  Alert,
  Tooltip,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import {
  Search,
  Settings,
  Print,
  Refresh,
  Visibility,
  Warning,
  FilterAlt,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { debounce } from "lodash";
import { useGetTreatmentRequests } from "../../api/treatment-requests/hooks";
import { useGetDoctors } from "../../api/doctors/hooks";
import StyledLink from "../../components/atoms/StyledLink";
import TableRowsLoader from "../../components/molecules/TableRowsLoader";
import EmptyTableState from "../../components/molecules/EmptyTableState";
import { useAuth } from "../../context/AuthContext";
import LabStatusChip from "../Lab/components/LabStatusChip";
import { LabStatus } from "../../api/lab-requests/types";
import RequestStatusChip from "./components/RequestStatusChip";
import { formatDateDE } from "../../utils/formatDate";
import DateText from "../../components/atoms/DateText";

// Request status type
type RequestStatus =
  | "pending_approval"
  | "approved"
  | "rejected"
  | "received_from_lab"
  | "delivered_to_patient";

// Status filter options for request status (Stand)
const requestStatusOptions: { value: RequestStatus | "all"; label: string }[] =
  [
    { value: "all", label: "Alle Stand" },
    { value: "pending_approval", label: "Genehmigung ausstehend" },
    { value: "approved", label: "Genehmigt" },
    { value: "rejected", label: "Abgelehnt" },
    { value: "received_from_lab", label: "Vom Labor erhalten" },
    { value: "delivered_to_patient", label: "An Patient geliefert" },
  ];

// Lab status filter options (Labor-Stand)
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

// Map rejection reason codes to human-readable German labels
const rejectionReasonLabels: Record<string, string> = {
  incomplete_information: "Unvollständige Informationen",
  invalid_specifications: "Ungültige Spezifikationen",
  material_unavailable: "Material nicht verfügbar",
  equipment_issue: "Geräteproblem",
  other: "Sonstiges",
};

// Component to display lab status for a single request row
const LabStatusCell: React.FC<{
  requestStatus: string;
  isDoctorApprovalNeeded: boolean;
  labRequest?: {
    labStatus: LabStatus;
    rejectionReason?: string;
    rejectionDetails?: string;
  };
}> = ({ requestStatus, isDoctorApprovalNeeded, labRequest }) => {
  // Show lab status for approved requests OR auto-approved requests (isDoctorApprovalNeeded = false)
  const shouldShowLabStatus =
    requestStatus === "approved" || !isDoctorApprovalNeeded;

  // Don't show anything for requests that don't have lab status
  if (!shouldShowLabStatus) {
    return <span>-</span>;
  }

  if (!labRequest) {
    return <span>-</span>;
  }

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

// Helper to check delivery date urgency
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

// Component to display delivery date with urgency styling
const DeliveryDateCell: React.FC<{
  deliveryDate?: string;
  status: string;
}> = ({ deliveryDate, status }) => {
  if (!deliveryDate) return <span>-</span>;

  // Don't show urgency styling if delivered to patient
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

const Requests = () => {
  const [selected, setSelected] = useState<string[]>([]);
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

  const { user } = useAuth();

  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState("createdAt");

  // Fetch doctors for filter dropdown
  const { data: doctorsData } = useGetDoctors();

  const {
    data: requests,
    isLoading: isRequestsLoading,
    error: requestsError,
  } = useGetTreatmentRequests({
    page,
    search,
    sortBy: orderBy,
    sortOrder: order,
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(labStatusFilter !== "all" && { labStatus: labStatusFilter }),
    ...(doctorFilter !== "all" && { doctor: doctorFilter }),
    ...(user?.role === "doctor" ? { doctor: user?.id } : {}),
    ...(user?.role === "nurse" ? { clinic: user?.clinic?._id } : {}),
  });

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      setSearch(searchTerm);
      setPage(1); // Reset to first page when searching
    }, 500), // 500ms delay
    [],
  );

  const handleSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";

    setOrder(isAsc ? "desc" : "asc");

    setOrderBy(property);
  };

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

  // Effect to trigger debounced search when searchInput changes
  useEffect(() => {
    debouncedSearch(searchInput);

    // Cleanup function to cancel pending debounced calls
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchInput, debouncedSearch]);

  const handleClick = (id: string) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  const hasData = requests?.data && requests.data.length > 0;

  return (
    <Stack flex="1" gap="20px" height={"100%"}>
      <Typography
        variant="h2"
        sx={{
          color: "rgba(146, 146, 146, 1)",
        }}
      >
        Auftragen
      </Typography>

      {/* Error Alert */}
      {requestsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Fehler beim Laden der Aufträge. Bitte versuchen Sie es erneut.
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
          }}
        >
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Patient oder Auftragsnr. suchen..."
              value={searchInput}
              sx={{ minWidth: 500 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
              onChange={handleSearch}
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
                {requestStatusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
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
                {labStatusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
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
          <Box>
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
        <Stack flex={1} justifyContent={"space-between"}>
          <TableContainer>
            <Table>
              <TableHead
                sx={{
                  backgroundColor: "rgba(232, 232, 232, 1)",
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox />
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "requestNumber"}
                    direction={orderBy === "requestNumber" ? order : "asc"}
                    onClick={() => handleSort("requestNumber")}
                  >
                    Auftragsnr.
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "createdAt"}
                    direction={orderBy === "createdAt" ? order : "asc"}
                    onClick={() => handleSort("createdAt")}
                  >
                    Erstellt am
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "deliveryDate"}
                    direction={orderBy === "deliveryDate" ? order : "asc"}
                    onClick={() => handleSort("deliveryDate")}
                  >
                    Liefertermin
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "patient"}
                    direction={orderBy === "patient" ? order : "asc"}
                    onClick={() => handleSort("patient")}
                  >
                    Patientenname
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "doctor"}
                    direction={orderBy === "doctor" ? order : "asc"}
                    onClick={() => handleSort("doctor")}
                  >
                    Zahnarzt
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === "status"}
                    direction={orderBy === "status" ? order : "asc"}
                    onClick={() => handleSort("status")}
                  >
                    Stand
                  </TableSortLabel>
                </TableCell>
                <TableCell>Labor-Stand</TableCell>
                {/* <TableCell>Erstellt von</TableCell> */}
                <TableCell></TableCell>
              </TableHead>
              <TableBody>
                {isRequestsLoading ? (
                  <TableRowsLoader rowsNum={10} colNums={8} />
                ) : !hasData ? (
                  <EmptyTableState
                    colSpan={8}
                    message={
                      search
                        ? "Keine Aufträge gefunden"
                        : "Keine Aufträge vorhanden. Erstellen Sie einen neuen Auftrag."
                    }
                  />
                ) : (
                  <>
                    {requests?.data?.map((request) => {
                      const isItemSelected = isSelected(request._id);

                      return (
                        <TableRow
                          key={request._id}
                          hover
                          onClick={() => handleClick(request._id)}
                          role="checkbox"
                          aria-checked={isItemSelected}
                          tabIndex={-1}
                          selected={isItemSelected}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox checked={isItemSelected} />
                          </TableCell>
                          <TableCell>{request?.requestNumber || "-"}</TableCell>
                          <TableCell>
                            <DateText date={request?.createdAt} showTime />
                          </TableCell>
                          <TableCell>
                            <DeliveryDateCell
                              deliveryDate={request?.deliveryDate}
                              status={request?.status || "pending_approval"}
                            />
                          </TableCell>
                          <TableCell>
                            {request?.patient?.firstName &&
                            request?.patient?.lastName
                              ? `${request.patient.firstName} ${request.patient.lastName}`
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {request?.doctor?.firstName &&
                            request?.doctor?.lastName
                              ? `${request.doctor.firstName} ${request.doctor.lastName}`
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <RequestStatusChip
                              status={request?.status || "pending_approval"}
                            />
                          </TableCell>
                          <TableCell>
                            <LabStatusCell
                              requestStatus={request.status}
                              isDoctorApprovalNeeded={
                                request.isDoctorApprovalNeeded
                              }
                              labRequest={request.labRequest}
                            />
                          </TableCell>
                          <TableCell>
                            <StyledLink to={`/requests/${request?._id}`}>
                              <Visibility />
                            </StyledLink>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {hasData && requests?.pagination && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                p: "24px",
                marginTop: "auto",
              }}
            >
              <Pagination
                count={requests.pagination.totalPages || 1}
                page={requests.pagination.currentPage || 1}
                onChange={(event, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
};

export default Requests;
