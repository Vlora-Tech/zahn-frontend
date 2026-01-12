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
  Phone,
  LocationOn,
} from "@mui/icons-material";
import { debounce } from "lodash";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import { useGetClinics } from "../../api/clinics/hooks";
import { useNavigate } from "react-router-dom";
import ResponsiveTable, { ColumnDef } from "../../components/ResponsiveTable";
import { Clinic } from "../../api/clinics/types";

// Mobile card renderer for clinics
const ClinicMobileCard = ({ clinic }: { clinic: Clinic }) => {
  return (
    <Box>
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 600,
          color: "rgba(51, 51, 51, 1)",
          mb: 0.5,
        }}
      >
        {clinic.name}
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
          <LocationOn
            sx={{ fontSize: 16, color: "rgba(146, 146, 146, 0.7)" }}
          />
          <Typography variant="body2" sx={{ color: "rgba(100, 100, 100, 1)" }}>
            {clinic.city || "-"}, {clinic.postalCode || "-"}
          </Typography>
        </Box>

        {clinic.phoneNumber && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Phone sx={{ fontSize: 16, color: "rgba(146, 146, 146, 0.7)" }} />
            <Typography
              variant="body2"
              sx={{ color: "rgba(100, 100, 100, 1)" }}
            >
              {clinic.phoneNumber}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

const Clinics = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState("name");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const {
    data: clinics,
    isLoading,
    error,
  } = useGetClinics({
    page,
    limit: 15,
    sortBy: orderBy,
    sortOrder: order,
    search,
  });

  // Debounced search function
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

  const handleRowClick = (clinic: Clinic) => {
    navigate(`/clinics/${clinic._id}`);
  };

  const hasData = clinics?.data && clinics.data.length > 0;

  const mobileCardRenderer = (clinic: Clinic) => (
    <ClinicMobileCard clinic={clinic} />
  );

  const columns: ColumnDef<Clinic>[] = [
    {
      id: "name",
      label: "Klinikname",
      accessor: (clinic) => clinic.name || "-",
      sortable: true,
      width: 200,
    },
    {
      id: "city",
      label: "Stadt",
      accessor: (clinic) => clinic.city || "-",
      sortable: true,
      width: 150,
    },
    {
      id: "address",
      label: "Adresse",
      accessor: (clinic) =>
        clinic.street && clinic.buildingNo
          ? `${clinic.street}, ${clinic.buildingNo}`
          : "-",
      width: 200,
    },
    {
      id: "postalCode",
      label: "Postleitzahl",
      accessor: (clinic) => clinic.postalCode || "-",
      sortable: true,
      width: 120,
    },
    {
      id: "phoneNumber",
      label: "Telefonnummer",
      accessor: (clinic) => clinic.phoneNumber || "-",
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
      <Typography
        variant="h2"
        sx={{
          color: "rgba(146, 146, 146, 1)",
        }}
      >
        Kliniken
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Fehler beim Laden der Kliniken. Bitte versuchen Sie es erneut.
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
            placeholder="Name, Stadt oder PLZ suchen..."
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
                navigate("/clinics/create");
              }}
            >
              Klinik hinzufügen
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
            <ResponsiveTable<Clinic>
              data={clinics?.data || []}
              columns={columns}
              mobileCardRenderer={mobileCardRenderer}
              onRowClick={handleRowClick}
              isLoading={isLoading}
              emptyMessage={
                search
                  ? "Keine Kliniken gefunden"
                  : "Keine Kliniken vorhanden. Fügen Sie eine neue Klinik hinzu."
              }
              getItemId={(clinic) => clinic._id}
              sortBy={orderBy}
              sortOrder={order}
              onSort={handleSort}
            />
          </Box>
          {hasData && clinics?.pagination && (
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
                count={clinics.pagination.totalPages || 1}
                page={clinics.pagination.currentPage || 1}
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
          aria-label="Klinik hinzufügen"
          onClick={() => navigate("/clinics/create")}
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
          Klinik hinzufügen
        </Fab>
      )}
    </Stack>
  );
};

export default Clinics;
