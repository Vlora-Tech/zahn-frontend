import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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
  LinearProgress,
  InputAdornment,
} from "@mui/material";
import {
  Refresh,
  Add,
  FilterAlt,
  History,
  ArrowBack,
  Print,
  Settings,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { Form, Formik } from "formik";
import * as yup from "yup";
import {
  useLots,
  useCreateLot,
  useInventoryMaterial,
} from "../../api/inventory/hooks";
import {
  InventoryLot,
  InventoryMaterial,
  CreateInventoryLotDto,
  LotStatus,
} from "../../api/inventory/types";
import TableRowsLoader from "../../components/molecules/TableRowsLoader";
import EmptyTableState from "../../components/molecules/EmptyTableState";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import TextFieldBlock from "../../components/molecules/form-fields/TextFieldBlock";
import { useSnackbar } from "../../context/SnackbarContext";
import { formatDateDE } from "../../utils/formatDate";
import StyledLink from "../../components/atoms/StyledLink";

const validationSchema = yup.object({
  lotNumber: yup.string().required("Lot Nummer ist erforderlich"),
  initialQuantity: yup
    .number()
    .required("Menge ist erforderlich")
    .positive("Menge muss positiv sein"),
  supplier: yup.string().required("Lieferant ist erforderlich"),
  supplierLotNumber: yup
    .string()
    .required("Lieferanten-Chargennr. ist erforderlich"),
  deliveryDate: yup.string().required("Lieferdatum ist erforderlich"),
  expiryDate: yup.string().required("Ablaufdatum ist erforderlich"),
  notes: yup.string(),
});

const statusLabels: Record<LotStatus, string> = {
  in_stock: "Auf Lager",
  low_stock: "Niedriger Bestand",
  depleted: "Aufgebraucht",
  expired: "Abgelaufen",
};

const statusColors: Record<
  LotStatus,
  "success" | "warning" | "error" | "default"
> = {
  in_stock: "success",
  low_stock: "warning",
  depleted: "default",
  expired: "error",
};

const InventoryLots = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const materialIdFromUrl = searchParams.get("material");

  const [statusFilter, setStatusFilter] = useState<LotStatus | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { openSnackbar } = useSnackbar();

  // Fetch the material details
  const { data: material } = useInventoryMaterial(materialIdFromUrl || "");

  const {
    data: lots,
    isLoading,
    error,
    refetch,
  } = useLots({
    materialId: materialIdFromUrl || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const { mutate: createLot, isPending: isCreating } = useCreateLot();

  const handleStatusFilterChange = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value as LotStatus | "all");
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleGoBack = () => {
    navigate("/inventory/materials");
  };

  const handleSubmit = (
    values: typeof initialValues,
    { resetForm }: { resetForm: () => void },
  ) => {
    if (!materialIdFromUrl || !material) return;

    const data: CreateInventoryLotDto = {
      materialId: materialIdFromUrl,
      lotNumber: values.lotNumber,
      initialQuantity: Number(values.initialQuantity),
      unit: material.unit,
      deliveryDate: values.deliveryDate,
      expiryDate: values.expiryDate,
      supplier: values.supplier,
      supplierLotNumber: values.supplierLotNumber,
      notes: values.notes || undefined,
    };
    createLot(data, {
      onSuccess: () => {
        openSnackbar({
          type: "success",
          message: "Charge erfolgreich erstellt",
        });
        resetForm();
        handleCloseDialog();
      },
      onError: () => {
        openSnackbar({
          type: "error",
          message: "Fehler beim Erstellen der Charge",
        });
      },
    });
  };

  const getMaterialUnit = (lot: InventoryLot): string => {
    if (typeof lot.material === "string") return lot.unit;
    return (lot.material as InventoryMaterial).unit || lot.unit;
  };

  const getStockPercentage = (lot: InventoryLot): number => {
    if (lot.initialQuantity === 0) return 0;
    return (lot.currentQuantity / lot.initialQuantity) * 100;
  };

  const getExpiryDateUrgency = (
    lot: InventoryLot,
  ): "expired" | "expiring_soon" | "normal" => {
    if (!lot.expiryDate) return "normal";
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiryDate = new Date(lot.expiryDate);
    expiryDate.setHours(0, 0, 0, 0);

    if (expiryDate < today) return "expired";

    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    if (expiryDate <= thirtyDaysFromNow) return "expiring_soon";
    return "normal";
  };

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

  const initialValues = {
    lotNumber: "",
    initialQuantity: "",
    supplier: "",
    supplierLotNumber: "",
    deliveryDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    notes: "",
  };

  const hasData = lots && lots.length > 0;
  const materialName = material?.name || "Material";

  // Redirect if no material is selected
  if (!materialIdFromUrl) {
    return (
      <Stack flex="1" gap="20px" height="100%">
        <Alert severity="warning">
          Bitte wählen Sie zuerst ein Material aus der Lagerverwaltung.
        </Alert>
        <ButtonBlock
          onClick={() => navigate("/inventory/materials")}
          style={{
            background: "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
            borderRadius: "40px",
            height: "40px",
            color: "white",
            fontSize: "14px",
            fontWeight: "500",
            width: "fit-content",
          }}
        >
          Zur Lagerverwaltung
        </ButtonBlock>
      </Stack>
    );
  }

  return (
    <Stack flex="1" gap="20px" height="100%">
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton onClick={handleGoBack}>
          <ArrowBack />
        </IconButton>
        <Typography
          variant="h2"
          sx={{
            color: "rgba(146, 146, 146, 1)",
          }}
        >
          {materialName}{" "}
          <Typography
            component="span"
            variant="h2"
            sx={{ color: "rgba(146, 146, 146, 0.6)" }}
          >
            / Chargenverwaltung
          </Typography>
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Fehler beim Laden der Chargen. Bitte versuchen Sie es erneut.
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
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select
                value={statusFilter}
                onChange={handleStatusFilterChange}
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
                <MenuItem value="all">Alle Status</MenuItem>
                <MenuItem value="in_stock">Auf Lager</MenuItem>
                <MenuItem value="low_stock">Niedriger Bestand</MenuItem>
                <MenuItem value="depleted">Aufgebraucht</MenuItem>
                <MenuItem value="expired">Abgelaufen</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <ButtonBlock
              onClick={handleOpenDialog}
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
              Charge hinzufügen
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
                  <TableCell>Lot Nr.</TableCell>
                  <TableCell>Bestand</TableCell>
                  <TableCell>Lieferant</TableCell>
                  <TableCell>Lieferanten-Chargennr.</TableCell>
                  <TableCell>Lieferdatum</TableCell>
                  <TableCell>Ablaufdatum</TableCell>
                  <TableCell>Lager-Stand</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRowsLoader rowsNum={10} colNums={8} />
                ) : !hasData ? (
                  <EmptyTableState
                    colSpan={8}
                    message="Keine Chargen für dieses Material gefunden"
                  />
                ) : (
                  lots?.map((lot) => (
                    <TableRow key={lot._id} hover>
                      <TableCell>
                        <Typography
                          sx={{ fontFamily: "monospace", fontWeight: 500 }}
                        >
                          {lot.lotNumber}
                        </Typography>
                        {lot.isManualEntry && (
                          <Chip
                            label="Manuell"
                            size="small"
                            sx={{ ml: 1, fontSize: "10px", height: "18px" }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ minWidth: 120 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mb: 0.5,
                            }}
                          >
                            <Typography variant="body2">
                              {lot.currentQuantity} / {lot.initialQuantity}{" "}
                              {getMaterialUnit(lot)}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={getStockPercentage(lot)}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: "rgba(0,0,0,0.1)",
                              "& .MuiLinearProgress-bar": {
                                backgroundColor:
                                  getStockPercentage(lot) <= 10
                                    ? "#f44336"
                                    : getStockPercentage(lot) <= 30
                                      ? "#ff9800"
                                      : "#4caf50",
                              },
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>{lot.supplier || "-"}</TableCell>
                      <TableCell>{lot.supplierLotNumber || "-"}</TableCell>
                      <TableCell sx={{ fontVariantNumeric: "tabular-nums" }}>
                        {formatDateDE(lot.deliveryDate)}
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                            whiteSpace: "nowrap",
                            fontVariantNumeric: "tabular-nums",
                            ...(getExpiryDateUrgency(lot) === "expired" && {
                              color: "#C62828",
                              fontWeight: 600,
                            }),
                            ...(getExpiryDateUrgency(lot) ===
                              "expiring_soon" && {
                              color: "#F9A825",
                              fontWeight: 600,
                            }),
                          }}
                        >
                          {lot.expiryDate ? formatDateDE(lot.expiryDate) : "-"}
                          {getExpiryDateUrgency(lot) !== "normal" && (
                            <ErrorIcon
                              sx={{
                                fontSize: 18,
                                color:
                                  getExpiryDateUrgency(lot) === "expired"
                                    ? "#C62828"
                                    : "#F9A825",
                              }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusLabels[lot.status]}
                          size="small"
                          color={statusColors[lot.status]}
                        />
                      </TableCell>
                      <TableCell>
                        <StyledLink to={`/inventory/lots/${lot._id}/movements`}>
                          <IconButton size="small" title="Bewegungen anzeigen">
                            <History
                              fontSize="small"
                              sx={{ color: "rgba(104, 201, 242, 1)" }}
                            />
                          </IconButton>
                        </StyledLink>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Paper>

      {/* Create Lot Dialog */}
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
              {materialName}{" "}
              <Typography
                component="span"
                sx={{ color: "rgba(146, 146, 146, 0.6)" }}
              >
                / Neue Charge hinzufügen
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={12}>
                  <TextFieldBlock name="lotNumber" label="Lot Nummer *" />
                </Grid>
                <Grid size={6}>
                  <TextFieldBlock name="supplier" label="Lieferant *" />
                </Grid>
                <Grid size={6}>
                  <TextFieldBlock
                    name="supplierLotNumber"
                    label="Lieferanten-Chargennr. *"
                  />
                </Grid>
                <Grid size={6}>
                  <TextFieldBlock
                    name="deliveryDate"
                    label="Lieferdatum *"
                    type="date"
                  />
                </Grid>
                <Grid size={6}>
                  <TextFieldBlock
                    name="expiryDate"
                    label="Ablaufdatum *"
                    type="date"
                  />
                </Grid>
                <Grid size={12}>
                  <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <TextFieldBlock
                        name="initialQuantity"
                        label="Menge *"
                        type="number"
                      />
                    </Box>
                    <Typography
                      variant="body1"
                      sx={{
                        pb: 1,
                        color: "rgba(107, 107, 107, 1)",
                        fontWeight: 500,
                      }}
                    >
                      {material ? getUnitDisplay(material.unit) : ""}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={12}>
                  <TextFieldBlock
                    name="notes"
                    label="Notizen"
                    multiline
                    minRows={2}
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
                disabled={isCreating}
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
                Erstellen
              </ButtonBlock>
            </DialogActions>
          </Form>
        </Formik>
      </Dialog>
    </Stack>
  );
};

export default InventoryLots;
