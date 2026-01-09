import { useState } from "react";
import {
  Typography,
  IconButton,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Alert,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  Select,
  MenuItem,
  SelectChangeEvent,
  TableSortLabel,
} from "@mui/material";
import {
  Refresh,
  Search,
  Add,
  Edit,
  Inventory2,
  FilterAlt,
  Print,
  Settings,
} from "@mui/icons-material";
import { Form, Formik } from "formik";
import * as yup from "yup";
import {
  useMaterials,
  useCreateMaterial,
  useUpdateMaterial,
  useMaterialCategories,
} from "../../api/inventory/hooks";
import {
  InventoryMaterial,
  CreateInventoryMaterialDto,
  UpdateInventoryMaterialDto,
} from "../../api/inventory/types";
import TableRowsLoader from "../../components/molecules/TableRowsLoader";
import EmptyTableState from "../../components/molecules/EmptyTableState";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import TextFieldBlock from "../../components/molecules/form-fields/TextFieldBlock";
import SelectFieldBlock from "../../components/molecules/form-fields/SelectFieldBlock";
import { useSnackbar } from "../../context/SnackbarContext";
import StyledLink from "../../components/atoms/StyledLink";

const validationSchema = yup.object({
  name: yup.string().required("Name ist erforderlich"),
  category: yup.string().required("Kategorie ist erforderlich"),
  unit: yup.string().required("Einheit ist erforderlich"),
  internalCode: yup.string().required("Interner Code ist erforderlich"),
  manufacturer: yup.string(),
  description: yup.string(),
});

const InventoryMaterials = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] =
    useState<InventoryMaterial | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { openSnackbar } = useSnackbar();

  const {
    data: materials,
    isLoading,
    error,
    refetch,
  } = useMaterials({
    search: searchTerm || undefined,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    isActive: true,
  });

  const { data: categories } = useMaterialCategories();
  const { mutate: createMaterial, isPending: isCreating } = useCreateMaterial();
  const { mutate: updateMaterial, isPending: isUpdating } = useUpdateMaterial();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryFilterChange = (event: SelectChangeEvent<string>) => {
    setCategoryFilter(event.target.value);
  };

  const handleOpenDialog = (material?: InventoryMaterial) => {
    setEditingMaterial(material || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMaterial(null);
  };

  const handleSort = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handleSubmit = (values: typeof initialValues) => {
    if (editingMaterial) {
      const data: UpdateInventoryMaterialDto = {
        name: values.name,
        category: values.category,
        unit: values.unit,
        internalCode: values.internalCode,
        manufacturer: values.manufacturer || undefined,
        description: values.description || undefined,
      };
      updateMaterial(
        { id: editingMaterial._id, data },
        {
          onSuccess: () => {
            openSnackbar({
              type: "success",
              message: "Material erfolgreich aktualisiert",
            });
            handleCloseDialog();
          },
          onError: () => {
            openSnackbar({
              type: "error",
              message: "Fehler beim Aktualisieren des Materials",
            });
          },
        },
      );
    } else {
      const data: CreateInventoryMaterialDto = {
        name: values.name,
        category: values.category,
        unit: values.unit,
        internalCode: values.internalCode,
        manufacturer: values.manufacturer || undefined,
        description: values.description || undefined,
      };
      createMaterial(data, {
        onSuccess: () => {
          openSnackbar({
            type: "success",
            message: "Material erfolgreich erstellt",
          });
          handleCloseDialog();
        },
        onError: () => {
          openSnackbar({
            type: "error",
            message: "Fehler beim Erstellen des Materials",
          });
        },
      });
    }
  };

  const initialValues = {
    name: editingMaterial?.name || "",
    category: editingMaterial?.category || "",
    unit: editingMaterial?.unit || "",
    internalCode: editingMaterial?.internalCode || "",
    manufacturer: editingMaterial?.manufacturer || "",
    description: editingMaterial?.description || "",
  };

  // Sort materials by name
  const sortedMaterials = materials
    ? [...materials].sort((a, b) => {
        const comparison = a.name.localeCompare(b.name, "de");
        return sortOrder === "asc" ? comparison : -comparison;
      })
    : [];

  const hasData = sortedMaterials.length > 0;

  // Common unit options
  const unitOptions = [
    { label: "Stück", value: "Stück" },
    { label: "Gramm (g)", value: "g" },
    { label: "Milliliter (ml)", value: "ml" },
    { label: "Millimeter (mm)", value: "mm" },
    { label: "Packung", value: "Packung" },
  ];

  // Unit display mapping
  const unitDisplayMap: Record<string, string> = {
    Stück: "Stück",
    g: "Gramm (g)",
    ml: "Milliliter (ml)",
    mm: "Millimeter (mm)",
    Packung: "Packung",
  };

  const getUnitDisplay = (unit: string): string => {
    return unitDisplayMap[unit] || unit;
  };

  return (
    <Stack flex="1" gap="20px" height="100%">
      <Typography
        variant="h2"
        sx={{
          color: "rgba(146, 146, 146, 1)",
        }}
      >
        Lagerverwaltung
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Fehler beim Laden der Materialien. Bitte versuchen Sie es erneut.
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
            gap: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <TextField
              size="small"
              placeholder="Material suchen..."
              value={searchTerm}
              onChange={handleSearchChange}
              sx={{ minWidth: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select
                value={categoryFilter}
                onChange={handleCategoryFilterChange}
                displayEmpty
                startAdornment={
                  <InputAdornment position="start">
                    <FilterAlt
                      fontSize="small"
                      sx={{ color: "rgba(104, 201, 242, 1)" }}
                    />
                  </InputAdornment>
                }
              >
                <MenuItem value="all">Alle Kategorien</MenuItem>
                {categories?.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <ButtonBlock
              onClick={() => handleOpenDialog()}
              style={{
                background: "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
                borderRadius: "40px",
                height: "40px",
                color: "white",
                fontSize: "14px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "0 20px",
              }}
            >
              <Add fontSize="small" />
              Material hinzufügen
            </ButtonBlock>
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

        <Stack flex={1} justifyContent="space-between">
          <TableContainer>
            <Table>
              <TableHead
                sx={{
                  backgroundColor: "rgba(232, 232, 232, 1)",
                }}
              >
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={true}
                      direction={sortOrder}
                      onClick={handleSort}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Interner Code</TableCell>
                  <TableCell>Kategorie</TableCell>
                  <TableCell>Einheit</TableCell>
                  <TableCell>Hersteller</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRowsLoader rowsNum={10} colNums={6} />
                ) : !hasData ? (
                  <EmptyTableState
                    colSpan={6}
                    message={
                      searchTerm
                        ? `Keine Materialien für "${searchTerm}" gefunden`
                        : "Keine Materialien vorhanden"
                    }
                  />
                ) : (
                  sortedMaterials.map((material) => (
                    <TableRow key={material._id} hover>
                      <TableCell>{material.name}</TableCell>
                      <TableCell>
                        <Typography
                          sx={{ fontFamily: "monospace", fontWeight: 500 }}
                        >
                          {material.internalCode}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={material.category}
                          size="small"
                          sx={{
                            backgroundColor: "rgba(104, 201, 242, 0.2)",
                            color: "rgba(104, 201, 242, 1)",
                          }}
                        />
                      </TableCell>
                      <TableCell>{getUnitDisplay(material.unit)}</TableCell>
                      <TableCell>{material.manufacturer || "-"}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(material)}
                            title="Bearbeiten"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <StyledLink
                            to={`/inventory/lots?material=${material._id}`}
                          >
                            <IconButton size="small" title="Chargen anzeigen">
                              <Inventory2
                                fontSize="small"
                                sx={{ color: "rgba(104, 201, 242, 1)" }}
                              />
                            </IconButton>
                          </StyledLink>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Paper>

      {/* Create/Edit Material Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          <Form>
            <DialogTitle>
              {editingMaterial ? "Material bearbeiten" : "Neues Material"}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={6}>
                  <TextFieldBlock name="name" label="Name *" />
                </Grid>
                <Grid size={6}>
                  <TextFieldBlock name="internalCode" label="Interner Code *" />
                </Grid>
                <Grid size={6}>
                  <TextFieldBlock name="category" label="Kategorie *" />
                </Grid>
                <Grid size={6}>
                  <SelectFieldBlock
                    name="unit"
                    label="Einheit *"
                    options={unitOptions}
                  />
                </Grid>
                <Grid size={12}>
                  <TextFieldBlock name="manufacturer" label="Hersteller" />
                </Grid>
                <Grid size={12}>
                  <TextFieldBlock
                    name="description"
                    label="Beschreibung"
                    multiline
                    minRows={3}
                  />
                </Grid>
              </Grid>
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
                disabled={isCreating || isUpdating}
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
                {editingMaterial ? "Speichern" : "Erstellen"}
              </ButtonBlock>
            </DialogActions>
          </Form>
        </Formik>
      </Dialog>
    </Stack>
  );
};

export default InventoryMaterials;
