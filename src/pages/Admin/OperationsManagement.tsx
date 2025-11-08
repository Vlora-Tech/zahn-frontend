import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
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
  Checkbox,
  TableSortLabel,
  Autocomplete,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Search,
  Print,
  Refresh,
  Settings,
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
import ButtonBlock from "../../components/atoms/ButtonBlock";
import LoadingSpinner from "../../components/atoms/LoadingSpinner";
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
  name: Yup.string().required("Name is required"),
  description: Yup.string(),
  category: Yup.string().required("Category is required"),
  color: Yup.string().required("Color is required"),
  materials: Yup.array().of(Yup.string()),
  optionSchema: Yup.mixed<OptionsSchema>()
    .required()
    .test(
      "has-mode",
      "Options must include a mode",
      (v) => !!v && !!(v as OptionsSchema).mode
    )
    .test(
      "has-parents",
      "Options must include parents",
      (v) => !!v && Array.isArray((v as OptionsSchema).parents)
    ),
});

const OperationsManagement: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOperation, setEditingOperation] = useState<Operation | null>(
    null
  );
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [operationToDelete, setOperationToDelete] = useState<Operation | null>(
    null
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<string>("name");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();
  const { data: operationsResponse, isLoading } = useGetOperations({
    page,
    limit: 10,
    sortBy: orderBy,
    sortOrder: order,
  });
  const { data: materialsResponse } = useGetMaterials({ page: 1, limit: 100 }); // Get all materials for dropdown
  const { data: categoriesResponse } = useGetCategories({
    page: 1,
    limit: 100,
  });
  const createMutation = useCreateOperation();
  const updateMutation = useUpdateOperation();
  const deleteMutation = useDeleteOperation();

  // Cast responses to correct types
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
    console.log("=== FORM SUBMISSION STARTED ===");
    console.log("Form submitted with values:", values);
    console.log("Editing operation:", editingOperation);

    try {
      const operationData = {
        name: values.name,
        description: values.description,
        category: values.category,
        color: values.color,
        materials: values.materials,
        optionSchema: values.optionSchema,
      };

      console.log("Operation data to be sent:", operationData);
      console.log("Create mutation:", createMutation);
      console.log("Update mutation:", updateMutation);

      if (editingOperation) {
        console.log("Updating operation:", editingOperation._id);
        const result = await updateMutation.mutateAsync({
          operationId: editingOperation._id,
          data: operationData,
        });
        console.log("Update result:", result);
      } else {
        console.log("Creating new operation");
        console.log("About to call createMutation.mutateAsync");
        // For create, we'll cast to unknown first then to the expected type since the API structure is different
        const result = await createMutation.mutateAsync(
          operationData as unknown as Parameters<
            typeof createMutation.mutateAsync
          >[0]
        );
        console.log("Create result:", result);
      }

      console.log("Invalidating queries...");
      queryClient.invalidateQueries({ queryKey: ["operations"] });
      console.log("Closing dialog...");
      handleCloseDialog();
      console.log("Operation saved successfully");
    } catch (error) {
      console.error("=== ERROR SAVING OPERATION ===");
      console.error("Error details:", error);
      console.error(
        "Error message:",
        error instanceof Error ? error.message : "Unknown error"
      );
      console.error(
        "Error stack:",
        error instanceof Error ? error.stack : "No stack trace"
      );
      alert(
        "Failed to save operation: " +
          (error instanceof Error ? error.message : "Unknown error")
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
      } catch (error) {
        console.error("Error deleting operation:", error);
      }
    }
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = operations.map(
        (operation: Operation) => operation._id
      );
      setSelected(newSelected);
      return;
    }
    setSelected([]);
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

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Server-side filtering and sorting is now handled by the API
  const filteredOperations = operations;

  const initialValues = {
    name: editingOperation?.name || "",
    description: editingOperation?.description || "",
    category: editingOperation?.category?._id || "",
    color: editingOperation?.color || "",
    materials: editingOperation?.materials?.map((m) => m._id) || [],
    optionSchema: editingOperation?.optionSchema || {
      mode: "multi",
      parents: [],
    },
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 600,
                color: "#333",
                fontSize: "28px",
              }}
            >
              Operations Management
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#666",
                mt: 0.5,
              }}
            >
              Manage dental operations and procedures
            </Typography>
          </Box>
          <ButtonBlock
            onClick={() => handleOpenDialog()}
            style={{
              background: "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
              borderRadius: "40px",
              height: "40px",
              color: "white",
              fontSize: "16px",
              fontWeight: "500",
              padding: "0 20px",
            }}
          >
            <Add sx={{ mr: 1 }} />
            Add Operation
          </ButtonBlock>
        </Box>

        {/* Search and Actions */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <TextField
            placeholder="Search operations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{
              width: "300px",
              "& .MuiOutlinedInput-root": {
                borderRadius: "25px",
                height: "40px",
              },
            }}
          />
          <Stack direction="row" spacing={1}>
            <IconButton>
              <Print />
            </IconButton>
            <IconButton>
              <Refresh />
            </IconButton>
            <IconButton>
              <Settings />
            </IconButton>
          </Stack>
        </Box>

        {/* Table */}
        <Paper
          sx={{
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: "#f8f9fa" }}>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      indeterminate={
                        selected.length > 0 &&
                        selected.length < operations.length
                      }
                      checked={
                        operations.length > 0 &&
                        selected.length === operations.length
                      }
                      onChange={handleSelectAllClick}
                    />
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === "name"}
                      direction={orderBy === "name" ? order : "asc"}
                      onClick={() => handleRequestSort("name")}
                      sx={{ fontWeight: 600 }}
                    >
                      Operation Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Color</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Materials</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOperations.map((operation: Operation) => {
                  const isItemSelected = isSelected(operation._id);
                  return (
                    <TableRow
                      key={operation._id}
                      hover
                      onClick={() => handleClick(operation._id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      selected={isItemSelected}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox color="primary" checked={isItemSelected} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {operation.name}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>
                        <Chip
                          label={operation.color || "No color"}
                          size="small"
                          sx={{
                            backgroundColor: operation.color
                              ? operation.color
                              : "#e3f2fd",
                            color: operation.color ? "white" : "#1976d2",
                            fontSize: "12px",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={operation.category?.name || "No category"}
                          size="small"
                          sx={{
                            backgroundColor: "#e3f2fd",
                            color: "#1976d2",
                            fontSize: "12px",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {operation.description || "No description"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {operation.materials
                            ?.slice(0, 2)
                            .map((material: Material, index: number) => (
                              <Chip
                                key={index}
                                label={material.name}
                                size="small"
                                sx={{
                                  backgroundColor: "#e8f5e9",
                                  color: "#2e7d32",
                                  fontSize: "12px",
                                }}
                              />
                            ))}
                          {operation.materials?.length > 2 && (
                            <Chip
                              label={`+${operation.materials.length - 2} more`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: "12px" }}
                            />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenDialog(operation);
                            }}
                            sx={{ color: "#4caf50" }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(operation);
                            }}
                            sx={{ color: "#d32f2f" }}
                          >
                            <Delete />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Pagination */}
        {pagination && (
          <Box display="flex" justifyContent="center">
            <Pagination
              count={pagination.totalPages}
              page={page}
              onChange={(event, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Stack>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          {editingOperation ? "Edit Operation" : "Add New Operation"}
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
              <DialogContent>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    name="name"
                    label="Operation Name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                      },
                    }}
                  />
                  <Autocomplete
                    options={allCategories}
                    getOptionLabel={(option: Category) => option.name}
                    value={
                      allCategories.find(
                        (category) => category._id === values.category
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFieldValue("category", newValue?._id || "");
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        name="category"
                        label="Category"
                        error={touched.category && Boolean(errors.category)}
                        helperText={touched.category && errors.category}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                          },
                        }}
                      />
                    )}
                  />
                  <TextField
                    fullWidth
                    name="description"
                    label="Description"
                    multiline
                    rows={3}
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    name="color"
                    label="Color"
                    value={values.color}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.color && Boolean(errors.color)}
                    helperText={touched.color && errors.color}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                      },
                    }}
                  />

                  {/* Materials Selection */}
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ mb: 1, fontWeight: 600 }}
                    >
                      Materials
                    </Typography>
                    <Autocomplete
                      multiple
                      options={allMaterials}
                      getOptionLabel={(option: Material) => option.name}
                      value={allMaterials.filter((material) =>
                        values.materials.includes(material._id)
                      )}
                      onChange={(event, newValue) => {
                        setFieldValue(
                          "materials",
                          newValue.map((material) => material._id)
                        );
                      }}
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
                          placeholder="Select materials..."
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "8px",
                            },
                          }}
                        />
                      )}
                      sx={{
                        "& .MuiAutocomplete-tag": {
                          backgroundColor: "#e8f5e9",
                          color: "#2e7d32",
                        },
                      }}
                    />
                  </Box>

                  {/* Option Schema Editing */}
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
              <DialogActions sx={{ p: 3 }}>
                <Button
                  onClick={handleCloseDialog}
                  sx={{
                    borderRadius: "20px",
                    textTransform: "none",
                    marginRight: "auto",
                  }}
                >
                  Cancel
                </Button>
                <ButtonBlock
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    background:
                      "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
                    borderRadius: "20px",
                    height: "36px",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "500",
                    padding: "0 20px",
                  }}
                >
                  {isSubmitting ? "Saving..." : "Save"}
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
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the operation "
            {operationToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            sx={{
              borderRadius: "20px",
              textTransform: "none",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
            sx={{
              borderRadius: "20px",
              textTransform: "none",
            }}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OperationsManagement;
