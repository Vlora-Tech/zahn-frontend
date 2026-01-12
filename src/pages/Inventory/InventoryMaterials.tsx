import { useState, useMemo } from "react";
import {
  Typography,
  IconButton,
  Box,
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
  InputLabel,
  useTheme,
  useMediaQuery,
  Fab,
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
import ButtonBlock from "../../components/atoms/ButtonBlock";
import TextFieldBlock from "../../components/molecules/form-fields/TextFieldBlock";
import SelectFieldBlock from "../../components/molecules/form-fields/SelectFieldBlock";
import { useSnackbar } from "../../context/SnackbarContext";
import StyledLink from "../../components/atoms/StyledLink";
import ResponsiveTable, { ColumnDef } from "../../components/ResponsiveTable";
import MobileFilterPanel from "../../components/MobileFilterPanel";

const validationSchema = yup.object({
  name: yup.string().required("Name ist erforderlich"),
  category: yup.string().required("Kategorie ist erforderlich"),
  unit: yup.string().required("Einheit ist erforderlich"),
  internalCode: yup.string().required("Interner Code ist erforderlich"),
  manufacturer: yup.string(),
  description: yup.string(),
});

const unitOptions = [
  { label: "Stück", value: "Stück" },
  { label: "Gramm (g)", value: "g" },
  { label: "Milliliter (ml)", value: "ml" },
  { label: "Millimeter (mm)", value: "mm" },
  { label: "Packung", value: "Packung" },
];

const unitDisplayMap: Record<string, string> = {
  Stück: "Stück",
  g: "Gramm (g)",
  ml: "Milliliter (ml)",
  mm: "Millimeter (mm)",
  Packung: "Packung",
};

const getUnitDisplay = (unit: string): string => unitDisplayMap[unit] || unit;

// Mobile card renderer for materials
const MaterialMobileCard = ({
  material,
  onEdit,
}: {
  material: InventoryMaterial;
  onEdit: (material: InventoryMaterial) => void;
}) => {
  return (
    <Box>
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 600, color: "rgba(51, 51, 51, 1)", mb: 0.5 }}
      >
        {material.name}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "rgba(146, 146, 146, 1)", fontFamily: "monospace", mb: 1 }}
      >
        {material.internalCode}
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          alignItems: "center",
          mb: 2,
        }}
      >
        <Chip
          label={material.category}
          size="small"
          sx={{
            backgroundColor: "rgba(104, 201, 242, 0.2)",
            color: "rgba(104, 201, 242, 1)",
          }}
        />
        <Typography variant="body2" sx={{ color: "rgba(100, 100, 100, 1)" }}>
          {getUnitDisplay(material.unit)}
        </Typography>
      </Box>
      <Stack spacing={2}>
        <ButtonBlock
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            onEdit(material);
          }}
          startIcon={<Edit />}
          style={{
            borderRadius: "40px",
            height: "44px",
            color: "rgba(104, 201, 242, 1)",
            border: "1px solid rgba(104, 201, 242, 1)",
            fontSize: "14px",
            fontWeight: "500",
            width: "100%",
          }}
        >
          Bearbeiten
        </ButtonBlock>
        <Box sx={{ width: "100%" }}>
          <StyledLink to={`/inventory/lots?material=${material._id}`}>
            <ButtonBlock
              startIcon={<Inventory2 />}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              style={{
                background: "white",
                borderRadius: "40px",
                height: "44px",
                color: "#87C133",
                border: "1px solid #87C133",
                fontSize: "14px",
                fontWeight: "500",
                width: "100%",
              }}
            >
              Chargen anzeigen
            </ButtonBlock>
          </StyledLink>
        </Box>
      </Stack>
    </Box>
  );
};

const InventoryMaterials = () => {
  const { openSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] =
    useState<InventoryMaterial | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

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

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) =>
    setSearchTerm(event.target.value);
  const handleCategoryFilterChange = (event: SelectChangeEvent<string>) =>
    setCategoryFilter(event.target.value);

  // Count active filters for mobile filter panel
  const activeFilterCount = useMemo(() => {
    return categoryFilter !== "all" ? 1 : 0;
  }, [categoryFilter]);

  // Clear all filters
  const handleClearFilters = () => {
    setCategoryFilter("all");
  };

  const handleOpenDialog = (material?: InventoryMaterial) => {
    setEditingMaterial(material || null);
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMaterial(null);
  };
  const handleSort = () => setSortOrder(sortOrder === "asc" ? "desc" : "asc");

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

  const sortedMaterials = materials
    ? [...materials].sort((a, b) => {
        const comparison = a.name.localeCompare(b.name, "de");
        return sortOrder === "asc" ? comparison : -comparison;
      })
    : [];

  const mobileCardRenderer = (material: InventoryMaterial) => (
    <MaterialMobileCard material={material} onEdit={handleOpenDialog} />
  );

  const columns: ColumnDef<InventoryMaterial>[] = [
    {
      id: "name",
      label: "Name",
      accessor: (m) => m.name,
      sortable: true,
      width: 200,
    },
    {
      id: "internalCode",
      label: "Interner Code",
      accessor: (m) => (
        <Typography sx={{ fontFamily: "monospace", fontWeight: 500 }}>
          {m.internalCode}
        </Typography>
      ),
      width: 150,
    },
    {
      id: "category",
      label: "Kategorie",
      accessor: (m) => (
        <Chip
          label={m.category}
          size="small"
          sx={{
            backgroundColor: "rgba(104, 201, 242, 0.2)",
            color: "rgba(104, 201, 242, 1)",
          }}
        />
      ),
      width: 150,
    },
    {
      id: "unit",
      label: "Einheit",
      accessor: (m) => getUnitDisplay(m.unit),
      width: 120,
    },
    {
      id: "manufacturer",
      label: "Hersteller",
      accessor: (m) => m.manufacturer || "-",
      width: 150,
    },
    {
      id: "actions",
      label: "",
      accessor: (m) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDialog(m);
            }}
            title="Bearbeiten"
          >
            <Edit fontSize="small" />
          </IconButton>
          <StyledLink to={`/inventory/lots?material=${m._id}`}>
            <IconButton size="small" title="Chargen anzeigen">
              <Inventory2
                fontSize="small"
                sx={{ color: "rgba(104, 201, 242, 1)" }}
              />
            </IconButton>
          </StyledLink>
        </Box>
      ),
      width: 100,
    },
  ];

  return (
    <Stack
      flex="1"
      gap="20px"
      height="100%"
      sx={{ overflow: "hidden", minWidth: 0 }}
    >
      <Typography variant="h2" sx={{ color: "rgba(146, 146, 146, 1)" }}>
        Lagerverwaltung
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Fehler beim Laden der Materialien. Bitte versuchen Sie es erneut.
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

            {/* Mobile Filter Panel */}
            {isMobile && (
              <MobileFilterPanel
                activeFilterCount={activeFilterCount}
                onClearFilters={handleClearFilters}
              >
                <FormControl size="small" fullWidth>
                  <InputLabel id="mobile-category-filter-label">
                    Kategorie
                  </InputLabel>
                  <Select
                    labelId="mobile-category-filter-label"
                    value={categoryFilter}
                    onChange={handleCategoryFilterChange}
                    label="Kategorie"
                  >
                    <MenuItem value="all">Alle Kategorien</MenuItem>
                    {categories?.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </MobileFilterPanel>
            )}

            {/* Desktop/Tablet Filter Controls */}
            <FormControl
              size="small"
              sx={{ minWidth: 150, display: { xs: "none", sm: "flex" } }}
            >
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
            <ResponsiveTable<InventoryMaterial>
              data={sortedMaterials}
              columns={columns}
              mobileCardRenderer={mobileCardRenderer}
              isLoading={isLoading}
              emptyMessage={
                searchTerm
                  ? `Keine Materialien für "${searchTerm}" gefunden`
                  : "Keine Materialien vorhanden"
              }
              getItemId={(m) => m._id}
              sortBy="name"
              sortOrder={sortOrder}
              onSort={handleSort}
            />
          </Box>
        </Box>
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
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
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextFieldBlock name="name" label="Name *" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextFieldBlock name="internalCode" label="Interner Code *" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextFieldBlock name="category" label="Kategorie *" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
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
                disabled={isCreating || isUpdating}
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
                {editingMaterial ? "Speichern" : "Erstellen"}
              </ButtonBlock>
            </DialogActions>
          </Form>
        </Formik>
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

export default InventoryMaterials;
