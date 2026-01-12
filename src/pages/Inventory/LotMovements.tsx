// import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Typography,
  IconButton,
  Box,
  Paper,
  Stack,
  Alert,
  Chip,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Tooltip,
} from "@mui/material";
import {
  ArrowBack,
  OpenInNew,
  CalendarToday,
  ArrowForward,
} from "@mui/icons-material";
// import { Form, Formik } from "formik";
// import * as yup from "yup";
import { useLot, useMovementsByLot } from "../../api/inventory/hooks";
import {
  InventoryMaterial,
  InventoryMovement,
  MovementType,
  MovementReason,
} from "../../api/inventory/types";
import { formatDateTimeDE } from "../../utils/formatDate";
import StyledLink from "../../components/atoms/StyledLink";
import ResponsiveTable from "../../components/ResponsiveTable";

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

// Mobile card renderer for movements
const MovementMobileCard = ({
  movement,
  unit,
}: {
  movement: InventoryMovement;
  unit: string;
}) => {
  const isOutMovement = movement.movementType === "out";
  const isInMovement = movement.movementType === "in";

  return (
    <Box
      sx={{
        backgroundColor: isOutMovement
          ? "rgba(244, 67, 54, 0.08)"
          : isInMovement
            ? "rgba(76, 175, 80, 0.08)"
            : "white",
        borderRadius: 2,
        p: 2,
        m: -2,
        mb: -2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 1.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
          }}
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
        <Typography
          sx={{
            color:
              movement.movementType === "in"
                ? "#4caf50"
                : movement.movementType === "out"
                  ? "#f44336"
                  : "inherit",
            fontWeight: 600,
            fontSize: "16px",
          }}
        >
          {movement.movementType === "in" ? "+" : "-"}
          {movement.quantity} {unit}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          mb: 1.5,
        }}
      >
        <CalendarToday sx={{ fontSize: 16, color: "text.secondary" }} />
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontVariantNumeric: "tabular-nums" }}
        >
          {formatDateTimeDE(movement.performedAt)}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
          mb: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontVariantNumeric: "tabular-nums" }}
          >
            {movement.quantityBefore}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <ArrowForward sx={{ fontSize: 14, verticalAlign: "middle" }} />
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, fontVariantNumeric: "tabular-nums" }}
          >
            {movement.quantityAfter}
          </Typography>
        </Box>
      </Box>

      {movement.notes && (
        <Box sx={{ mb: 1.5 }}>
          {movement.notes.includes("Laborzettel") ? (
            <>
              <Typography variant="body2" color="text.secondary">
                {movement.notes.split(/Laborzettel\s*/)[0].trim()}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, fontFamily: "monospace" }}
              >
                {movement.notes.match(/Laborzettel\s*(.+)/)?.[1] || ""}
              </Typography>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {movement.notes}
            </Typography>
          )}
        </Box>
      )}

      {movement.labRequest && (
        <Box sx={{ width: "100%" }}>
          <StyledLink to={`/lab/requests/${movement.labRequest}`}>
            <Chip
              label="Laborzettel"
              size="medium"
              icon={<OpenInNew sx={{ fontSize: 16 }} />}
              sx={{
                width: "100%",
                backgroundColor: "rgba(92, 107, 192, 0.15)",
                color: "#5C6BC0",
                cursor: "pointer",
                fontSize: "14px",
                height: "36px",
                "& .MuiChip-icon": { color: "#5C6BC0" },
                "& .MuiChip-label": { fontWeight: 700 },
              }}
            />
          </StyledLink>
        </Box>
      )}
    </Box>
  );
};

const LotMovements = () => {
  const { lotId } = useParams<{ lotId: string }>();
  const navigate = useNavigate();

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
        <Card
          sx={{
            borderRadius: "10px",
            borderBottomLeftRadius: "0",
            borderBottomRightRadius: "0",
          }}
        >
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
          borderRadius: { xs: 0, sm: "10px" },
          background: "rgba(255, 255, 255, 1)",
          display: "flex",
          flexDirection: "column",
          flex: "1",
          overflow: "hidden",
        }}
      >
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
            <ResponsiveTable<InventoryMovement>
              data={movements || []}
              columns={[
                {
                  id: "performedAt",
                  label: "Datum",
                  accessor: (m) => formatDateTimeDE(m.performedAt),
                  width: 150,
                },
                {
                  id: "movementType",
                  label: "Bewegung",
                  accessor: (m) => (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip
                        label={movementTypeLabels[m.movementType]}
                        size="small"
                        color={movementTypeColors[m.movementType]}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {reasonLabels[m.reason]}
                      </Typography>
                    </Box>
                  ),
                  width: 180,
                },
                {
                  id: "quantity",
                  label: "Menge",
                  accessor: (m) => (
                    <Typography
                      sx={{
                        color:
                          m.movementType === "in"
                            ? "#4caf50"
                            : m.movementType === "out"
                              ? "#f44336"
                              : "inherit",
                        fontWeight: 600,
                        fontSize: "15px",
                      }}
                    >
                      {m.movementType === "in" ? "+" : "-"}
                      {m.quantity} {lot?.unit}
                    </Typography>
                  ),
                  width: 100,
                },
                {
                  id: "stock",
                  label: "Bestand",
                  accessor: (m) => (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontVariantNumeric: "tabular-nums" }}
                      >
                        {m.quantityBefore}
                      </Typography>
                      <ArrowForward
                        sx={{ fontSize: 14, color: "text.secondary" }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 500,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {m.quantityAfter}
                      </Typography>
                    </Box>
                  ),
                  width: 120,
                },
                {
                  id: "labRequest",
                  label: "Verwendung",
                  accessor: (m) =>
                    m.labRequest ? (
                      <Tooltip title="Zum Laborauftrag">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <StyledLink to={`/lab/requests/${m.labRequest}`}>
                            <Chip
                              label="Laborzettel"
                              size="small"
                              icon={<OpenInNew sx={{ fontSize: 14 }} />}
                              sx={{
                                backgroundColor: "rgba(92, 107, 192, 0.1)",
                                color: "#5C6BC0",
                                cursor: "pointer",
                                "& .MuiChip-icon": { color: "#5C6BC0" },
                              }}
                            />
                          </StyledLink>
                        </Box>
                      </Tooltip>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        -
                      </Typography>
                    ),
                  width: 120,
                },
                {
                  id: "notes",
                  label: "Notizen",
                  accessor: (m) => (
                    <Typography variant="body2">{m.notes || "-"}</Typography>
                  ),
                  width: 150,
                },
              ]}
              mobileCardRenderer={(movement) => (
                <MovementMobileCard
                  movement={movement}
                  unit={lot?.unit || ""}
                />
              )}
              isLoading={isLoading}
              emptyMessage="Keine Bewegungen vorhanden"
              getItemId={(m) => m._id}
            />
          </Box>
        </Box>
      </Paper>
    </Stack>
  );
};

export default LotMovements;
