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
  CalendarToday,
  Person,
  LocalHospital,
  Assignment,
} from "@mui/icons-material";
import MobileFilterPanel from "../../components/MobileFilterPanel";
import { useGetAllLaborzettel } from "../../api/laborzettel/hooks";
import { Laborzettel, PopulatedLabRequest } from "../../api/laborzettel/types";
import { useGetOperations } from "../../api/operations/hooks";
import { useGetDoctors } from "../../api/doctors/hooks";
import { useGetLabTechnicians } from "../../api/lab-technicians/hooks";
import { useNavigate } from "react-router-dom";
import DateText from "../../components/atoms/DateText";
import ResponsiveTable, { ColumnDef } from "../../components/ResponsiveTable";

// Helper to get populated lab request data
const getLabRequest = (lz: Laborzettel): PopulatedLabRequest | null => {
  if (typeof lz.labRequest === "string") return null;
  return lz.labRequest as PopulatedLabRequest;
};

// Mobile card renderer for laborzettel
const LaborzettelMobileCard = ({
  laborzettel,
}: {
  laborzettel: Laborzettel;
}) => {
  const labRequest = getLabRequest(laborzettel);
  const request = labRequest?.request;
  const patient = request?.patient;
  const doctor = request?.doctor;

  // Split laborzettel number for display
  const lzNumber = laborzettel.laborzettelNumber || "";
  const lzParts = lzNumber.split("-");
  const lzPrefix = lzParts.slice(0, 2).join("-");
  const lzSuffix = lzParts.slice(2).join("-");

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
        <Box>
          <Typography
            variant="caption"
            sx={{ color: "rgba(100, 100, 100, 1)", display: "block" }}
          >
            {lzPrefix}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: "rgba(51, 51, 51, 1)" }}
          >
            {lzSuffix}
          </Typography>
        </Box>
        <Typography
          variant="body2"
          sx={{ color: "rgba(100, 100, 100, 1)", fontFamily: "monospace" }}
        >
          #{request?.requestNumber || "-"}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
        <Person sx={{ fontSize: 16, color: "rgba(146, 146, 146, 0.7)" }} />
        <Typography variant="body2" sx={{ color: "rgba(51, 51, 51, 1)" }}>
          {patient ? `${patient.firstName} ${patient.lastName}` : "-"}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
        <LocalHospital
          sx={{ fontSize: 16, color: "rgba(146, 146, 146, 0.7)" }}
        />
        <Typography variant="body2" sx={{ color: "rgba(100, 100, 100, 1)" }}>
          {doctor ? `${doctor.firstName} ${doctor.lastName}` : "-"}
        </Typography>
      </Box>
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
            <DateText date={request?.deliveryDate} />
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

const LaborzettelList = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [page, setPage] = useState(1);
  const [operationFilter, setOperationFilter] = useState<string>("all");
  const [doctorFilter, setDoctorFilter] = useState<string>("all");
  const [labTechnicianFilter, setLabTechnicianFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { data: operationsData } = useGetOperations({ limit: 100 });
  const { data: doctorsData } = useGetDoctors({ limit: 100 });
  const { data: labTechniciansData } = useGetLabTechnicians({ limit: 100 });

  const queryParams = {
    page,
    limit: 15,
    ...(operationFilter !== "all" && { operation: operationFilter }),
    ...(doctorFilter !== "all" && { doctor: doctorFilter }),
    ...(labTechnicianFilter !== "all" && {
      labTechnician: labTechnicianFilter,
    }),
    ...(searchTerm.trim() && { search: searchTerm.trim() }),
    sortBy,
    sortOrder,
  };

  const {
    data: laborzettelData,
    isLoading,
    error,
    refetch,
  } = useGetAllLaborzettel(queryParams);

  const handleOperationFilterChange = (event: SelectChangeEvent<string>) => {
    setOperationFilter(event.target.value);
    setPage(1);
  };
  const handleDoctorFilterChange = (event: SelectChangeEvent<string>) => {
    setDoctorFilter(event.target.value);
    setPage(1);
  };
  const handleLabTechnicianFilterChange = (
    event: SelectChangeEvent<string>,
  ) => {
    setLabTechnicianFilter(event.target.value);
    setPage(1);
  };
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };
  const handleSort = (property: string) => {
    const isAsc = sortBy === property && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortBy(property);
    setPage(1);
  };

  // Count active filters for mobile filter panel
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (operationFilter !== "all") count++;
    if (doctorFilter !== "all") count++;
    if (labTechnicianFilter !== "all") count++;
    return count;
  }, [operationFilter, doctorFilter, labTechnicianFilter]);

  // Clear all filters
  const handleClearFilters = () => {
    setOperationFilter("all");
    setDoctorFilter("all");
    setLabTechnicianFilter("all");
    setPage(1);
  };
  const handleRefresh = () => refetch();
  const handleRowClick = (laborzettel: Laborzettel) =>
    navigate(`/laborzettel/${laborzettel._id}`);

  const hasData = laborzettelData?.data && laborzettelData.data.length > 0;
  const mobileCardRenderer = (laborzettel: Laborzettel) => (
    <LaborzettelMobileCard laborzettel={laborzettel} />
  );

  const columns: ColumnDef<Laborzettel>[] = [
    {
      id: "laborzettelNumber",
      label: "Laborzettel Nr.",
      accessor: (lz) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Assignment sx={{ color: "rgba(104, 201, 242, 1)", fontSize: 18 }} />
          <Typography variant="body2" fontWeight={500}>
            {lz.laborzettelNumber ?? "-"}
          </Typography>
        </Box>
      ),
      sortable: true,
      width: 140,
    },
    {
      id: "requestNumber",
      label: "Auftrag Nr.",
      accessor: (lz) => {
        const labRequest = getLabRequest(lz);
        return labRequest?.request?.requestNumber || "-";
      },
      width: 120,
    },
    {
      id: "patient",
      label: "Patient",
      accessor: (lz) => {
        const labRequest = getLabRequest(lz);
        const patient = labRequest?.request?.patient;
        return patient ? (
          <Typography variant="body2">
            {patient.firstName} {patient.lastName}
            {patient.patientNumber && (
              <Typography
                component="span"
                variant="caption"
                sx={{ ml: 0.5, color: "text.secondary" }}
              >
                ({patient.patientNumber})
              </Typography>
            )}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            -
          </Typography>
        );
      },
      width: 180,
    },
    {
      id: "doctor",
      label: "Zahnarzt",
      accessor: (lz) => {
        const labRequest = getLabRequest(lz);
        const doctor = labRequest?.request?.doctor;
        return doctor ? `${doctor.firstName} ${doctor.lastName}` : "-";
      },
      width: 150,
    },
    {
      id: "labTechnician",
      label: "Labortechniker",
      accessor: (lz) => {
        const labRequest = getLabRequest(lz);
        if (labRequest?.assignedTechnicianName) {
          return labRequest.assignedTechnicianName;
        }
        const tech = labRequest?.assignedTechnician;
        return tech ? `${tech.firstName} ${tech.lastName}` : "-";
      },
      width: 150,
    },
    {
      id: "deliveryDate",
      label: "Liefertermin",
      accessor: (lz) => {
        const labRequest = getLabRequest(lz);
        return <DateText date={labRequest?.request?.deliveryDate} />;
      },
      width: 120,
    },
    {
      id: "createdAt",
      label: "Erstellt am",
      accessor: (lz) => <DateText date={lz.createdAt} showTime />,
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
        Laborzettel
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Fehler beim Laden der Laborzettel. Bitte versuchen Sie es erneut.
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
              placeholder="Laborzettel, Auftrag oder Patient suchen..."
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
                    {doctorsData?.data
                      ?.slice()
                      .sort((a, b) =>
                        a.lastName.localeCompare(b.lastName, "de"),
                      )
                      .map((doc) => (
                        <MenuItem key={doc._id} value={doc._id}>
                          {doc.firstName} {doc.lastName}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth>
                  <InputLabel id="mobile-tech-filter-label">
                    Labortechniker
                  </InputLabel>
                  <Select
                    labelId="mobile-tech-filter-label"
                    value={labTechnicianFilter}
                    onChange={handleLabTechnicianFilterChange}
                    label="Labortechniker"
                  >
                    <MenuItem value="all">Alle Labortechniker</MenuItem>
                    {labTechniciansData?.data
                      ?.slice()
                      .sort((a, b) =>
                        a.lastName.localeCompare(b.lastName, "de"),
                      )
                      .map((tech) => (
                        <MenuItem key={tech._id} value={tech._id}>
                          {tech.firstName} {tech.lastName}
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
                {doctorsData?.data
                  ?.slice()
                  .sort((a, b) => a.lastName.localeCompare(b.lastName, "de"))
                  .map((doc) => (
                    <MenuItem key={doc._id} value={doc._id}>
                      {doc.firstName} {doc.lastName}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <FormControl
              size="small"
              sx={{ minWidth: 150, display: { xs: "none", lg: "flex" } }}
            >
              <Select
                value={labTechnicianFilter}
                onChange={handleLabTechnicianFilterChange}
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
                <MenuItem value="all">Alle Labortechniker</MenuItem>
                {labTechniciansData?.data
                  ?.slice()
                  .sort((a, b) => a.lastName.localeCompare(b.lastName, "de"))
                  .map((tech) => (
                    <MenuItem key={tech._id} value={tech._id}>
                      {tech.firstName} {tech.lastName}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <IconButton onClick={handleRefresh} title="Aktualisieren">
              <Refresh />
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
            <ResponsiveTable<Laborzettel>
              data={laborzettelData?.data || []}
              columns={columns}
              mobileCardRenderer={mobileCardRenderer}
              onRowClick={handleRowClick}
              isLoading={isLoading}
              emptyMessage={
                searchTerm.trim()
                  ? `Keine Laborzettel für "${searchTerm}" gefunden`
                  : activeFilterCount > 0
                    ? "Keine Laborzettel mit diesen Filtern gefunden"
                    : "Keine Laborzettel vorhanden"
              }
              getItemId={(lz) => lz._id}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
          </Box>
          {hasData && laborzettelData?.pagination && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                p: { xs: "16px", sm: "24px" },
                pb: { xs: "80px", sm: "24px" },
                flexShrink: 0,
              }}
            >
              <Pagination
                count={laborzettelData.pagination.totalPages || 1}
                page={laborzettelData.pagination.currentPage || 1}
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

export default LaborzettelList;
