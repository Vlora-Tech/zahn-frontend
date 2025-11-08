
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  InputAdornment,
  createTheme,
  ThemeProvider,
  Pagination,
  Checkbox,
  TableSortLabel,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Remove,
  Search,
  Print,
  Refresh,
  Settings,
} from "@mui/icons-material";
import { Formik, Form, FieldArray } from "formik";
import * as Yup from "yup";
import {
  useGetOptions,
  useCreateOption,
  useUpdateOption,
  useDeleteOption,
} from "../../api/options/hooks";
import { useGetOperations } from "../../api/operations/hooks";
import { OptionRequestBody } from "../../api/options/types";
import { useQueryClient } from "@tanstack/react-query";
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

// Update types to match actual API response
interface Material {
  _id: string;
  name: string;
  operations?: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Operation {
  _id: string;
  name: string;
  category: string;
  materials: unknown[];
  options: unknown[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Option {
  _id: string;
  name: string;
  type: "radio" | "switch" | "selection" | "input";
  values: string[];
  operation: Operation; // Full operation object, not just ID
  material?: Material; // Full material object, not just ID
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface OptionsApiResponse {
  data: Option[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
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


const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  type: Yup.string().oneOf(["radio", "switch" , "selection" , "input"], "Type must be radio or switch").required("Type is required"),
  values: Yup.array()
    .of(Yup.string())
    .when("type", {
      is: (val: string) => val !== "input", // only validate if not input
      then: (schema) => schema.min(1, "At least one value is required").required("At least one value is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  operation: Yup.string().required("Operation is required"),
  material: Yup.string(),
});

const OptionsManagement: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<Option | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [optionToDelete, setOptionToDelete] = useState<Option | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [orderBy, setOrderBy] = useState<string>("name");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const queryClient = useQueryClient();
  const { data: optionsResponse, isLoading } = useGetOptions({ page, limit: 10, sortBy: orderBy, sortOrder: order });
  const { data: operationsResponse } = useGetOperations({ page: 1, limit: 100 }); // Get all operations for dropdown
  const createMutation = useCreateOption();
  const updateMutation = useUpdateOption();
  const deleteMutation = useDeleteOption();

  // Cast responses to correct types
  const typedOptionsResponse = optionsResponse as unknown as OptionsApiResponse;
  const options = typedOptionsResponse?.data || [];
  const pagination = typedOptionsResponse?.pagination;

  const typedOperationsResponse = operationsResponse as unknown as OperationsApiResponse;
  const allOperations = typedOperationsResponse?.data || [];


  const handleOpenDialog = (option?: Option) => {
    setEditingOption(option || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingOption(null);
  };

  const handleSubmit = async (values: {
    name: string;
    type: "radio" | "switch" | "selection" | "input";
    values: string[];
    operation: string;
    material: string;
  }) => {
    console.log("=== OPTION FORM SUBMISSION STARTED ===");
    console.log("Form submitted with values:", values);
    
    try {
      const optionData: OptionRequestBody = {
        name: values.name,
        type: values.type as "selection" | "input",
        ...(values.type === "input" ? {values:[]} : {values: values.values.filter((v: string) => v.trim() !== "")}),
        operation: values.operation,
        // material: values.material || "",
      };

      console.log("Option data to be sent:", optionData);

      if (editingOption) {
        console.log("Updating option:", editingOption._id);
        const result = await updateMutation.mutateAsync({
          optionId: editingOption._id,
          data: optionData,
        });
        console.log("Update result:", result);
      } else {
        console.log("Creating new option");
        const result = await createMutation.mutateAsync(optionData);
        console.log("Create result:", result);
      }
      
      queryClient.invalidateQueries({ queryKey: ["options"] });
      handleCloseDialog();
      console.log("Option saved successfully");
    } catch (error) {
      console.error("=== ERROR SAVING OPTION ===");
      console.error("Error details:", error);
      alert("Failed to save option: " + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleDeleteClick = (option: Option) => {
    setOptionToDelete(option);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (optionToDelete) {
      try {
        await deleteMutation.mutateAsync(optionToDelete._id);
        queryClient.invalidateQueries({ queryKey: ["options"] });
        setDeleteConfirmOpen(false);
        setOptionToDelete(null);
      } catch (error) {
        console.error("Error deleting option:", error);
      }
    }
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = options.map((option: Option) => option._id);
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

  const getOperationName = (option: Option) => {
    return option.operation?.name || "Unknown operation";
  };
  // Server-side filtering and sorting is now handled by the API
  const filteredOptions = options;

  const initialValues = {
    name: editingOption?.name || "",
    type: editingOption?.type || "selection" as const,
    values: editingOption?.values || [""],
    operation: editingOption?.operation?._id || "",
    material: editingOption?.material?._id || "",
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
                Options Management
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#666",
                  mt: 0.5,
                }}
              >
                Manage configuration options and parameters
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
              Add Option
            </ButtonBlock>
          </Box>

          {/* Search and Actions */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <TextField
              placeholder="Search options..."
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
                          selected.length > 0 && selected.length < options.length
                        }
                        checked={
                          options.length > 0 && selected.length === options.length
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
                        Option Name
                      </TableSortLabel>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Operation</TableCell>
                    {/* <TableCell sx={{ fontWeight: 600 }}>Material</TableCell> */}
                    <TableCell sx={{ fontWeight: 600 }}>Values</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOptions.map((option: Option) => {
                    const isItemSelected = isSelected(option._id);
                    return (
                      <TableRow
                        key={option._id}
                        hover
                        onClick={() => handleClick(option._id)}
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
                            {option.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={option.type}
                            size="small"
                            sx={{
                              backgroundColor: option.type === "radio" ? "#fff3e0" : "#e8f5e9",
                              color: option.type === "radio" ? "#f57c00" : "#2e7d32",
                              fontSize: "12px",
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {getOperationName(option)}
                          </Typography>
                        </TableCell>
                        {/* <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {getMaterialName(option)}
                          </Typography>
                        </TableCell> */}
                        <TableCell>
                          <Stack direction="row" spacing={0.5} flexWrap="wrap">
                            {option.values?.slice(0, 3).map((value, index) => (
                              <Chip
                                key={index}
                                label={value}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: "12px" }}
                              />
                            ))}
                            {option.values?.length > 3 && (
                              <Chip
                                label={`+${option.values.length - 3} more`}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: "12px" }}
                              />
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(option.createdAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDialog(option);
                              }}
                              sx={{ color: "#f57c00" }}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(option);
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
        <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 600 }}>
            {editingOption ? "Edit Option" : "Add New Option"}
          </DialogTitle>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting, setFieldValue }) => {
              console.log(errors);
              return (
              <Form>
                <DialogContent>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      name="name"
                      label="Option Name"
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
                    
                    <FormControl fullWidth>
                      <InputLabel>Type</InputLabel>
                      <Select
                        name="type"
                        value={values.type}
                        onChange={handleChange}
                        label="Type"
                        error={touched.type && Boolean(errors.type)}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                          },
                        }}
                      >
                        {/* <MenuItem value="radio">Radio</MenuItem>
                        <MenuItem value="switch">Switch</MenuItem> */}
                         <MenuItem value="selection">Select</MenuItem>
                        <MenuItem value="input">Input</MenuItem>
                      </Select>
                      {touched.type && errors.type && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                          {errors.type}
                        </Typography>
                      )}
                    </FormControl>

                    <FormControl fullWidth>
                      <InputLabel>Operation</InputLabel>
                      <Select
                        name="operation"
                        value={values.operation}
                        onChange={handleChange}
                        label="Operation"
                        error={touched.operation && Boolean(errors.operation)}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                          },
                        }}
                      >
                        {allOperations.map((operation) => (
                          <MenuItem key={operation._id} value={operation._id}>
                            {operation.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {touched.operation && errors.operation && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                          {errors.operation}
                        </Typography>
                      )}
                    </FormControl>

                    {/*<FormControl fullWidth>
                      <InputLabel>Material (Optional)</InputLabel>
                      <Select
                        name="material"
                        value={values.material}
                        onChange={handleChange}
                        label="Material (Optional)"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: "8px",
                          },
                        }}
                      >
                        <MenuItem value="">No material</MenuItem>
                        {allMaterials.map((material) => (
                          <MenuItem key={material._id} value={material._id}>
                            {material.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>*/}

                    {values?.type !== "input" && <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Option Values
                      </Typography>
                      <FieldArray name="values">
                        {({ push, remove }) => (
                          <Stack spacing={2}>
                            {values.values.map((value, index) => (
                              <Box key={index} display="flex" alignItems="center" gap={1}>
                                <TextField
                                  fullWidth
                                  label={`Value ${index + 1}`}
                                  value={value}
                                  onChange={(e) => setFieldValue(`values.${index}`, e.target.value)}
                                  sx={{
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: "8px",
                                    },
                                  }}
                                />
                                {values.values.length > 1 && (
                                  <IconButton
                                    onClick={() => remove(index)}
                                    color="error"
                                    size="small"
                                  >
                                    <Remove />
                                  </IconButton>
                                )}
                              </Box>
                            ))}
                            <Button
                              variant="outlined"
                              onClick={() => push("")}
                              startIcon={<Add />}
                              size="small"
                              sx={{
                                borderRadius: "20px",
                                textTransform: "none",
                              }}
                            >
                              Add Value
                            </Button>
                          </Stack>
                        )}
                      </FieldArray>
                    </Box>}
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
              );
            }}
          </Formik>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
          <DialogTitle sx={{ fontWeight: 600 }}>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the option "{optionToDelete?.name}"?
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

export default OptionsManagement; 