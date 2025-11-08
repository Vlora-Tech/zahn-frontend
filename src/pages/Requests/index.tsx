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
  Pagination,
  Stack,
  TableSortLabel,
  Alert,
} from "@mui/material";
import {
  Search,
  Settings,
  Print,
  Refresh,
  Visibility,
} from "@mui/icons-material";
import { debounce } from "lodash";
import { useGetTreatmentRequests } from "../../api/treatment-requests/hooks";
import StyledLink from "../../components/atoms/StyledLink";
import TableRowsLoader from "../../components/molecules/TableRowsLoader";
import EmptyTableState from "../../components/molecules/EmptyTableState";
import { useAuth } from "../../context/AuthContext";

const Requests = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { user } = useAuth();

  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState("_id");

  const { data: requests, isLoading: isRequestsLoading, error: requestsError } =
    useGetTreatmentRequests({
      page,
      search,
      sortBy: orderBy,
      sortOrder: order,
      ...(user?.role === "doctor" ? { doctor: user?.id } : {}),
      ...(user?.role === "nurse" ? { clinic: user?.clinic?._id } : {}),
    });

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      setSearch(searchTerm);
      setPage(1); // Reset to first page when searching
    }, 500), // 500ms delay
    []
  );

  const handleSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";

    setOrder(isAsc ? "desc" : "asc");

    setOrderBy(property);
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
        selected.slice(selectedIndex + 1)
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
        Auftragensliste
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
                    active={orderBy === "_id"}
                    direction={orderBy === "_id" ? order : "asc"}
                    onClick={() => handleSort("_id")}
                  >
                    Id
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
                    active={orderBy === "patientNumber"}
                    direction={orderBy === "patientNumber" ? order : "asc"}
                    onClick={() => handleSort("patientNumber")}
                  >
                    Patientennummer
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
                {/* <TableCell>Erstellt von</TableCell> */}
                <TableCell></TableCell>
              </TableHead>
              <TableBody>
                {isRequestsLoading ? (
                  <TableRowsLoader rowsNum={10} colNums={7} />
                ) : !hasData ? (
                  <EmptyTableState 
                    colSpan={7} 
                    message={search ? "Keine Aufträge gefunden" : "Keine Aufträge vorhanden. Erstellen Sie einen neuen Auftrag."}
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
                          <TableCell>{request?._id || "-"}</TableCell>
                          <TableCell>
                            {request?.deliveryDate 
                              ? new Date(request.deliveryDate).toLocaleDateString("de-DE")
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {request?.patient?.patientNumber || "-"}
                          </TableCell>
                          <TableCell>
                            {request?.patient?.firstName && request?.patient?.lastName
                              ? `${request.patient.firstName} ${request.patient.lastName}`
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {request?.doctor?.firstName && request?.doctor?.lastName
                              ? `${request.doctor.firstName} ${request.doctor.lastName}`
                              : "-"}
                          </TableCell>
                          <TableCell>{request?.status || "-"}</TableCell>
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
