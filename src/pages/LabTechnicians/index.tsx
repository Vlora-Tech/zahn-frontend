import { useState, useCallback, useEffect } from "react";
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
  TableSortLabel,
  Pagination,
  Stack,
  Alert,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import {
  Search,
  Settings,
  Add,
  Print,
  Refresh,
  Visibility,
  FilterAlt,
} from "@mui/icons-material";
import { debounce } from "lodash";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import { useGetLabTechnicians } from "../../api/lab-technicians/hooks";
import { useGetClinics } from "../../api/clinics/hooks";
import { useNavigate } from "react-router-dom";
import StyledLink from "../../components/atoms/StyledLink";
import TableRowsLoader from "../../components/molecules/TableRowsLoader";
import EmptyTableState from "../../components/molecules/EmptyTableState";

const LabTechnicians = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState("name");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [clinicFilter, setClinicFilter] = useState<string>("all");

  const navigate = useNavigate();

  const { data: clinics } = useGetClinics({ limit: 100 });

  const {
    data: labTechnicians,
    isLoading,
    error,
  } = useGetLabTechnicians({
    page,
    sortBy: orderBy,
    sortOrder: order,
    search,
    ...(clinicFilter !== "all" && { clinic: clinicFilter }),
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

  const handleClinicFilterChange = (event: SelectChangeEvent<string>) => {
    setClinicFilter(event.target.value);
    setPage(1);
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  const hasData = labTechnicians?.data && labTechnicians.data.length > 0;

  return (
    <Stack flex="1" gap="20px" height={"100%"}>
      <Typography
        variant="h2"
        sx={{
          color: "rgba(146, 146, 146, 1)",
        }}
      >
        Labortechniker
      </Typography>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Fehler beim Laden der Labortechniker. Bitte versuchen Sie es erneut.
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
              placeholder="Name oder Pflegefachkraftname suchen..."
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
          <Box>
            <ButtonBlock
              startIcon={<Add />}
              sx={{
                borderRadius: "40px",
                textTransform: "none",
                background: "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
                color: "white",
                px: "12px",
                fontWeight: "500",
                fontSize: "16px",
                height: "37px",
                marginRight: "26px",
              }}
              onClick={() => {
                navigate("/lab-technicians/create");
              }}
            >
              Labortechniker hinzufügen
            </ButtonBlock>
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
              <TableHead sx={{ backgroundColor: "rgba(232, 232, 232, 1)" }}>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "name"}
                      direction={orderBy === "name" ? order : "asc"}
                      onClick={() => handleSort("name")}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "clinic.name"}
                      direction={orderBy === "clinic.name" ? order : "asc"}
                      onClick={() => handleSort("clinic.name")}
                    >
                      Labor
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRowsLoader rowsNum={10} colNums={5} />
                ) : !hasData ? (
                  <EmptyTableState
                    colSpan={5}
                    message={
                      search
                        ? "Keine Labortechniker gefunden"
                        : "Keine Labortechniker vorhanden. Fügen Sie einen neuen Labortechniker hinzu."
                    }
                  />
                ) : (
                  <>
                    {labTechnicians?.data?.map((technician) => {
                      const isItemSelected = isSelected(technician._id);
                      return (
                        <TableRow
                          key={technician._id}
                          hover
                          onClick={() => handleClick(technician._id)}
                          role="checkbox"
                          aria-checked={isItemSelected}
                          tabIndex={-1}
                          selected={isItemSelected}
                        >
                          <TableCell padding="checkbox">
                            <Checkbox checked={isItemSelected} />
                          </TableCell>
                          <TableCell>
                            {technician?.firstName} {technician?.lastName}
                          </TableCell>
                          <TableCell>
                            {technician?.clinic?.name || "-"}
                          </TableCell>
                          <TableCell>{technician?.username || "-"}</TableCell>
                          <TableCell>
                            <StyledLink
                              to={`/lab-technicians/${technician._id}`}
                            >
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
          {hasData && labTechnicians?.pagination && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                p: "24px",
                marginTop: "auto",
              }}
            >
              <Pagination
                count={labTechnicians.pagination.totalPages || 1}
                page={labTechnicians.pagination.currentPage || 1}
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

export default LabTechnicians;
