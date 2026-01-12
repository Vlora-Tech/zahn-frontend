import { useState, useCallback, useEffect } from "react";
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
  Chip,
  useTheme,
  useMediaQuery,
  Fab,
} from "@mui/material";
import {
  Search,
  Settings,
  Add,
  Print,
  Refresh,
  CalendarToday,
} from "@mui/icons-material";
import { debounce } from "lodash";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import { useNavigate } from "react-router-dom";
import { useGetPatients } from "../../api/patients/hooks";
import { useAuth } from "../../context/AuthContext";
import { isoDateToAge } from "../../utils/dateToAge";
import DateText from "../../components/atoms/DateText";
import ResponsiveTable, { ColumnDef } from "../../components/ResponsiveTable";
import { Patient } from "../../api/patients/types";

// Mobile card renderer for patients
const PatientMobileCard = ({ patient }: { patient: Patient }) => {
  const patientTypeLabel = patient.patientType === "gkv" ? "GKV" : "Privat";
  const patientTypeColor =
    patient.patientType === "gkv" ? "primary" : "secondary";

  return (
    <Box>
      {/* Patient name - primary info */}
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 600,
          color: "rgba(51, 51, 51, 1)",
          mb: 0.5,
        }}
      >
        {patient.firstName} {patient.lastName}
      </Typography>

      {/* Patient number */}
      <Typography
        variant="body2"
        sx={{
          color: "rgba(146, 146, 146, 1)",
          mb: 1.5,
        }}
      >
        Nr. {patient.patientNumber || "-"}
      </Typography>

      {/* Secondary info row */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
        }}
      >
        {/* Birthday with age */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <CalendarToday
            sx={{ fontSize: 16, color: "rgba(146, 146, 146, 0.7)" }}
          />
          <Typography variant="body2" sx={{ color: "rgba(100, 100, 100, 1)" }}>
            {patient.birthDate ? (
              <>
                <DateText date={patient.birthDate} /> (
                {isoDateToAge(patient.birthDate)} J.)
              </>
            ) : (
              "-"
            )}
          </Typography>
        </Box>

        {/* Patient type chip */}
        <Chip
          label={patientTypeLabel}
          size="small"
          color={patientTypeColor}
          sx={{
            height: 24,
            fontSize: "0.75rem",
            fontWeight: 500,
          }}
        />
      </Box>
    </Box>
  );
};

const PatientList = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState("createdAt");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const { user } = useAuth();

  const {
    data: patients,
    isLoading,
    error,
  } = useGetPatients({
    page,
    limit: 15,
    sortBy: orderBy,
    sortOrder: order,
    search,
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

  // Effect to trigger debounced search when searchInput changes
  useEffect(() => {
    debouncedSearch(searchInput);

    // Cleanup function to cancel pending debounced calls
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchInput, debouncedSearch]);

  const handleSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";

    setOrder(isAsc ? "desc" : "asc");

    setOrderBy(property);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const hasData = patients?.data && patients.data.length > 0;

  // Mobile card renderer for ResponsiveTable
  const mobileCardRenderer = (patient: Patient) => (
    <PatientMobileCard patient={patient} />
  );

  // Handle row click to navigate to patient details
  const handleRowClick = (patient: Patient) => {
    navigate(`/patients/${patient._id}`);
  };

  // Column definitions for ResponsiveTable
  const columns: ColumnDef<Patient>[] = [
    {
      id: "createdAt", // Sort by createdAt for natural order (ZC-1, ZC-2, ... ZC-10)
      label: "Patientennummer",
      accessor: (patient) => patient.patientNumber || "-",
      sortable: true,
      width: 150,
    },
    {
      id: "name",
      label: "Name",
      accessor: (patient) => `${patient.firstName} ${patient.lastName}`,
      sortable: true,
      width: 200,
    },
    {
      id: "patientType",
      label: "Patiententyp",
      accessor: (patient) => patient.patientType || "-",
      sortable: true,
      width: 120,
    },
    {
      id: "birthDate",
      label: "Geburtstag",
      accessor: (patient) =>
        patient.birthDate ? (
          <>
            <DateText date={patient.birthDate} /> (
            {isoDateToAge(patient.birthDate)} J.)
          </>
        ) : (
          "-"
        ),
      width: 180,
    },
  ];

  return (
    <Stack
      flex="1"
      gap="20px"
      height={"100%"}
      sx={{ overflow: "hidden", minWidth: 0 }}
    >
      <Typography
        variant="h2"
        sx={{
          color: "rgba(146, 146, 146, 1)",
        }}
      >
        Patienten
      </Typography>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Fehler beim Laden der Patienten. Bitte versuchen Sie es erneut.
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
          <TextField
            variant="outlined"
            size="small"
            placeholder="Name oder Patientennr. suchen..."
            value={searchInput}
            sx={{
              minWidth: { xs: "100%", sm: 250, md: 400 },
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
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              justifyContent: "flex-end",
              alignItems: "center",
              flexShrink: 0,
              flex: { xs: "none", sm: 1 },
            }}
          >
            <ButtonBlock
              startIcon={<Add />}
              sx={{
                borderRadius: "40px",
                textTransform: "none",
                background: "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
                color: "white",
                px: { xs: "16px", sm: "12px" },
                fontWeight: "500",
                fontSize: { xs: "14px", sm: "16px" },
                height: { xs: "44px", sm: "37px" },
                minHeight: "44px",
                marginRight: { xs: 0, md: "26px" },
              }}
              onClick={() => {
                navigate("/patients/create");
              }}
            >
              Patient hinzufügen
            </ButtonBlock>
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
            sx={{
              flex: 1,
              overflowX: "auto",
              overflowY: "auto",
              minWidth: 0,
            }}
          >
            <ResponsiveTable<Patient>
              data={patients?.data || []}
              columns={columns}
              mobileCardRenderer={mobileCardRenderer}
              onRowClick={handleRowClick}
              isLoading={isLoading}
              emptyMessage={
                search
                  ? "Keine Patienten gefunden"
                  : "Keine Patienten vorhanden. Fügen Sie einen neuen Patienten hinzu."
              }
              getItemId={(patient) => patient._id}
              sortBy={orderBy}
              sortOrder={order}
              onSort={handleSort}
            />
          </Box>
          {hasData && patients?.pagination && (
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
                count={patients.pagination.totalPages || 1}
                page={patients.pagination.currentPage || 1}
                onChange={(event, value) => setPage(value)}
                color="primary"
                size={isMobile ? "small" : "medium"}
              />
            </Box>
          )}
        </Box>
      </Paper>

      {/* Mobile: Floating Action Button with label */}
      {isMobile && (
        <Fab
          variant="extended"
          color="primary"
          aria-label="Patient hinzufügen"
          onClick={() => navigate("/patients/create")}
          sx={{
            position: "fixed",
            bottom: 80,
            right: 16,
            background: "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
            "&:hover": {
              background: "linear-gradient(90deg, #7AB02E 0%, #5BB8E0 100%)",
            },
            zIndex: 1000,
            gap: 1,
            color: "white",
          }}
        >
          <Add />
          Patient hinzufügen
        </Fab>
      )}
    </Stack>
  );
};

export default PatientList;
