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
  InputAdornment,
  Pagination,
  useTheme,
  useMediaQuery,
  Fab,
  Grid,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Search,
  Print,
  Refresh,
  Settings,
  ArrowBack,
} from "@mui/icons-material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
  useGetProcedures,
  useCreateProcedure,
  useUpdateProcedure,
  useDeleteProcedure,
} from "../../api/procedures/hooks";
import { Procedure } from "../../api/procedures/types";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import ResponsiveTable, { ColumnDef } from "../../components/ResponsiveTable";

const validationSchema = Yup.object({
  number: Yup.string().required("Nummer ist erforderlich"),
  name: Yup.string().required("Name ist erforderlich"),
  price: Yup.number()
    .min(0, "Preis muss positiv sein")
    .required("Preis ist erforderlich"),
});

// Mobile card renderer for procedures
const ProcedureMobileCard = ({
  procedure,
  onEdit,
  onDelete,
}: {
  procedure: Procedure;
  onEdit: (procedure: Procedure) => void;
  onDelete: (procedure: Procedure) => void;
}) => {
  return (
    <Box sx={{ p: 2 }}>
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
            sx={{ color: "rgba(146, 146, 146, 1)" }}
          >
            {procedure.number}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: "rgba(51, 51, 51, 1)" }}
          >
            {procedure.name}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(procedure);
            }}
            sx={{ color: "rgba(104, 201, 242, 1)" }}
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(procedure);
            }}
            sx={{ color: "#d32f2f" }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <Typography
        variant="body1"
        sx={{ color: "rgba(51, 51, 51, 1)", fontWeight: 500 }}
      >
        {procedure.price.toLocaleString("de-DE", {
          style: "currency",
          currency: "EUR",
        })}
      </Typography>
    </Box>
  );
};

const ProceduresManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProcedure, setEditingProcedure] = useState<Procedure | null>(
    null,
  );
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [procedureToDelete, setProcedureToDelete] = useState<Procedure | null>(
    null,
  );
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<string>("number");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();
  const {
    data: proceduresResponse,
    isLoading,
    refetch,
  } = useGetProcedures({
    page,
    limit: 15,
    sortBy: orderBy,
    sortOrder: order,
  });
  const createMutation = useCreateProcedure();
  const updateMutation = useUpdateProcedure();
  const deleteMutation = useDeleteProcedure();

  const procedures = useMemo(
    () => proceduresResponse?.data || [],
    [proceduresResponse?.data],
  );
  const pagination = proceduresResponse?.pagination;

  // Filter procedures by search term (client-side)
  const filteredProcedures = useMemo(() => {
    if (!searchTerm.trim()) return procedures;
    const term = searchTerm.toLowerCase();
    return procedures.filter(
      (proc) =>
        proc.name.toLowerCase().includes(term) ||
        proc.number.toLowerCase().includes(term),
    );
  }, [procedures, searchTerm]);

  const handleOpenDialog = (procedure?: Procedure) => {
    setEditingProcedure(procedure || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProcedure(null);
  };

  const handleSubmit = async (values: {
    number: string;
    name: string;
    price: number;
  }) => {
    try {
      if (editingProcedure) {
        await updateMutation.mutateAsync({
          procedureId: editingProcedure._id,
          data: values,
        });
      } else {
        await createMutation.mutateAsync(values);
      }

      queryClient.invalidateQueries({ queryKey: ["procedures"] });
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving procedure:", error);
      alert(
        "Fehler beim Speichern: " +
          (error instanceof Error ? error.message : "Unbekannter Fehler"),
      );
    }
  };

  const handleDeleteClick = (procedure: Procedure) => {
    setProcedureToDelete(procedure);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (procedureToDelete) {
      try {
        await deleteMutation.mutateAsync(procedureToDelete._id);
        queryClient.invalidateQueries({ queryKey: ["procedures"] });
        setDeleteConfirmOpen(false);
        setProcedureToDelete(null);
      } catch (error) {
        console.error("Error deleting procedure:", error);
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

  const mobileCardRenderer = (procedure: Procedure) => (
    <ProcedureMobileCard
      procedure={procedure}
      onEdit={handleOpenDialog}
      onDelete={handleDeleteClick}
    />
  );

  const columns: ColumnDef<Procedure>[] = [
    {
      id: "number",
      label: "Nummer",
      accessor: (proc) => (
        <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
          {proc.number}
        </Typography>
      ),
      sortable: true,
      width: 120,
    },
    {
      id: "name",
      label: "Name",
      accessor: (proc) => (
        <Typography variant="body2" fontWeight={500}>
          {proc.name}
        </Typography>
      ),
      sortable: true,
      width: 300,
    },
    {
      id: "price",
      label: "Preis",
      accessor: (proc) => (
        <Typography variant="body2">
          {proc.price.toLocaleString("de-DE", {
            style: "currency",
            currency: "EUR",
          })}
        </Typography>
      ),
      sortable: true,
      width: 120,
    },
    {
      id: "actions",
      label: "",
      accessor: (proc) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDialog(proc);
            }}
            sx={{ color: "rgba(104, 201, 242, 1)" }}
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(proc);
            }}
            sx={{ color: "#d32f2f" }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      ),
      width: 100,
    },
  ];

  const initialValues = {
    number: editingProcedure?.number || "",
    name: editingProcedure?.name || "",
    price: editingProcedure?.price ?? "",
  };

  const hasData = filteredProcedures.length > 0;

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
          Leistungen
        </Typography>
      </Stack>

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
              placeholder="Leistung suchen..."
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
              onClick={() => handleOpenDialog()}
            >
              Leistung hinzufügen
            </ButtonBlock>
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
            <ResponsiveTable<Procedure>
              data={filteredProcedures}
              columns={columns}
              mobileCardRenderer={mobileCardRenderer}
              isLoading={isLoading}
              emptyMessage={
                searchTerm
                  ? "Keine Leistungen gefunden"
                  : "Keine Leistungen vorhanden. Fügen Sie eine neue Leistung hinzu."
              }
              getItemId={(proc) => proc._id}
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
                pb: { xs: "80px", sm: "24px" },
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

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editingProcedure ? "Leistung bearbeiten" : "Neue Leistung"}
        </DialogTitle>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            isSubmitting,
          }) => (
            <Form>
              <DialogContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      name="number"
                      label="Nummer"
                      value={values.number}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.number && Boolean(errors.number)}
                      helperText={touched.number && errors.number}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      name="price"
                      label="Preis (€)"
                      type="number"
                      value={values.price}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.price && Boolean(errors.price)}
                      helperText={touched.price && errors.price}
                      slotProps={{
                        input: {
                          inputProps: { min: 0, step: 0.01 },
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      name="name"
                      label="Name"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions
                sx={{
                  p: 2,
                  flexDirection: { xs: "column", sm: "row" },
                  gap: { xs: 1, sm: 0 },
                }}
              >
                <ButtonBlock
                  onClick={handleCloseDialog}
                  style={{
                    borderRadius: "40px",
                    height: "44px",
                    color: "rgba(107, 107, 107, 1)",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                  sx={{
                    width: { xs: "100%", sm: "auto" },
                    order: { xs: 2, sm: 1 },
                  }}
                >
                  Abbrechen
                </ButtonBlock>
                <ButtonBlock
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background:
                      "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
                    borderRadius: "40px",
                    height: "44px",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                  sx={{
                    width: { xs: "100%", sm: "auto" },
                    order: { xs: 1, sm: 2 },
                  }}
                >
                  {isSubmitting ? "Speichern..." : "Speichern"}
                </ButtonBlock>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Löschen bestätigen</DialogTitle>
        <DialogContent>
          <Typography>
            Sind Sie sicher, dass Sie die Leistung "{procedureToDelete?.name}"
            löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            p: 2,
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 0 },
          }}
        >
          <ButtonBlock
            onClick={() => setDeleteConfirmOpen(false)}
            style={{
              borderRadius: "40px",
              height: "44px",
              color: "rgba(107, 107, 107, 1)",
              fontSize: "14px",
              fontWeight: "500",
            }}
            sx={{
              width: { xs: "100%", sm: "auto" },
              order: { xs: 2, sm: 1 },
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
              height: "44px",
              color: "white",
              fontSize: "14px",
              fontWeight: "500",
            }}
            sx={{
              width: { xs: "100%", sm: "auto" },
              order: { xs: 1, sm: 2 },
            }}
          >
            {deleteMutation.isPending ? "Löschen..." : "Löschen"}
          </ButtonBlock>
        </DialogActions>
      </Dialog>

      {/* Mobile: Floating Action Button with label */}
      {isMobile && (
        <Fab
          variant="extended"
          color="primary"
          aria-label="Leistung hinzufügen"
          onClick={() => handleOpenDialog()}
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
          Leistung hinzufügen
        </Fab>
      )}
    </Stack>
  );
};

export default ProceduresManagement;
