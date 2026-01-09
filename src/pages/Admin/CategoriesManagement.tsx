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
  useGetCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "../../api/categories/hooks";
import { CreateCategoryDto } from "../../api/categories/types";
import { useQueryClient } from "@tanstack/react-query";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import { formatDateDE } from "../../utils/formatDate";
import DateText from "../../components/atoms/DateText";

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
  description: Yup.string().required("Description is required"),
});

interface Category {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoriesApiResponse {
  data: Category[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

const CategoriesManagement: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<string>("name");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { data: categoriesResponse, isLoading } = useGetCategories({
    page,
    limit: 10,
    sortBy: orderBy,
    sortOrder: order,
  });
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  // Cast the response to the correct type since the API returns different structure
  const typedResponse = categoriesResponse as unknown as CategoriesApiResponse;
  const categories = typedResponse?.data || [];
  const pagination = typedResponse?.pagination;

  const handleOpenDialog = (category?: Category) => {
    setEditingCategory(category || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (values: CreateCategoryDto) => {
    console.log("Form submitted with values:", values);

    try {
      const categoryData: CreateCategoryDto = {
        name: values.name,
        description: values.description,
      };

      console.log("Category data to be sent:", categoryData);

      if (editingCategory) {
        console.log("Updating category:", editingCategory._id);
        const result = await updateMutation.mutateAsync({
          categoryId: editingCategory._id,
          data: categoryData,
        });
        console.log("Update result:", result);
      } else {
        console.log("Creating new category");
        const result = await createMutation.mutateAsync(categoryData);
        console.log("Create result:", result);
      }

      queryClient.invalidateQueries({ queryKey: ["categories"] });
      handleCloseDialog();
      console.log("Category saved successfully");
    } catch (error) {
      console.error("Error saving category:", error);
      // Show error to user
      setError("Failed to save category. Please try again.");
    }
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (categoryToDelete) {
      try {
        await deleteMutation.mutateAsync(categoryToDelete._id);
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        setDeleteConfirmOpen(false);
        setCategoryToDelete(null);
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    }
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = categories.map((category: Category) => category._id);
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
  const filteredCategories = categories;

  const initialValues = {
    name: editingCategory?.name || "",
    description: editingCategory?.description || "",
  };

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
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
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 600,
                  color: "#333",
                  fontSize: "28px",
                }}
              >
                Categories Management
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#666",
                  mt: 0.5,
                }}
              >
                Manage dental procedure categories
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
              Add Category
            </ButtonBlock>
          </Box>

          {/* Search and Actions */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <TextField
              placeholder="Search categories..."
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
                          selected.length < categories.length
                        }
                        checked={
                          categories.length > 0 &&
                          selected.length === categories.length
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
                        Category Name
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Created Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCategories.map((category: Category) => {
                    const isItemSelected = isSelected(category._id);
                    return (
                      <TableRow
                        key={category._id}
                        hover
                        onClick={() => handleClick(category._id)}
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
                            {category.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {category.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            <DateText date={category.createdAt} />
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDialog(category);
                              }}
                              sx={{ color: "#4caf50" }}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(category);
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
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 600 }}>
            {editingCategory ? "Edit Category" : "Add New Category"}
          </DialogTitle>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values: CreateCategoryDto) => {
              handleSubmit(values);
            }}
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
                      label="Category Name"
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
              Are you sure you want to delete the category "
              {categoryToDelete?.name}"? This action cannot be undone.
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

export default CategoriesManagement;
