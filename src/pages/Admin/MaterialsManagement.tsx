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
  Fab,
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
  useGetMaterials,
  useCreateMaterial,
  useUpdateMaterial,
  useDeleteMaterial,
} from "../../api/materials/hooks";
import { MaterialRequestBody } from "../../api/materials/types";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import S3FileUpload, { S3UploadResponse } from "../../components/S3FileUpload";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import DateText from "../../components/atoms/DateText";
import ResponsiveTable, { ColumnDef } from "../../components/ResponsiveTable";

const validationSchema = Yup.object({
  name: Yup.string().required("Name ist erforderlich"),
});

interface Material {
  _id: string;
  name: string;
  operations: Array<{
    _id: string;
    name: string;
    category: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface MaterialsApiResponse {
  data: Material[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// Mobile card renderer for materials
const MaterialMobileCard = ({
  material,
  onEdit,
  onDelete,
}: {
  material: Material;
  onEdit: (material: Material) => void;
  onDelete: (material: Material) => void;
}) => {
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
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, color: "rgba(51, 51, 51, 1)" }}
        >
          {material.name}
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(material);
            }}
            sx={{ color: "rgba(104, 201, 242, 1)" }}
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(material);
            }}
            sx={{ color: "#d32f2f" }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mb: 1 }}>
        {material.operations?.slice(0, 2).map((operation, index) => (
          <Chip
            key={index}
            label={operation.name}
            size="small"
            sx={{
              backgroundColor: "#e8f5e9",
              color: "#2e7d32",
              fontSize: "12px",
            }}
          />
        ))}
        {material.operations?.length > 2 && (
          <Chip
            label={`+${material.operations.length - 2} mehr`}
            size="small"
            variant="outlined"
            sx={{ fontSize: "12px" }}
          />
        )}
      </Stack>
      <Typography variant="caption" sx={{ color: "rgba(146, 146, 146, 1)" }}>
        Erstellt: <DateText date={material.createdAt} />
      </Typography>
    </Box>
  );
};

const MaterialsManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(
    null,
  );
  const [uploadedFile, setUploadedFile] = useState<S3UploadResponse | null>(
    null,
  );
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<string>("name");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const {
    data: materialsResponse,
    isLoading,
    refetch,
  } = useGetMaterials({
    page,
    limit: 15,
    sortBy: orderBy,
    sortOrder: order,
  });
  const createMutation = useCreateMaterial();
  const updateMutation = useUpdateMaterial();
  const deleteMutation = useDeleteMaterial();

  const typedResponse = materialsResponse as unknown as MaterialsApiResponse;
  const materials = typedResponse?.data || [];
  const pagination = typedResponse?.pagination;

  // Filter materials by search term (client-side)
  const filteredMaterials = useMemo(() => {
    if (!searchTerm.trim()) return materials;
    const term = searchTerm.toLowerCase();
    return materials.filter((mat) => mat.name.toLowerCase().includes(term));
  }, [materials, searchTerm]);

  const handleOpenDialog = (material?: Material) => {
    setEditingMaterial(material || null);
    setUploadedFile(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMaterial(null);
    setUploadedFile(null);
  };

  const handleSubmit = async (values: { name: string }) => {
    try {
      const materialData: MaterialRequestBody = {
        name: values.name,
        image: uploadedFile?.url || "",
      };

      if (editingMaterial) {
        await updateMutation.mutateAsync({
          materialId: editingMaterial._id,
          data: materialData,
        });
      } else {
        await createMutation.mutateAsync(materialData);
      }

      queryClient.invalidateQueries({ queryKey: ["materials"] });
      handleCloseDialog();
    } catch {
      setError(
        "Fehler beim Speichern des Materials. Bitte versuchen Sie es erneut.",
      );
    }
  };

  const handleDeleteClick = (material: Material) => {
    setMaterialToDelete(material);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (materialToDelete) {
      try {
        await deleteMutation.mutateAsync(materialToDelete._id);
        queryClient.invalidateQueries({ queryKey: ["materials"] });
        setDeleteConfirmOpen(false);
        setMaterialToDelete(null);
      } catch {
        setError("Fehler beim Löschen des Materials.");
      }
    }
  };

  const handleFileUpload = (response: S3UploadResponse) => {
    setUploadedFile(response);
  };

  const handleFileRemove = () => {
    setUploadedFile(null);
  };

  const handleSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const mobileCardRenderer = (material: Material) => (
    <MaterialMobileCard
      material={material}
      onEdit={handleOpenDialog}
      onDelete={handleDeleteClick}
    />
  );

  const columns: ColumnDef<Material>[] = [
    {
      id: "name",
      label: "Materialname",
      accessor: (mat) => (
        <Typography variant="body2" fontWeight={500}>
          {mat.name}
        </Typography>
      ),
      sortable: true,
      width: 200,
    },
  ];

  const initialValues = {
    name: editingMaterial?.name || "",
  };

  const hasData = filteredMaterials.length > 0;

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
          Materialien
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
              placeholder="Material suchen..."
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
              Material hinzufügen
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
            <ResponsiveTable<Material>
              data={filteredMaterials}
              columns={columns}
              mobileCardRenderer={mobileCardRenderer}
              isLoading={isLoading}
              emptyMessage={
                searchTerm
                  ? "Keine Materialien gefunden"
                  : "Keine Materialien vorhanden. Fügen Sie ein neues Material hinzu."
              }
              getItemId={(mat) => mat._id}
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
          {editingMaterial ? "Material bearbeiten" : "Neues Material"}
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
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    name="name"
                    label="Materialname"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                  />
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1, fontWeight: 600 }}
                    >
                      Materialbild (Optional)
                    </Typography>
                    <S3FileUpload
                      onUploadSuccess={handleFileUpload}
                      onUploadError={(err) =>
                        console.error("Upload error:", err)
                      }
                      acceptedFileTypes="image/*"
                      maxFileSize={5 * 1024 * 1024}
                      currentFile={uploadedFile}
                      onRemove={handleFileRemove}
                      label="Materialbild hochladen"
                    />
                  </Box>
                </Stack>
              </DialogContent>
              <DialogActions sx={{ p: 2 }}>
                <ButtonBlock
                  onClick={handleCloseDialog}
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
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background:
                      "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
                    borderRadius: "40px",
                    height: "40px",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "500",
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
            Sind Sie sicher, dass Sie das Material "{materialToDelete?.name}"
            löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
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

      {/* Mobile: Floating Action Button with label */}
      {isMobile && (
        <Fab
          variant="extended"
          color="primary"
          aria-label="Material hinzufügen"
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
          Material hinzufügen
        </Fab>
      )}
    </Stack>
  );
};

export default MaterialsManagement;
