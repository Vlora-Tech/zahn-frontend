import { useState, useCallback, useEffect, useMemo } from "react";
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
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  useTheme,
  useMediaQuery,
  InputLabel,
  Fab,
} from "@mui/material";
import {
  Search,
  Settings,
  Add,
  Print,
  Refresh,
  FilterAlt,
  Business,
} from "@mui/icons-material";
import { debounce } from "lodash";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import { useGetLabTechnicians } from "../../api/lab-technicians/hooks";
import { useGetClinics } from "../../api/clinics/hooks";
import { useNavigate } from "react-router-dom";
import ResponsiveTable, { ColumnDef } from "../../components/ResponsiveTable";
import { LabTechnician } from "../../api/lab-technicians/types";
import MobileFilterPanel from "../../components/MobileFilterPanel";

// Mobile card renderer for lab technicians
const LabTechnicianMobileCard = ({
  technician,
}: {
  technician: LabTechnician;
}) => {
  return (
    <Box>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 600, color: "rgba(51, 51, 51, 1)", mb: 0.5 }}
      >
        {technician.firstName} {technician.lastName}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "rgba(146, 146, 146, 1)", mb: 1 }}
      >
        @{technician.username || "-"}
      </Typography>
      {technician.clinic?.name && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Business sx={{ fontSize: 16, color: "rgba(146, 146, 146, 0.7)" }} />
          <Typography variant="body2" sx={{ color: "rgba(100, 100, 100, 1)" }}>
            {technician.clinic.name}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

const LabTechnicians = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState("name");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [clinicFilter, setClinicFilter] = useState<string>("all");

  const { data: clinics } = useGetClinics({ limit: 100 });

  const {
    data: labTechnicians,
    isLoading,
    error,
  } = useGetLabTechnicians({
    page,
    limit: 15,
    sortBy: orderBy,
    sortOrder: order,
    search,
    ...(clinicFilter !== "all" && { clinic: clinicFilter }),
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

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const handleClinicFilterChange = (event: SelectChangeEvent<string>) => {
    setClinicFilter(event.target.value);
    setPage(1);
  };

  // Count active filters for mobile filter panel
  const activeFilterCount = useMemo(() => {
    return clinicFilter !== "all" ? 1 : 0;
  }, [clinicFilter]);

  // Clear all filters
  const handleClearFilters = () => {
    setClinicFilter("all");
    setPage(1);
  };

  const handleRowClick = (technician: LabTechnician) => {
    navigate(`/lab-technicians/${technician._id}`);
  };

  const hasData = labTechnicians?.data && labTechnicians.data.length > 0;

  const mobileCardRenderer = (technician: LabTechnician) => (
    <LabTechnicianMobileCard technician={technician} />
  );

  const columns: ColumnDef<LabTechnician>[] = [
    {
      id: "name",
      label: "Name",
      accessor: (t) => `${t.firstName} ${t.lastName}`,
      sortable: true,
      width: 200,
    },
    {
      id: "clinic.name",
      label: "Labor",
      accessor: (t) => t.clinic?.name || "-",
      sortable: true,
      width: 200,
    },
    {
      id: "username",
      label: "Username",
      accessor: (t) => t.username || "-",
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
        Labortechniker
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Fehler beim Laden der Labortechniker. Bitte versuchen Sie es erneut.
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
              placeholder="Name oder Username suchen..."
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
                  <InputLabel id="mobile-clinic-filter-label">
                    Praxis
                  </InputLabel>
                  <Select
                    labelId="mobile-clinic-filter-label"
                    value={clinicFilter}
                    onChange={handleClinicFilterChange}
                    label="Praxis"
                  >
                    <MenuItem value="all">Alle Praxen</MenuItem>
                    {clinics?.data?.map((clinic) => (
                      <MenuItem key={clinic._id} value={clinic._id}>
                        {clinic.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </MobileFilterPanel>
            )}

            {/* Desktop/Tablet Filter Controls */}
            <FormControl
              size="small"
              sx={{
                minWidth: { xs: "100%", sm: 150 },
                display: { xs: "none", sm: "flex" },
              }}
            >
              <Select
                value={clinicFilter}
                onChange={handleClinicFilterChange}
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
                <MenuItem value="all">Alle Praxen</MenuItem>
                {clinics?.data?.map((clinic) => (
                  <MenuItem key={clinic._id} value={clinic._id}>
                    {clinic.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box
            sx={{
              display: { xs: "none", sm: "flex" },
              justifyContent: "flex-end",
              alignItems: "center",
              flexShrink: 0,
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
              onClick={() => navigate("/lab-technicians/create")}
            >
              Labortechniker hinzufügen
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
            sx={{ flex: 1, overflowX: "auto", overflowY: "auto", minWidth: 0 }}
          >
            <ResponsiveTable<LabTechnician>
              data={labTechnicians?.data || []}
              columns={columns}
              mobileCardRenderer={mobileCardRenderer}
              onRowClick={handleRowClick}
              isLoading={isLoading}
              emptyMessage={
                search
                  ? "Keine Labortechniker gefunden"
                  : "Keine Labortechniker vorhanden. Fügen Sie einen neuen Labortechniker hinzu."
              }
              getItemId={(t) => t._id}
              sortBy={orderBy}
              sortOrder={order}
              onSort={handleSort}
            />
          </Box>
          {hasData && labTechnicians?.pagination && (
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
                count={labTechnicians.pagination.totalPages || 1}
                page={labTechnicians.pagination.currentPage || 1}
                onChange={(_, value) => setPage(value)}
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
          aria-label="Labortechniker hinzufügen"
          onClick={() => navigate("/lab-technicians/create")}
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
          Labortechniker hinzufügen
        </Fab>
      )}
    </Stack>
  );
};

export default LabTechnicians;
