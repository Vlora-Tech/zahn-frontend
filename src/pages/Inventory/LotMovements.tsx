// import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  // Dialog,
  // DialogTitle,
  // DialogContent,
  // DialogActions,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import { ArrowBack, OpenInNew } from "@mui/icons-material";
// import { Form, Formik } from "formik";
// import * as yup from "yup";
import { useLot, useMovementsByLot } from "../../api/inventory/hooks";
import {
  InventoryMaterial,
  MovementType,
  MovementReason,
} from "../../api/inventory/types";
import TableRowsLoader from "../../components/molecules/TableRowsLoader";
import EmptyTableState from "../../components/molecules/EmptyTableState";
// import ButtonBlock from "../../components/atoms/ButtonBlock";
// import TextFieldBlock from "../../components/molecules/form-fields/TextFieldBlock";
// import { useSnackbar } from "../../context/SnackbarContext";
import { formatDateTimeDE } from "../../utils/formatDate";
import StyledLink from "../../components/atoms/StyledLink";

const movementTypeLabels: Record<MovementType, string> = {
  in: "Eingang",
  out: "Ausgang",
  adjustment: "Korrektur",
};

const movementTypeColors: Record<MovementType, "success" | "error" | "info"> = {
  in: "success",
  out: "error",
  adjustment: "info",
};

const reasonLabels: Record<MovementReason, string> = {
  initial_stock: "Erstbestand",
  restock: "Nachbestellung",
  usage: "Verbrauch",
  return: "Rückgabe",
  adjustment: "Korrektur",
  expired: "Abgelaufen",
  damaged: "Beschädigt",
};

// Commented out - will be used when lot selection in Laborzettel triggers material usage
// const validationSchema = yup.object({
//   quantity: yup
//     .number()
//     .required("Menge ist erforderlich")
//     .positive("Menge muss positiv sein"),
//   notes: yup.string(),
// });

// type MovementAction = "restock" | "use" | "return";

const LotMovements = () => {
  const { lotId } = useParams<{ lotId: string }>();
  const navigate = useNavigate();
  // const { openSnackbar } = useSnackbar();

  // Commented out - will be used when lot selection in Laborzettel triggers material usage
  // const [dialogOpen, setDialogOpen] = useState(false);
  // const [movementAction, setMovementAction] = useState<MovementAction>("use");

  const {
    data: lot,
    isLoading: lotLoading,
    error: lotError,
  } = useLot(lotId || "");
  const {
    data: movements,
    isLoading: movementsLoading,
    error: movementsError,
  } = useMovementsByLot(lotId || "");

  // Commented out - will be used when lot selection in Laborzettel triggers material usage
  // const { mutate: restockLot, isPending: isRestocking } = useRestockLot();
  // const { mutate: useMaterial, isPending: isUsing } = useUseMaterialFromStock();
  // const { mutate: returnMaterial, isPending: isReturning } = useReturnMaterial();

  const getMaterialName = (): string => {
    if (!lot) return "";
    if (typeof lot.material === "string") return lot.material;
    return (lot.material as InventoryMaterial).name;
  };

  const getStockPercentage = (): number => {
    if (!lot || lot.initialQuantity === 0) return 0;
    return (lot.currentQuantity / lot.initialQuantity) * 100;
  };

  // Commented out - will be used when lot selection in Laborzettel triggers material usage
  // const handleOpenDialog = (action: MovementAction) => {
  //   setMovementAction(action);
  //   setDialogOpen(true);
  // };

  // const handleCloseDialog = () => {
  //   setDialogOpen(false);
  // };

  // const handleSubmit = (
  //   values: { quantity: string; notes: string },
  //   { resetForm }: { resetForm: () => void },
  // ) => {
  //   const quantity = Number(values.quantity);
  //   const notes = values.notes || undefined;

  //   const onSuccess = () => {
  //     openSnackbar({
  //       type: "success",
  //       message:
  //         movementAction === "restock"
  //           ? "Bestand erfolgreich aufgefüllt"
  //           : movementAction === "use"
  //             ? "Material erfolgreich entnommen"
  //             : "Material erfolgreich zurückgegeben",
  //     });
  //     resetForm();
  //     handleCloseDialog();
  //   };

  //   const onError = () => {
  //     openSnackbar({
  //       type: "error",
  //       message: "Fehler bei der Bestandsbewegung",
  //     });
  //   };

  //   if (movementAction === "restock") {
  //     restockLot({ lotId: lotId!, quantity, notes }, { onSuccess, onError });
  //   } else if (movementAction === "use") {
  //     useMaterial({ lotId: lotId!, quantity, notes }, { onSuccess, onError });
  //   } else {
  //     returnMaterial(
  //       { lotId: lotId!, quantity, notes },
  //       { onSuccess, onError },
  //     );
  //   }
  // };

  const isLoading = lotLoading || movementsLoading;
  const error = lotError || movementsError;
  const hasMovements = movements && movements.length > 0;

  // Commented out - will be used when lot selection in Laborzettel triggers material usage
  // const actionLabels: Record<MovementAction, string> = {
  //   restock: "Bestand auffüllen",
  //   use: "Material entnehmen",
  //   return: "Material zurückgeben",
  // };

  const getMaterialId = (): string => {
    if (!lot) return "";
    if (typeof lot.material === "string") return lot.material;
    return (lot.material as InventoryMaterial)._id;
  };

  return (
    <Stack flex="1" gap="20px" height="100%">
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton
          onClick={() =>
            navigate(`/inventory/lots?material=${getMaterialId()}`)
          }
        >
          <ArrowBack />
        </IconButton>
        <Typography
          variant="h2"
          sx={{
            color: "rgba(146, 146, 146, 1)",
          }}
        >
          Chargen-Bewegungen
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Fehler beim Laden der Daten. Bitte versuchen Sie es erneut.
        </Alert>
      )}

      {/* Lot Info Card */}
      {lot && (
        <Card sx={{ borderRadius: "10px" }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Material
                </Typography>
                <Typography variant="h6">{getMaterialName()}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Chargennummer
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontFamily: "monospace", fontWeight: 500 }}
                >
                  {lot.lotNumber}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Aktueller Bestand
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="body1" fontWeight={500}>
                      {lot.currentQuantity} / {lot.initialQuantity} {lot.unit}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {getStockPercentage().toFixed(0)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={getStockPercentage()}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: "rgba(0,0,0,0.1)",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor:
                          getStockPercentage() <= 10
                            ? "#f44336"
                            : getStockPercentage() <= 30
                              ? "#ff9800"
                              : "#4caf50",
                      },
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons - Commented out for now
         The logic will be: when the lab technician selects a lot nr. material 
         in the Laborzettel, they will specify how much they took out of it.
         This is the only scenario flow where we can take out something from the batch.
      */}

      {/* Movements Table */}
      <Paper
        sx={{
          borderRadius: "10px",
          background: "rgba(255, 255, 255, 1)",
          display: "flex",
          flexDirection: "column",
          flex: "1",
        }}
      >
        <Stack flex={1}>
          <TableContainer>
            <Table>
              <TableHead
                sx={{
                  backgroundColor: "rgba(232, 232, 232, 1)",
                }}
              >
                <TableRow>
                  <TableCell>Datum</TableCell>
                  <TableCell>Bewegung</TableCell>
                  <TableCell>Menge</TableCell>
                  <TableCell>Bestand</TableCell>
                  <TableCell>Verwendung</TableCell>
                  <TableCell>Notizen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRowsLoader rowsNum={10} colNums={6} />
                ) : !hasMovements ? (
                  <EmptyTableState
                    colSpan={6}
                    message="Keine Bewegungen vorhanden"
                  />
                ) : (
                  movements?.map((movement) => (
                    <TableRow
                      key={movement._id}
                      hover
                      sx={{
                        backgroundColor:
                          movement.movementType === "out"
                            ? "rgba(244, 67, 54, 0.04)"
                            : movement.movementType === "in" &&
                                movement.reason !== "initial_stock"
                              ? "rgba(76, 175, 80, 0.04)"
                              : "inherit",
                      }}
                    >
                      <TableCell sx={{ fontVariantNumeric: "tabular-nums" }}>
                        {formatDateTimeDE(movement.performedAt)}
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Chip
                            label={movementTypeLabels[movement.movementType]}
                            size="small"
                            color={movementTypeColors[movement.movementType]}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {reasonLabels[movement.reason]}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          sx={{
                            color:
                              movement.movementType === "in"
                                ? "#4caf50"
                                : movement.movementType === "out"
                                  ? "#f44336"
                                  : "inherit",
                            fontWeight: 600,
                            fontSize: "15px",
                          }}
                        >
                          {movement.movementType === "in" ? "+" : "-"}
                          {movement.quantity} {lot?.unit}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontVariantNumeric: "tabular-nums" }}
                          >
                            {movement.quantityBefore}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            →
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              fontVariantNumeric: "tabular-nums",
                            }}
                          >
                            {movement.quantityAfter}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {movement.labRequest ? (
                          <Tooltip title="Zum Laborauftrag">
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <StyledLink
                                to={`/lab/requests/${movement.labRequest}`}
                              >
                                <Chip
                                  label="Laborzettel"
                                  size="small"
                                  icon={<OpenInNew sx={{ fontSize: 14 }} />}
                                  sx={{
                                    backgroundColor: "rgba(92, 107, 192, 0.1)",
                                    color: "#5C6BC0",
                                    cursor: "pointer",
                                    "& .MuiChip-icon": {
                                      color: "#5C6BC0",
                                    },
                                  }}
                                />
                              </StyledLink>
                            </Box>
                          </Tooltip>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {movement.notes || "-"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Paper>

      {/* Movement Dialog - Commented out for now
         Will be used when lot selection in Laborzettel triggers material usage
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
      >
        <Formik
          initialValues={{ quantity: "", notes: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          <Form>
            <DialogTitle>{actionLabels[movementAction]}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid size={12}>
                  <TextFieldBlock
                    name="quantity"
                    label={`Menge (${lot?.unit || ""})`}
                    type="number"
                  />
                  {movementAction === "use" && lot && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 0.5, display: "block" }}
                    >
                      Verfügbar: {lot.currentQuantity} {lot.unit}
                    </Typography>
                  )}
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
                disabled={isRestocking || isUsing || isReturning}
                style={{
                  background:
                    movementAction === "use"
                      ? "linear-gradient(90deg, #f44336 0%, #ff9800 100%)"
                      : "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
                  borderRadius: "40px",
                  height: "40px",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                Bestätigen
              </ButtonBlock>
            </DialogActions>
          </Form>
        </Formik>
      </Dialog>
      */}
    </Stack>
  );
};

export default LotMovements;
