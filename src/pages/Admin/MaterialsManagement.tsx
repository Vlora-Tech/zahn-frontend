import React, { useState } from "react";
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
  CircularProgress,
  InputAdornment,
  createTheme,
  ThemeProvider,
  Pagination,
  Checkbox,
  TableSortLabel,
  Alert,
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
  useGetMaterials,
  useCreateMaterial,
  useUpdateMaterial,
  useDeleteMaterial,
} from "../../api/materials/hooks";
import { MaterialRequestBody } from "../../api/materials/types";
import { useQueryClient } from "@tanstack/react-query";
import S3FileUpload, { S3UploadResponse } from "../../components/S3FileUpload";
import ButtonBlock from "../../components/atoms/ButtonBlock";

// Define a theme to match the app's color scheme
const theme = createTheme({
  palette: {
    primary: {
      main: "#4caf50",
    },
    secondary: {
      main: "#2e7d32",
    },
    background: {
      default: "#f5f5f5",
    },
    text: {
      primary: "#333",
    },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
  },
});

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
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

const MaterialsManagement: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [materialToDelete, setMaterialToDelete] = useState<Material | null>(null);
  const [uploadedFile, setUploadedFile] = useState<S3UploadResponse | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<string>("name");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { data: materialsResponse, isLoading } = useGetMaterials({ page, limit: 10, sortBy: orderBy, sortOrder: order });
  const createMutation = useCreateMaterial();
  const updateMutation = useUpdateMaterial();
  const deleteMutation = useDeleteMaterial();

  // Cast the response to the correct type since the API returns different structure
  const typedResponse = materialsResponse as unknown as MaterialsApiResponse;
  const materials = typedResponse?.data || [];
  const pagination = typedResponse?.pagination;

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
    console.log("Form submitted with values:", values);
    console.log("Uploaded file:", uploadedFile);
    
    try {
      const materialData: MaterialRequestBody = {
        name: values.name,
        image: uploadedFile?.url || "",
      };

      console.log("Material data to be sent:", materialData);

      if (editingMaterial) {
        console.log("Updating material:", editingMaterial._id);
        const result = await updateMutation.mutateAsync({
          materialId: editingMaterial._id,
          data: materialData,
        });
        console.log("Update result:", result);
      } else {
        console.log("Creating new material");
        const result = await createMutation.mutateAsync(materialData);
        console.log("Create result:", result);
      }
      
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      handleCloseDialog();
      console.log("Material saved successfully");
    } catch (error) {
      console.error("Error saving material:", error);
      // Show error to user
      setError("Failed to save material. Please try again.");
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
      } catch (error) {
        console.error("Error deleting material:", error);
      }
    }
  };

  const handleFileUpload = (response: S3UploadResponse) => {
    setUploadedFile(response);
  };

  const handleFileRemove = () => {
    setUploadedFile(null);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = materials.map((material: Material) => material._id);
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
  const filteredMaterials = materials;

  const initialValues = {
    name: editingMaterial?.name || "",
  };

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
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
                Materials Management
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#666",
                  mt: 0.5,
                }}
              >
                Manage dental materials and supplies
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
              Add Material
            </ButtonBlock>
          </Box>

          {/* Search and Actions */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <TextField
              placeholder="Search materials..."
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
                          selected.length > 0 && selected.length < materials.length
                        }
                        checked={
                          materials.length > 0 && selected.length === materials.length
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
                        Material Name
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Operations</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Created Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMaterials.map((material: Material) => {
                    const isItemSelected = isSelected(material._id);
                    return (
                      <TableRow
                        key={material._id}
                        hover
                        onClick={() => handleClick(material._id)}
                        role="checkbox"
                        aria-checked={isItemSelected}
                        selected={isItemSelected}
                        sx={{ cursor: "pointer" }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {material.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5} flexWrap="wrap">
                            {material.operations?.slice(0, 2).map((operation: { _id: string; name: string; category: string }, index: number) => (
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
                                label={`+${material.operations.length - 2} more`}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: "12px" }}
                              />
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(material.createdAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDialog(material);
                              }}
                              sx={{ color: "#4caf50" }}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(material);
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

          {/* Error Display */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
        </Stack>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 600 }}>
            {editingMaterial ? "Edit Material" : "Add New Material"}
          </DialogTitle>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
              <Form>
                <DialogContent>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      name="name"
                      label="Material Name"
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
                    
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Material Image (Optional)
                      </Typography>
                      <S3FileUpload
                        onUploadSuccess={handleFileUpload}
                        onUploadError={(error) => console.error("Upload error:", error)}
                        acceptedFileTypes="image/*"
                        maxFileSize={5 * 1024 * 1024} // 5MB
                        currentFile={uploadedFile}
                        onRemove={handleFileRemove}
                        label="Upload Material Image"
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
                    }}
                  >
                    Cancel
                  </Button>
                  <ButtonBlock
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      background: "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
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
        <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
          <DialogTitle sx={{ fontWeight: 600 }}>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the material "{materialToDelete?.name}"?
              This action cannot be undone.
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
    </ThemeProvider>
  );
};

export default MaterialsManagement; 