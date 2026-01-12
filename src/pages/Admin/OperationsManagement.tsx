import { useState, useMemo } from "react";
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
  Autocomplete,
  useTheme,
  useMediaQuery,
  Alert,
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
  useGetOperations,
  useCreateOperation,
  useUpdateOperation,
  useDeleteOperation,
} from "../../api/operations/hooks";
import { useGetMaterials } from "../../api/materials/hooks";
import { useGetCategories } from "../../api/categories/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import ResponsiveTable, { ColumnDef } from "../../components/ResponsiveTable";
import DynamicFormCreator from "./DynamicForm";

export type OptionsSchema = {
  mode: "multi" | "single" | "all";
  parents: OptionsSchemaParent[];
};

export type OptionsSchemaParent = {
  label: string;
  value: string;
  onlyShowChildrenIfSelected?: boolean;
  children?: OptionsSchemaChild[];
};

export type OptionsSchemaChild =
  | { type: "text"; label?: string }
  | {
      type: "select";
      label?: string;
      options: { label: string; value: string }[];
    }
  | {
      type: "multi-select";
      label?: string;
      options: { label: string; value: string }[];
    }
  | { type: "drawing"; label?: string }
  | {
      type: "file-upload";
      label?: string;
      accept?: string[];
      maxFiles?: number;
    };

interface Category {
  _id: string;
  name: string;
  description: string;
}

interface Operation {
  _id: string;
  name: string;
  category: Category;
  description: string;
  color: string;
  materials: Material[];
  optionSchema: OptionsSchema;
  createdAt: string;
}

interface Material {
  _id: string;
  name: string;
  image?: string;
  description?: string;
}

interface OperationsApiResponse {
  data: Operation[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
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

const validationSchema = Yup.object({
  name: Yup.string().required("Name ist erforderlich"),
  description: Yup.string(),
  category: Yup.string().required("Kategorie ist erforderlich"),
  color: Yup.string().required("Farbe ist erforderlich"),
  materials: Yup.array().of(Yup.string()),
  optionSchema: Yup.mixed<OptionsSchema>()
    .required()
    .test(
      "has-mode",
      "Optionen müssen einen Modus enthalten",
      (v) => !!v && !!(v as OptionsSchema).mode,
    )
    .test(
      "has-parents",
      "Optionen müssen Parents enthalten",
      (v) => !!v && Array.isArray((v as OptionsSchema).parents),
    ),
});

// Mobile card renderer for operations
const OperationMobileCard = ({
  operation,
  onEdit,
  onDelete,
}: {
  operation: Operation;
  onEdit: (operation: Operation) => void;
  onDelete: (operation: Operation) => void;
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
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: "rgba(51, 51, 51, 1)" }}
          >
            {operation.name}
          </Typography>
          {operation.category?.name && (
            <Chip
              label={operation.category.name}
              size="small"
              sx={{
                backgroundColor: "#e3f2fd",
                color: "#1976d2",
                fontSize: "11px",
                mt: 0.5,
              }}
            />
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(operation);
            }}
            sx={{ color: "rgba(104, 201, 242, 1)" }}
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(operation);
            }}
            sx={{ color: "#d32f2f" }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        {operation.color && (
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: "4px",
              backgroundColor: operation.color,
              border: "1px solid rgba(0,0,0,0.1)",
            }}
          />
        )}
      </Box>
      {operation.materials?.length > 0 && (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
          {operation.materials.slice(0, 2).map((material, index) => (
            <Chip
              key={index}
              label={material.name}
              size="small"
              sx={{
                backgroundColor: "#e8f5e9",
                color: "#2e7d32",
                fontSize: "11px",
              }}
            />
          ))}
          {operation.materials.length > 2 && (
            <Chip
              label={`+${operation.materials.length - 2}`}
              size="small"
              variant="outlined"
              sx={{ fontSize: "11px" }}
            />
          )}
        </Stack>
      )}
    </Box>
  );
};

const OperationsManagement: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOperation, setEditingOperation] = useState<Operation | null>(
    null,
  );
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [operationToDelete, setOperationToDelete] = useState<Operation | null>(
    null,
  );
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<string>("name");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const {
    data: operationsResponse,
    isLoading,
    refetch,
  } = useGetOperations({
    page,
    limit: 15,
    sortBy: orderBy,
    sortOrder: order,
  });
  const { data: materialsResponse } = useGetMaterials({ page: 1, limit: 100 });
  const { data: categoriesResponse } = useGetCategories({
    page: 1,
    limit: 100,
  });
  const createMutation = useCreateOperation();
  const updateMutation = useUpdateOperation();
  const deleteMutation = useDeleteOperation();

  const typedOperationsResponse =
    operationsResponse as unknown as OperationsApiResponse;
  const operations = typedOperationsResponse?.data || [];
  const pagination = typedOperationsResponse?.pagination;

  const typedMaterialsResponse =
    materialsResponse as unknown as MaterialsApiResponse;
  const allMaterials = typedMaterialsResponse?.data || [];

  const typedCategoriesResponse = categoriesResponse as unknown as {
    data: Category[];
  };
  const allCategories = typedCategoriesResponse?.data || [];

  // Filter operations by search term
  const filteredOperations = useMemo(() => {
    if (!searchTerm.trim()) return operations;
    const term = searchTerm.toLowerCase();
    return operations.filter(
      (op) =>
        op.name.toLowerCase().includes(term) ||
        op.description?.toLowerCase().includes(term) ||
        op.category?.name?.toLowerCase().includes(term),
    );
  }, [operations, searchTerm]);

  const handleOpenDialog = (operation?: Operation) => {
    setEditingOperation(operation || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingOperation(null);
  };

  const handleSubmit = async (values: {
    name: string;
    description: string;
    category: string;
    color: string;
    materials: string[];
    optionSchema: OptionsSchema;
  }) => {
    try {
      const operationData = {
        name: values.name,
        description: values.description,
        category: values.category,
        color: values.color,
        materials: values.materials,
        optionSchema: values.optionSchema,
      };

      if (editingOperation) {
        await updateMutation.mutateAsync({
          operationId: editingOperation._id,
          data: operationData,
        });
      } else {
        await createMutation.mutateAsync(
          operationData as unknown as Parameters<
            typeof createMutation.mutateAsync
          >[0],
        );
      }

      queryClient.invalidateQueries({ queryKey: ["operations"] });
      handleCloseDialog();
    } catch (err) {
      setError(
        "Fehler beim Speichern des Vorgangs. Bitte versuchen Sie es erneut.",
      );
    }
  };

  const handleDeleteClick = (operation: Operation) => {
    setOperationToDelete(operation);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (operationToDelete) {
      try {
        await deleteMutation.mutateAsync(operationToDelete._id);
        queryClient.invalidateQueries({ queryKey: ["operations"] });
        setDeleteConfirmOpen(false);
        setOperationToDelete(null);
      } catch (err) {
        setError("Fehler beim Löschen des Vorgangs.");
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

  const mobileCardRenderer = (operation: Operation) => (
    <OperationMobileCard
      operation={operation}
      onEdit={handleOpenDialog}
      onDelete={handleDeleteClick}
    />
  );

  const columns: ColumnDef<Operation>[] = [
    {
      id: "name",
      label: "Vorgangsname",
      accessor: (op) => (
        <Typography variant="body2" fontWeight={500}>
          {op.name}
        </Typography>
      ),
      sortable: true,
      width: 180,
    },
    {
      id: "color",
      label: "Farbe",
      accessor: (op) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: "4px",
              backgroundColor: op.color || "#ccc",
              border: "1px solid rgba(0,0,0,0.1)",
            }}
          />
          <Typography
            variant="body2"
            sx={{ fontFamily: "monospace", fontSize: "12px" }}
          >
            {op.color || "-"}
          </Typography>
        </Box>
      ),
      width: 120,
    },
    {
      id: "category",
      label: "Kategorie",
      accessor: (op) => (
        <Chip
          label={op.category?.name || "Keine"}
          size="small"
          sx={{
            backgroundColor: "#e3f2fd",
            color: "#1976d2",
            fontSize: "12px",
          }}
        />
      ),
      width: 150,
    },
    {
      id: "materials",
      label: "Materialien",
      accessor: (op) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          {op.materials?.slice(0, 2).map((material, index) => (
            <Chip
              key={index}
              label={material.name}
              size="small"
              sx={{
                backgroundColor: "#e8f5e9",
                color: "#2e7d32",
                fontSize: "11px",
              }}
            />
          ))}
          {op.materials?.length > 2 && (
            <Chip
              label={`+${op.materials.length - 2}`}
              size="small"
              variant="outlined"
              sx={{ fontSize: "11px" }}
            />
          )}
        </Stack>
      ),
      width: 180,
    },
    {
      id: "actions",
      label: "",
      accessor: (op) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDialog(op);
            }}
            sx={{ color: "rgba(104, 201, 242, 1)" }}
          >
            <Edit fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(op);
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
    name: editingOperation?.name || "",
    description: editingOperation?.description || "",
    category: editingOperation?.category?._id || "",
    color: editingOperation?.color || "",
    materials: editingOperation?.materials?.map((m) => m._id) || [],
    optionSchema: editingOperation?.optionSchema || {
      mode: "multi" as const,
      parents: [],
    },
  };

  const hasData = filteredOperations.length > 0;

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
          Vorgänge
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
          <TextField
            size="small"
            placeholder="Vorgang suchen..."
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{
              minWidth: { xs: "100%", sm: 200, md: 300 },
              width: { xs: "100%", sm: "auto" },
              flexShrink: 1,
              "& .MuiInputBase-root": { minHeight: { xs: "44px", sm: "40px" } },
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
              Vorgang hinzufügen
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
            <ResponsiveTable<Operation>
              data={filteredOperations}
              columns={columns}
              mobileCardRenderer={mobileCardRenderer}
              isLoading={isLoading}
              emptyMessage={
                searchTerm
                  ? "Keine Vorgänge gefunden"
                  : "Keine Vorgänge vorhanden. Fügen Sie einen neuen Vorgang hinzu."
              }
              getItemId={(op) => op._id}
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
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editingOperation ? "Vorgang bearbeiten" : "Neuer Vorgang"}
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
            setFieldValue,
          }) => (
            <Form>
              <DialogContent sx={{ overflow: "auto" }}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    name="name"
                    label="Vorgangsname"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                  />
                  <Autocomplete
                    options={allCategories}
                    getOptionLabel={(option: Category) => option.name}
                    value={
                      allCategories.find(
                        (category) => category._id === values.category,
                      ) || null
                    }
                    onChange={(_, newValue) =>
                      setFieldValue("category", newValue?._id || "")
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        name="category"
                        label="Kategorie"
                        error={touched.category && Boolean(errors.category)}
                        helperText={touched.category && errors.category}
                      />
                    )}
                  />
                  <TextField
                    fullWidth
                    name="color"
                    label="Farbe (Hex-Code)"
                    value={values.color}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.color && Boolean(errors.color)}
                    helperText={touched.color && errors.color}
                    placeholder="#FF5733"
                  />
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1, fontWeight: 600 }}
                    >
                      Materialien
                    </Typography>
                    <Autocomplete
                      multiple
                      options={allMaterials}
                      getOptionLabel={(option: Material) => option.name}
                      value={allMaterials.filter((material) =>
                        values.materials.includes(material._id),
                      )}
                      onChange={(_, newValue) =>
                        setFieldValue(
                          "materials",
                          newValue.map((material) => material._id),
                        )
                      }
                      renderTags={(value: Material[], getTagProps) =>
                        value.map((option: Material, index: number) => (
                          <Chip
                            variant="outlined"
                            label={option.name}
                            {...getTagProps({ index })}
                            key={option._id}
                            sx={{
                              backgroundColor: "#e8f5e9",
                              color: "#2e7d32",
                              borderColor: "#2e7d32",
                            }}
                          />
                        ))
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Materialien auswählen..."
                        />
                      )}
                    />
                  </Box>
                  <Box
                    sx={{
                      backgroundColor: "#e3f2fd",
                      borderRadius: "10px",
                      padding: "20px",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1, fontWeight: 600 }}
                    >
                      Optionen Schema
                    </Typography>
                    <DynamicFormCreator
                      value={
                        values.optionSchema || { mode: "multi", parents: [] }
                      }
                      onChange={(newSchema) =>
                        setFieldValue("optionSchema", newSchema)
                      }
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
            Sind Sie sicher, dass Sie den Vorgang "{operationToDelete?.name}"
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
          aria-label="Vorgang hinzufügen"
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
          Vorgang hinzufügen
        </Fab>
      )}
    </Stack>
  );
};

export default OperationsManagement;
