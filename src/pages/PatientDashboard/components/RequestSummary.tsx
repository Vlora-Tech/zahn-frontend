import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import TeethSelection from "../../../components/TeethSelection";
import ZoomableTeethSelection from "../../../components/ZoomableTeethSelection";
import PatientInfoCard from "./ui/PatientInfoCard";
import ValueFieldBlock from "../../../components/molecules/form-fields/ValueFieldBlock";
import { Delete, Edit, ExpandMore, HorizontalRule } from "@mui/icons-material";
import OperationChip from "./ui/OperationChip";
import { isEmpty } from "lodash";
import ButtonBlock from "../../../components/atoms/ButtonBlock";
import { OperationSchema } from "..";
import { useState } from "react";

const RequestSummary = (props) => {
  const {
    patientData,
    configuredOperations,
    handleEditOperation,
    handleDeleteOperation,
    handleEditPatientInfo,
    hideActionButtons = false,
    selectedTeethRequest,
    selectedConnectorsRequest,
    teethRequestColorMap,
    connectorsRequestColorMap,
    selectedShade,
    selectedImpression,
    notes,
    setNotes,
  } = props;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // < 600px

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [operationToDelete, setOperationToDelete] =
    useState<OperationSchema | null>(null);

  const handleDeleteClick = (operation: OperationSchema) => {
    setOperationToDelete(operation);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (operationToDelete) {
      handleDeleteOperation(operationToDelete);
      setDeleteDialogOpen(false);
      setOperationToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setOperationToDelete(null);
  };

  return (
    <Stack flexDirection={"column"} gap={"20px"}>
      {patientData && (
        <PatientInfoCard
          patientData={patientData}
          handleEditPatientInfo={handleEditPatientInfo}
          hideEditButton={hideActionButtons}
          notes={notes}
          setNotes={setNotes}
        />
      )}
      <Stack
        flexDirection={{ xs: "column-reverse", md: "row" }}
        flex={1}
        gap={"20px"}
      >
        <Stack flexDirection={"column"} gap={"20px"} flex={1}>
          {configuredOperations?.map((configuredOperation: OperationSchema) => (
            <Accordion
              sx={{
                padding: "20px",
              }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box flex="1">
                  <OperationChip
                    category={configuredOperation?.operation?.category}
                    color={configuredOperation?.operation?.color}
                    label={configuredOperation?.operation?.label}
                    id={configuredOperation?.operation?.id}
                    selected
                  />
                </Box>

                {!hideActionButtons && (
                  <Stack flexDirection="row" gap="24px">
                    <ButtonBlock
                      startIcon={<Delete />}
                      onClick={() => handleDeleteClick(configuredOperation)}
                      style={{
                        marginLeft: "auto",
                        marginRight: "8px",
                        borderRadius: "40px",
                        height: "40px",
                        color: "red",
                        width: "143px",
                        fontSize: "16px",
                        fontWeight: "500",
                        boxShadow: "1px 2px 1px 0px rgba(0, 0, 0, 0.25)",
                      }}
                    >
                      Löschen
                    </ButtonBlock>
                    <ButtonBlock
                      startIcon={<Edit />}
                      onClick={() => handleEditOperation(configuredOperation)}
                      style={{
                        marginLeft: "auto",
                        marginRight: "8px",
                        borderRadius: "40px",
                        height: "40px",
                        color: "rgba(107, 107, 107, 1)",
                        width: "143px",
                        fontSize: "16px",
                        fontWeight: "500",
                        boxShadow: "1px 2px 1px 0px rgba(0, 0, 0, 0.25)",
                      }}
                    >
                      Bearbeiten
                    </ButtonBlock>
                  </Stack>
                )}
              </AccordionSummary>
              <AccordionDetails>
                <Stack gap={"20px"}>
                  <Stack sx={{ textAlign: "left" }}>
                    <Typography
                      sx={{ marginBottom: "10px" }}
                      variant="caption"
                      color="text.secondary"
                    >
                      Zähne
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {configuredOperation?.selectedTeeth
                        ?.map((tooth) => `Zahn ${tooth}`)
                        .join(", ")}
                    </Typography>
                  </Stack>
                  <Stack sx={{ textAlign: "left" }}>
                    <Typography
                      sx={{ marginBottom: "10px" }}
                      variant="caption"
                      color="text.secondary"
                    >
                      Konnektors
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {configuredOperation?.connectors?.length > 0 ? (
                        configuredOperation?.connectors
                          ?.map(
                            (connector) =>
                              `[Zahn ${connector[0]}, Zahn ${connector[1]}]`,
                          )
                          .join(", ")
                      ) : (
                        <HorizontalRule />
                      )}
                    </Typography>
                  </Stack>
                  <Stack sx={{ textAlign: "left" }}>
                    <Typography
                      sx={{ marginBottom: "10px" }}
                      variant="caption"
                      color="text.secondary"
                    >
                      Material
                    </Typography>
                    <Card
                      sx={{
                        borderRadius: "8px",
                        border: "1px solid rgba(10, 77, 130, 1)",
                        backgroundColor: configuredOperation?.material?.color,
                        boxShadow: "none",
                        width: "200px",
                      }}
                    >
                      <Card
                        sx={{
                          padding: "16px",
                          textAlign: "center",
                        }}
                      >
                        <Box
                          sx={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "50%",
                            backgroundColor:
                              configuredOperation?.material?.color,
                            margin: "0 auto 8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {configuredOperation?.material?.image && (
                            <img
                              src={configuredOperation?.material?.image}
                              alt={configuredOperation?.material?.name}
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          )}
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: "600",
                            marginTop: "8px",
                            fontSize: "14px",
                            color: "rgba(10, 77, 130, 1)",
                          }}
                        >
                          {configuredOperation?.material?.name}
                        </Typography>
                      </Card>
                    </Card>
                  </Stack>
                  <Stack sx={{ textAlign: "left" }}>
                    <Typography
                      sx={{ marginBottom: "10px" }}
                      variant="caption"
                      color="text.secondary"
                    >
                      Optionen und Parameter
                    </Typography>
                    {!isEmpty(configuredOperation?.optionsAndParameters) ? (
                      <TableContainer component={Paper}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell sx={{ color: "rgba(10, 77, 130, 1)" }}>
                                Option
                              </TableCell>
                              <TableCell>Parameter</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {Object.entries(
                              configuredOperation?.optionsAndParameters,
                            )?.map(([opt, param]) => (
                              <TableRow key={opt}>
                                <TableCell
                                  sx={{ color: "rgba(10, 77, 130, 1)" }}
                                >
                                  {opt}
                                </TableCell>
                                <TableCell>
                                  {opt.includes("_drawing") ? (
                                    <img src={param} alt={`${opt}_img`} />
                                  ) : (
                                    (param ?? <HorizontalRule />)
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <HorizontalRule />
                    )}
                  </Stack>
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
        <Stack flexDirection={"column"} gap={"20px"}>
          <Paper
            sx={{
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 1)",
              boxShadow: "0px 4px 8px 0px rgba(0, 0, 0, 0.25)",
              padding: isMobile ? "16px" : "26px 40px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              alignItems: "center",
              height: "100%",
              opacity: 1,
              pointerEvents: "none",
            }}
          >
            {isMobile ? (
              <ZoomableTeethSelection
                selectedOperation={configuredOperations?.[0]?.operation}
                selectedTeeth={selectedTeethRequest}
                selectedConnectors={selectedConnectorsRequest}
                teethColorMap={teethRequestColorMap}
                connectorsColorMap={connectorsRequestColorMap}
                readOnly
              />
            ) : (
              <TeethSelection
                selectedOperation={configuredOperations?.[0]?.operation}
                selectedTeeth={selectedTeethRequest}
                selectedConnectors={selectedConnectorsRequest}
                teethColorMap={teethRequestColorMap}
                connectorsColorMap={connectorsRequestColorMap}
              />
            )}
            <Stack
              flexDirection={"row"}
              justifyContent={"space-around"}
              alignItems={"center"}
              gap={3}
              width={"100%"}
            >
              <ValueFieldBlock
                label="Abformungsart"
                value={
                  selectedImpression
                    ? selectedImpression.charAt(0).toUpperCase() +
                      selectedImpression.slice(1)
                    : ""
                }
              />
              <ValueFieldBlock
                label="Zahnfarbe"
                value={selectedShade ? selectedShade.toUpperCase() : ""}
              />
            </Stack>
          </Paper>
        </Stack>
      </Stack>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Vorgang löschen</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Sind Sie sicher, dass Sie diesen Vorgang löschen möchten? Diese
            Aktion kann nicht rückgängig gemacht werden.
          </DialogContentText>
          {operationToDelete && (
            <Box sx={{ mt: 2, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Vorgang:</strong> {operationToDelete?.operation?.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Zähne:</strong>{" "}
                {operationToDelete?.selectedTeeth
                  ?.map((tooth) => `Zahn ${tooth}`)
                  .join(", ")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Material:</strong> {operationToDelete?.material?.name}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <ButtonBlock
            onClick={handleCancelDelete}
            style={{
              borderRadius: "40px",
              height: "40px",
              color: "rgba(107, 107, 107, 1)",
              width: "120px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Abbrechen
          </ButtonBlock>
          <ButtonBlock
            onClick={handleConfirmDelete}
            style={{
              borderRadius: "40px",
              height: "40px",
              color: "white",
              backgroundColor: "red",
              width: "120px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            Löschen
          </ButtonBlock>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default RequestSummary;
