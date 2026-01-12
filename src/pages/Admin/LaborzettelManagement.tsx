import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Chip,
  InputAdornment,
  Pagination,
  Alert,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Delete,
  Search,
  Print,
  Refresh,
  Settings,
  Visibility,
  Assignment,
  ArrowBack,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  useGetAllLaborzettel,
  useDeleteLaborzettel,
} from "../../api/laborzettel/hooks";
import { useQueryClient } from "@tanstack/react-query";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import DateText from "../../components/atoms/DateText";
import ResponsiveTable, { ColumnDef } from "../../components/ResponsiveTable";

interface LaborzettelWithDetails {
  _id: string;
  laborzettelNumber: string;
  lotNr: string;
  sections?: Array<{
    section: string;
    items: Array<{ number: string; name: string; menge: string }>;
  }>;
  createdAt: string;
  updatedAt: string;
  labRequest?: {
    _id: string;
    labRequestNumber?: string;
    request?: {
      requestNumber?: string;
      patient?: {
        firstName: string;
        lastName: string;
        patientNumber?: string;
      };
      clinic?: {
        name: string;
      };
    };
  };
}

interface LaborzettelApiResponse {
  data: LaborzettelWithDetails[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Mobile card renderer for laborzettel
const LaborzettelMobileCard = ({
  laborzettel,
  onView,
  onDelete,
}: {
  laborzettel: LaborzettelWithDetails;
  onView: (laborzettel: LaborzettelWithDetails) => void;
  onDelete: (laborzettel: LaborzettelWithDetails) => void;
}) => {
  const patient = laborzettel.labRequest?.request?.patient;
  const clinic = laborzettel.labRequest?.request?.clinic;

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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Assignment sx={{ color: "rgba(104, 201, 242, 1)", fontSize: 20 }} />
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: "rgba(51, 51, 51, 1)" }}
          >
            {laborzettel.laborzettelNumber}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onView(laborzettel);
            }}
            sx={{ color: "rgba(104, 201, 242, 1)" }}
          >
            <Visibility fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(laborzettel);
            }}
            sx={{ color: "#d32f2f" }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      {patient && (
        <Typography
          variant="body2"
          sx={{ color: "rgba(100, 100, 100, 1)", mb: 0.5 }}
        >
          Patient: {patient.firstName} {patient.lastName}
          {patient.patientNumber && ` (${patient.patientNumber})`}
        </Typography>
      )}
      {clinic && (
        <Typography
          variant="body2"
          sx={{ color: "rgba(100, 100, 100, 1)", mb: 0.5 }}
        >
          Klinik: {clinic.name}
        </Typography>
      )}
      <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
        <Chip
          label={`Lot: ${laborzettel.lotNr}`}
          size="small"
          sx={{
            backgroundColor: "#e8f5e9",
            color: "#2e7d32",
            fontSize: "11px",
          }}
        />
        <Chip
          label={`${laborzettel.sections?.length || 0} Abschnitte`}
          size="small"
          variant="outlined"
          sx={{ fontSize: "11px" }}
        />
      </Box>
      <Typography
        variant="caption"
        sx={{ color: "rgba(146, 146, 146, 1)", display: "block", mt: 1 }}
      >
        Erstellt: <DateText date={laborzettel.createdAt} />
      </Typography>
    </Box>
  );
};

const LaborzettelManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [laborzettelToDelete, setLaborzettelToDelete] =
    useState<LaborzettelWithDetails | null>(null);
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState<string>("createdAt");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const {
    data: laborzettelResponse,
    isLoading,
    refetch,
  } = useGetAllLaborzettel({
    page,
    limit: 15,
    sortBy: orderBy,
    sortOrder: order,
  });
  const deleteMutation = useDeleteLaborzettel();

  const typedResponse =
    laborzettelResponse as unknown as LaborzettelApiResponse;
  const laborzettelList = useMemo(
    () => typedResponse?.data || [],
    [typedResponse?.data],
  );
  const pagination = typedResponse?.pagination;

  // Filter laborzettel by search term (client-side)
  const filteredLaborzettel = useMemo(() => {
    if (!searchTerm.trim()) return laborzettelList;
    const term = searchTerm.toLowerCase();
    return laborzettelList.filter(
      (lz) =>
        lz.laborzettelNumber?.toLowerCase().includes(term) ||
        lz.lotNr?.toLowerCase().includes(term) ||
        lz.labRequest?.request?.patient?.firstName
          ?.toLowerCase()
          .includes(term) ||
        lz.labRequest?.request?.patient?.lastName
          ?.toLowerCase()
          .includes(term) ||
        lz.labRequest?.request?.clinic?.name?.toLowerCase().includes(term),
    );
  }, [laborzettelList, searchTerm]);

  const handleView = (laborzettel: LaborzettelWithDetails) => {
    // Navigate to the laborzettel form view
    if (laborzettel.labRequest?._id) {
      navigate(`/lab/${laborzettel.labRequest._id}/laborzettel`);
    }
  };

  const handleDeleteClick = (laborzettel: LaborzettelWithDetails) => {
    setLaborzettelToDelete(laborzettel);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (laborzettelToDelete) {
      try {
        await deleteMutation.mutateAsync(laborzettelToDelete._id);
        queryClient.invalidateQueries({ queryKey: ["laborzettel"] });
        setDeleteConfirmOpen(false);
        setLaborzettelToDelete(null);
      } catch {
        setError("Fehler beim Löschen des Laborzettels.");
      }
    }
  };

  const handleSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const mobileCardRenderer = (laborzettel: LaborzettelWithDetails) => (
    <LaborzettelMobileCard
      laborzettel={laborzettel}
      onView={handleView}
      onDelete={handleDeleteClick}
    />
  );

  const columns: ColumnDef<LaborzettelWithDetails>[] = [
    {
      id: "laborzettelNumber",
      label: "Laborzettel-Nr.",
      accessor: (lz) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Assignment sx={{ color: "rgba(104, 201, 242, 1)", fontSize: 18 }} />
          <Typography variant="body2" fontWeight={500}>
            {lz.laborzettelNumber}
          </Typography>
        </Box>
      ),
      sortable: true,
      width: 180,
    },
    {
      id: "patient",
      label: "Patient",
      accessor: (lz) => {
        const patient = lz.labRequest?.request?.patient;
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
      id: "clinic",
      label: "Klinik",
      accessor: (lz) => (
        <Typography variant="body2" color="text.secondary">
          {lz.labRequest?.request?.clinic?.name || "-"}
        </Typography>
      ),
      width: 150,
    },
    {
      id: "lotNr",
      label: "Lot-Nr.",
      accessor: (lz) => (
        <Chip
          label={lz.lotNr}
          size="small"
          sx={{
            backgroundColor: "#e8f5e9",
            color: "#2e7d32",
            fontSize: "12px",
          }}
        />
      ),
      width: 120,
    },
    {
      id: "sections",
      label: "Abschnitte",
      accessor: (lz) => (
        <Typography variant="body2" color="text.secondary">
          {lz.sections?.length || 0}
        </Typography>
      ),
      width: 100,
    },
    {
      id: "createdAt",
      label: "Erstellt am",
      accessor: (lz) => <DateText date={lz.createdAt} />,
      sortable: true,
      width: 130,
    },
    {
      id: "actions",
      label: "",
      accessor: (lz) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleView(lz);
            }}
            sx={{ color: "rgba(104, 201, 242, 1)" }}
            title="Anzeigen"
          >
            <Visibility fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(lz);
            }}
            sx={{ color: "#d32f2f" }}
            title="Löschen"
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
      width: 100,
    },
  ];

  const hasData = filteredLaborzettel.length > 0;

  return (
    <Stack
      flex="1"
      gap="20px"
      height="100%"
      sx={{ overflow: "hidden", minWidth: 0 }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <IconButton
          onClick={() => navigate("/admin")}
          sx={{ color: "rgba(146, 146, 146, 1)" }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h2" sx={{ color: "rgba(146, 146, 146, 1)" }}>
          Laborzettel-Vorlagen
        </Typography>
      </Stack>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
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
              placeholder="Laborzettel suchen..."
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
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              flexShrink: 0,
              flex: { xs: "none", sm: 1 },
            }}
          >
            <Box sx={{ display: { xs: "none", md: "flex" } }}>
              <IconButton>
                <Print />
              </IconButton>
              <IconButton onClick={() => refetch()} title="Aktualisieren">
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
            <ResponsiveTable<LaborzettelWithDetails>
              data={filteredLaborzettel}
              columns={columns}
              mobileCardRenderer={mobileCardRenderer}
              isLoading={isLoading}
              emptyMessage={
                searchTerm
                  ? "Keine Laborzettel gefunden"
                  : "Keine Laborzettel vorhanden."
              }
              getItemId={(lz) => lz._id}
              sortBy={orderBy}
              sortOrder={order}
              onSort={handleSort}
            />
          </Box>
          {hasData && pagination && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                p: { xs: "16px", sm: "24px" },
                flexShrink: 0,
              }}
            >
              <Pagination
                count={pagination.totalPages || 1}
                page={pagination.currentPage || 1}
                onChange={(_, value) => setPage(value)}
                color="primary"
                size={isMobile ? "small" : "medium"}
              />
            </Box>
          )}
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Löschen bestätigen</DialogTitle>
        <DialogContent>
          <Typography>
            Sind Sie sicher, dass Sie den Laborzettel "
            {laborzettelToDelete?.laborzettelNumber}" löschen möchten? Diese
            Aktion kann nicht rückgängig gemacht werden.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <ButtonBlock
            onClick={() => setDeleteConfirmOpen(false)}
            style={{
              borderRadius: "40px",
              height: "40px",
              color: "rgba(107, 107, 107, 1)",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Abbrechen
          </ButtonBlock>
          <ButtonBlock
            onClick={handleDeleteConfirm}
            disabled={deleteMutation.isPending}
            style={{
              background: "rgba(247, 107, 107, 1)",
              borderRadius: "40px",
              height: "40px",
              color: "white",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            {deleteMutation.isPending ? "Löschen..." : "Löschen"}
          </ButtonBlock>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default LaborzettelManagement;
