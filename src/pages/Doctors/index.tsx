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
} from "@mui/material";
import {
  Search,
  Settings,
  Add,
  Print,
  Refresh,
  Visibility,
} from "@mui/icons-material";
import { debounce } from "lodash";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import { useGetDoctors } from "../../api/doctors/hooks";
import { useNavigate } from "react-router-dom";
import StyledLink from "../../components/atoms/StyledLink";
import TableRowsLoader from "../../components/molecules/TableRowsLoader";
import EmptyTableState from "../../components/molecules/EmptyTableState";

const Doctors = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState("name");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const navigate = useNavigate();

  const { data: doctors, isLoading, error } = useGetDoctors({ 
    page, 
    sortBy: orderBy, 
    sortOrder: order,
    search,
  });

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      setSearch(searchTerm);
      setPage(1); // Reset to first page when searching
    }, 500), // 500ms delay
    []
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
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value);
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  const hasData = doctors?.data && doctors.data.length > 0;

  return (
    <Stack flex="1" gap="20px" height={"100%"}>
      <Typography
        variant="h2"
        sx={{
          color: "rgba(146, 146, 146, 1)",
        }}
      >
        Ärzteliste
      </Typography>
      
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Fehler beim Laden der Ärzte. Bitte versuchen Sie es erneut.
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
          <TextField
            variant="outlined"
            size="small"
            placeholder="Suchen"
            value={searchInput}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Search />
                  </InputAdornment>
                ),
              },
            }}
            onChange={handleSearch}
          />
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
                navigate("/doctors/create");
              }}
            >
              Artz hinzufügen
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
                      Klinik
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
                    message={search ? "Keine Ärzte gefunden" : "Keine Ärzte vorhanden. Fügen Sie einen neuen Arzt hinzu."}
                  />
                ) : (
                  <>
                {doctors?.data?.map((doctor) => {
                  const isItemSelected = isSelected(doctor._id);
                  return (
                    <TableRow
                      key={doctor._id}
                      hover
                      onClick={() => handleClick(doctor._id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox checked={isItemSelected} />
                      </TableCell>
                      <TableCell>
                        {doctor?.firstName} {doctor?.lastName}
                      </TableCell>
                      <TableCell>{doctor?.clinic?.name || "-"}</TableCell>
                      <TableCell>{doctor?.username || "-"}</TableCell>
                      <TableCell>
                        <StyledLink to={`/doctors/${doctor._id}`}>
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
          {hasData && doctors?.pagination && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                p: "24px",
                marginTop: "auto",
              }}
            >
              <Pagination
                count={doctors.pagination.totalPages || 1}
                page={doctors.pagination.currentPage || 1}
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

export default Doctors;
