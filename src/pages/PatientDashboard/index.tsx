import { Formik } from "formik";
import {
  Box,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControlLabel,
  Checkbox,
  Alert,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import { useState, useMemo, Fragment, useEffect, useCallback } from "react";
import Operations from "./components/Operations";
import Materials from "./components/Materials";
import OperationOptions from "./components/OperationOptions";
import { useGetPatientById } from "../../api/patients/hooks";
import {
  useCreateTreatmentRequest,
  useGetTreatmentRequestById,
  useUpdateTreatmentRequest,
} from "../../api/treatment-requests/hooks";
import { useParams, useNavigate } from "react-router-dom";
import PatientForm from "./components/PatientForm";
import OperationTeeth from "./components/OperationTeeth";
import { pullAt } from "lodash";
import RequestSummary from "./components/RequestSummary";
import _ from "lodash";
import { Add } from "@mui/icons-material";
import { CreateRequestDto } from "../../api/treatment-requests/types";
import { useSnackbar } from "../../context/SnackbarContext";
import optionsData from "../../../operations-options.json";

export type OperationSchema = {
  operationIdx: string;
  selectedTeeth: Array<number>;
  operation: any;
  material: any;
  optionsAndParameters: Record<string, string>;
  connectors: Array<[number, number]>;
};

export default function PatientDashboard() {
  const params = useParams();
  const navigate = useNavigate();

  const patientId = params.id;
  const requestId = params.requestId; // For edit mode
  const isEditMode = !!requestId;

  const { data: patientData } = useGetPatientById(patientId || "");
  const { data: existingRequest } = useGetTreatmentRequestById(
    isEditMode ? requestId || "" : ""
  );

  const { mutate: createTreatmentRequest, isPending: isCreating } = useCreateTreatmentRequest();
  const { mutate: updateTreatmentRequest, isPending: isUpdating } = useUpdateTreatmentRequest();

  const isSubmitting = isCreating || isUpdating;

  const [dashboardState, setDashboardState] = useState<number>(1);
  const [currentOperationIndex, setCurrentOperationIndex] = useState("");
  const [configuredOperations, setConfiguredOperations] = useState<
    Array<OperationSchema>
  >([]);

  const [selectedDoctor, setSelectedDoctor] = useState({
    label: "",
    value: "",
  });
  const [selectedClinic, setSelectedClinic] = useState({
    label: "",
    value: "",
  });
  const [deliveryDate, setDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedTeeth, setSelectedTeeth] = useState<Array<number>>([]);
  const [selectedConnectors, setSelectedConnectors] = useState<
    Array<[number, number]>
  >([]);
  const [selectedImpression, setSelectedImpression] = useState("");
  const [selectedShade, setSelectedShade] = useState("");
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedOperationOptions, setSelectedOperationOptions] = useState<
    Record<string, string>
  >({});

  const [showOnlyEditPatientInfoForm, setShowOnlyEditPatientInfoForm] =
    useState<boolean>(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState<boolean>(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState<boolean>(false);
  const [isDoctorApprovalNeeded, setIsDoctorApprovalNeeded] =
    useState<boolean>(false);

  // State for managing empty data alerts
  const [emptyDataState, setEmptyDataState] = useState({
    hasEmptyData: false,
    hasDoctors: true,
    hasClinics: true,
    hasErrors: false,
  });

  const { openSnackbar } = useSnackbar();

  // Handle empty data state changes from PatientForm
  const handleEmptyDataChange = useCallback((hasEmptyData, details) => {
    setEmptyDataState({
      hasEmptyData,
      hasDoctors: details.hasDoctors,
      hasClinics: details.hasClinics,
      hasErrors: details.hasErrors,
    });
  }, []);

  const selectedTeethRequest =
    configuredOperations?.flatMap((operation) => operation.selectedTeeth) ?? [];

  const selectedConnectorsRequest =
    configuredOperations?.flatMap((operation) => operation.connectors) ?? [];

  // Create a mapping of teeth to their operation colors
  const teethRequestColorMap = useMemo(() => {
    const map: Record<number, string> = {};
    configuredOperations?.forEach((operation) => {
      operation.selectedTeeth?.forEach((tooth) => {
        map[tooth] = operation.operation?.color || "#c3c3c3";
      });
    });
    return map;
  }, [configuredOperations]);

  // Create a mapping of connectors to their operation colors
  const connectorsRequestColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    configuredOperations?.forEach((operation) => {
      operation.connectors?.forEach((connector) => {
        const connectorKey = `${connector[0]}-${connector[1]}`;
        map[connectorKey] = operation.operation?.color || "#c3c3c3";
      });
    });
    return map;
  }, [configuredOperations]);

  // Effect to populate form data when in edit mode
  useEffect(() => {
    if (isEditMode && existingRequest) {
      // Transform existing request data to form format
      const transformedOperations: OperationSchema[] =
        existingRequest.operations?.map((operation, index) => ({
          operationIdx: operation?.operationIdx,
          selectedTeeth: operation?.selectedTeeth,
          operation: {
            ...operation?.operation,
            label:
              operation.operation?.name ||
              operation.operation?.name ||
              "Unknown Operation",
            color: operation.operation?.color || "#c3c3c3",
            id: operation.operation?._id || `operation-${index}`,
            category: operation.operation?.category?.name || "operation",
          },
          material: {
            ...operation?.material,
            id: operation?.material?._id,
            name: operation?.material?.name || "Unknown Material",
            // color: operation.material?.color || "#c3c3c3",
            // image: operation.material?.image || null
          },
          optionsAndParameters: operation?.optionsAndParameters,
          connectors: operation?.connectors || [],
        })) || [];

      // Set form state
      setConfiguredOperations(transformedOperations);

      setSelectedDoctor({
        label: `${existingRequest.doctor?.username}` || "",
        value: existingRequest.doctor?._id || "",
      });

      setSelectedClinic({
        label: existingRequest.clinic?.name || "",
        value: existingRequest.clinic?._id || "",
      });

      setIsDoctorApprovalNeeded(existingRequest?.isDoctorApprovalNeeded);

      setDeliveryDate(existingRequest.deliveryDate || "");

      setNotes(existingRequest.notes || "");

      setSelectedImpression(existingRequest.impression || "");

      setSelectedShade(existingRequest.shade || "");

      // Set dashboard to summary state if we have operations
      if (transformedOperations.length > 0) {
        setDashboardState(4);
      }
    }
  }, [isEditMode, existingRequest]);

  const isPatientInfoComplete = useMemo(() => {
    return Boolean(
      patientData &&
        selectedDoctor &&
        selectedClinic &&
        deliveryDate &&
        selectedShade &&
        selectedImpression
    );
  }, [
    patientData,
    selectedDoctor,
    selectedClinic,
    deliveryDate,
    selectedShade,
    selectedImpression,
  ]);

  const isNextButtonValid = useMemo(() => {
    if (dashboardState === 1) {
      // When editing patient info only, don't require teeth selection
      if (showOnlyEditPatientInfoForm) {
        return Boolean(isPatientInfoComplete);
      }
      return Boolean(isPatientInfoComplete && selectedTeeth?.length > 0);
    }

    if (dashboardState === 2) {
      return Boolean(selectedTeeth?.length > 0 && selectedOperation);
    }

    if (dashboardState === 3) {
      //validate material is selected only if there is any to be selected

      return true;
    }

    if (dashboardState === 4) {
      //validate option and paramater is selected

      return true;
    }
  }, [
    dashboardState,
    isPatientInfoComplete,
    selectedTeeth?.length,
    selectedOperation,
  ]);

  const handleSelectTooth = (selection: number) => {
    if (selectedTeeth?.includes(selection)) {
      setSelectedTeeth((curr) => curr.filter((el) => el !== selection));
    } else {
      setSelectedTeeth((curr) => [...curr, selection]);
    }
  };

  const handleSelectConnector = (selection: [number, number]) => {
    const _connector = selectedConnectors?.findIndex(
      (connector) => connector.join("-") === selection.join("-")
    );

    if (_connector > -1) {
      setSelectedConnectors((curr) => {
        const c = [...curr];

        pullAt(c, _connector);

        return c;
      });
    } else {
      setSelectedConnectors((curr) => [...curr, selection]);
    }
  };

  const handleSelectOperation = (operation: any) => {
    setSelectedOperation(operation);
  };

  const handleSelectMaterial = (material: any) => {
    setSelectedMaterial(material);
  };

  const handleDefineOptionsParameters = (next: Record<string, any>) => {
    setSelectedOperationOptions(next);
  };

  // const getConfiguredTeethIds = () => {
  //   return dashboardState.configuredTeeth.map((config) => config.toothId);
  // };

  const handleChangeDashboardState = (m) => {
    setDashboardState((curr) => curr + 1 * m);
  };

  const handleCompleteOperation = () => {
    const currentOperationNewIdx = `${selectedTeeth.join(
      "-"
    )}_${selectedConnectors.join("-")}_${selectedOperation.id}}`;

    const _currentOperationFormValues: OperationSchema = {
      operationIdx: currentOperationNewIdx,
      selectedTeeth: selectedTeeth,
      connectors: selectedConnectors,
      operation: selectedOperation,
      material: selectedMaterial,
      optionsAndParameters: selectedOperationOptions,
    };

    setConfiguredOperations((curr) =>
      _.some(curr, { operationIdx: currentOperationIndex })
        ? _.map(curr, (operation) =>
            operation.operationIdx === currentOperationIndex
              ? _currentOperationFormValues
              : operation
          )
        : [...curr, _currentOperationFormValues]
    );

    setDashboardState(4);
  };

  const handleAddOperation = () => {
    setCurrentOperationIndex(null);

    setSelectedConnectors([]);

    setSelectedMaterial(null);

    setSelectedOperation(null);

    setSelectedOperationOptions({});

    setSelectedTeeth([]);

    setDashboardState(2);
  };

  const handleEditOperation = (operationConfig: OperationSchema) => {
    const {
      operationIdx,
      connectors,
      material,
      operation,
      optionsAndParameters,
      selectedTeeth,
    } = operationConfig;

    setCurrentOperationIndex(operationIdx);

    setSelectedConnectors(connectors);

    setSelectedMaterial(material);

    setSelectedOperation(operation);

    setSelectedOperationOptions(optionsAndParameters);

    setSelectedTeeth(selectedTeeth);

    setDashboardState(2);
  };

  const handleDeleteOperation = (operationConfig: OperationSchema) => {
    setConfiguredOperations((curr) =>
      curr.filter(
        (operation) => operation.operationIdx !== operationConfig.operationIdx
      )
    );
  };

  const handleSubmitForm = () => {
    setSubmitDialogOpen(true);
  };

  const handleConfirmSubmit = () => {
    const _formValues: CreateRequestDto = {
      patient: patientId,
      clinic: selectedClinic?.value,
      deliveryDate: deliveryDate,
      doctor: selectedDoctor?.value,
      impression: selectedImpression,
      isDoctorApprovalNeeded: isDoctorApprovalNeeded,
      notes: notes,
      operations: configuredOperations.map((operation) => ({
        operationIdx: operation?.operationIdx,
        selectedTeeth: operation?.selectedTeeth,
        connectors: operation?.connectors,
        operation: operation?.operation?.id,
        material: operation?.material?.id,
        optionsAndParameters: operation?.optionsAndParameters,
      })),
      shade: selectedShade,
    };

    if (isEditMode) {
      const { clinic, patient, ...resetFormValues } = _formValues;

      console.log(clinic, patient);
      updateTreatmentRequest(
        {
          requestId,
          data: resetFormValues,
        },
        {
          onSuccess: () => {
            // Here you could add further actions, like showing a success notification
            // or redirecting the user.
            openSnackbar({
              type: "success",
              message: "Request erfolgreich erstellt",
            });

            navigate(`/requests/${requestId}`);
          },
          onError: (error) => {
            const errorMessage =
              (error.response?.data as { message?: string })?.message ||
              "Klinik konnte nicht erstellt werden";

            openSnackbar({
              type: "error",
              message: errorMessage,
            });
          },
        }
      );
    } else {
      // Here you would call the createTreatmentRequest mutation
      createTreatmentRequest(_formValues, {
        onSuccess: () => {
          // Here you could add further actions, like showing a success notification
          // or redirecting the user.
          openSnackbar({
            type: "success",
            message: "Request erfolgreich erstellt",
          });

          navigate("/requests");
        },
        onError: (error) => {
          const errorMessage =
            (error.response?.data as { message?: string })?.message ||
            "Klinik konnte nicht erstellt werden";

          openSnackbar({
            type: "error",
            message: errorMessage,
          });
        },
      });
    }

    setSubmitDialogOpen(false);
  };

  const handleCancelSubmit = () => {
    setSubmitDialogOpen(false);
  };

  const handleEditPatientInfo = () => {
    setShowOnlyEditPatientInfoForm(true);

    setDashboardState(1);
  };

  const handleCancelRequest = () => {
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    setCancelDialogOpen(false);

    navigate("/patients");
  };

  const handleCancelCancel = () => {
    setCancelDialogOpen(false);
  };

  return (
    <Formik initialValues={{}} onSubmit={() => {}}>
      <Stack flexDirection={"column"} flex={1}>
        {/* Empty Data Alerts */}
        {emptyDataState.hasEmptyData && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
            {!emptyDataState.hasDoctors && (
              <Alert severity="warning">
                Keine Ärzte verfügbar. Bitte wenden Sie sich an den Administrator, um Ärzte hinzuzufügen.
              </Alert>
            )}
            {!emptyDataState.hasClinics && (
              <Alert severity="warning">
                Keine Praxen verfügbar. Bitte wenden Sie sich an den Administrator, um Praxen hinzuzufügen.
              </Alert>
            )}
          </Box>
        )}
        
        <Stack flexDirection={"row"} flex={1} gap="20px">
          {dashboardState === 1 && (
            <Fragment>
              <PatientForm
                isEditMode={isEditMode}
                patientData={patientData}
                setSelectedDoctor={setSelectedDoctor}
                selectedDoctor={selectedDoctor}
                setSelectedClinic={setSelectedClinic}
                selectedClinic={selectedClinic}
                setDeliveryDate={setDeliveryDate}
                deliveryDate={deliveryDate}
                setSelectedImpression={setSelectedImpression}
                setSelectedShade={setSelectedShade}
                selectedShade={selectedShade}
                selectedImpression={selectedImpression}
                onEmptyDataChange={handleEmptyDataChange}
                disabled={emptyDataState.hasEmptyData}
              />
              {!showOnlyEditPatientInfoForm && (
                <OperationTeeth
                  dashboardState={dashboardState}
                  isPatientInfoComplete={isPatientInfoComplete}
                  selectedOperationTeeth={selectedTeeth}
                  configuredOperations={configuredOperations}
                  selectedTeeth={selectedTeeth}
                  selectedConnectors={selectedConnectors}
                  handleSelectTooth={handleSelectTooth}
                  handleSelectConnector={handleSelectConnector}
                  selectedOperation={selectedOperation}
                  selectedTeethRequest={selectedTeethRequest}
                  selectedConnectorsRequest={selectedConnectorsRequest}
                  teethRequestColorMap={teethRequestColorMap}
                  connectorsRequestColorMap={connectorsRequestColorMap}
                  disabled={emptyDataState.hasEmptyData}
                />
              )}
            </Fragment>
          )}
          {dashboardState === 2 && (
            <Fragment>
              <OperationTeeth
                dashboardState={dashboardState}
                isPatientInfoComplete={isPatientInfoComplete}
                selectedOperationTeeth={selectedTeeth}
                configuredOperations={configuredOperations}
                selectedTeeth={selectedTeeth}
                selectedConnectors={selectedConnectors}
                handleSelectTooth={handleSelectTooth}
                handleSelectConnector={handleSelectConnector}
                selectedOperation={selectedOperation}
                selectedTeethRequest={selectedTeethRequest}
                selectedConnectorsRequest={selectedConnectorsRequest}
                teethRequestColorMap={teethRequestColorMap}
                connectorsRequestColorMap={connectorsRequestColorMap}
                disabled={emptyDataState.hasEmptyData}
              />
              <Operations
                onSelect={handleSelectOperation}
                selectedOperation={selectedOperation}
              />
            </Fragment>
          )}
          {dashboardState === 3 && (
            <Fragment>
              <Operations
                onSelect={handleSelectOperation}
                selectedOperation={selectedOperation}
              />
              <Stack flex={1} direction={"column"} gap={6}>
                <Materials
                  onSelect={handleSelectMaterial}
                  selectedMaterial={selectedMaterial}
                  selectedOperation={selectedOperation}
                />
                {optionsData[selectedOperation?.id] && (
                  <OperationOptions
                    handleDefineOptionsParameters={
                      handleDefineOptionsParameters
                    }
                    selectedOperationOptions={selectedOperationOptions}
                    schema={optionsData[selectedOperation?.id]}
                  />
                )}
              </Stack>
            </Fragment>
          )}
          {dashboardState === 4 && (
            <Stack flexDirection={"column"} width={"100%"}>
              <RequestSummary
                patientData={{
                  ...patientData,
                  doctor: selectedDoctor,
                  clinic: selectedClinic,
                  deliveryDate,
                  notes,
                }}
                configuredOperations={configuredOperations}
                handleEditOperation={handleEditOperation}
                handleDeleteOperation={handleDeleteOperation}
                handleEditPatientInfo={handleEditPatientInfo}
                selectedTeethRequest={selectedTeethRequest}
                selectedConnectorsRequest={selectedConnectorsRequest}
                teethRequestColorMap={teethRequestColorMap}
                connectorsRequestColorMap={connectorsRequestColorMap}
                selectedShade={selectedShade}
                selectedImpression={selectedImpression}
                setNotes={setNotes}
                notes={notes}
              />
            </Stack>
          )}
        </Stack>
        <Stack
          flexDirection={"row"}
          justifyContent={"space-between"}
          marginTop={"16px"}
          gap={"12px"}
        >
          <Stack flexDirection={"row"} gap={"12px"}>
            {!showOnlyEditPatientInfoForm &&
              ((dashboardState > 1 && dashboardState < 4) ||
                (dashboardState === 1 && configuredOperations.length > 0)) && (
                <ButtonBlock
                  onClick={() =>
                    handleChangeDashboardState(
                      dashboardState === 1 && configuredOperations.length > 0
                        ? 3
                        : -1
                    )
                  }
                  style={{
                    borderRadius: "40px",
                    height: "40px",
                    color: "rgba(107, 107, 107, 1)",
                    width: "143px",
                    fontSize: "16px",
                    fontWeight: "500",
                    boxShadow: "1px 2px 1px 0px rgba(0, 0, 0, 0.25)",
                  }}
                >
                  Zurück
                </ButtonBlock>
              )}
            {dashboardState === 4 && (
              <ButtonBlock
                onClick={handleCancelRequest}
                style={{
                  borderRadius: "40px",
                  height: "40px",
                  color: "white",
                  backgroundColor: "rgba(220, 53, 69, 1)",
                  width: "143px",
                  fontSize: "16px",
                  fontWeight: "500",
                  boxShadow: "1px 2px 1px 0px rgba(0, 0, 0, 0.25)",
                }}
              >
                Abbrechen
              </ButtonBlock>
            )}
          </Stack>
          {dashboardState === 4 && (
            <ButtonBlock
              type="button"
              startIcon={<Add />}
              onClick={handleAddOperation}
              style={{
                background: "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
                borderRadius: "40px",
                padding: "0 24px",
                height: "40px",
                color: "white",
                width: "fit-content",
                fontSize: "16px",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              Vorgang hinzufügen
            </ButtonBlock>
          )}
          <Box
            flex="1"
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              justifySelf: "flex-end",
            }}
          >
            {dashboardState === 4 ? (
              <ButtonBlock
                type="button"
                disabled={!isNextButtonValid}
                style={{
                  background: !isNextButtonValid
                    ? "rgba(200, 200, 200, 1)"
                    : "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
                  borderRadius: "40px",
                  height: "40px",
                  color: "white",
                  width: "143px",
                  fontSize: "16px",
                  fontWeight: "500",
                  cursor: !isNextButtonValid ? "not-allowed" : "pointer",
                }}
                onClick={handleSubmitForm}
              >
                Absenden
              </ButtonBlock>
            ) : (
              <ButtonBlock
                type="button"
                onClick={() =>
                  showOnlyEditPatientInfoForm
                    ? setDashboardState(4)
                    : dashboardState === 3
                    ? handleCompleteOperation()
                    : handleChangeDashboardState(1)
                }
                disabled={!isNextButtonValid}
                style={{
                  background: !isNextButtonValid
                    ? "rgba(200, 200, 200, 1)"
                    : "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
                  borderRadius: "40px",
                  height: "40px",
                  color: "white",
                  width: "143px",
                  fontSize: "16px",
                  fontWeight: "500",
                  cursor: !isNextButtonValid ? "not-allowed" : "pointer",
                }}
              >
                Weiter
              </ButtonBlock>
            )}
          </Box>
        </Stack>

        {/* Submit Confirmation Dialog */}
        <Dialog
          open={submitDialogOpen}
          onClose={handleCancelSubmit}
          aria-labelledby="submit-dialog-title"
          aria-describedby="submit-dialog-description"
        >
          <DialogTitle id="submit-dialog-title">
            Behandlungsantrag absenden
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="submit-dialog-description">
              Sind Sie sicher, dass Sie diesen Behandlungsantrag absenden
              möchten? Bitte überprüfen Sie alle Angaben vor dem Absenden.
            </DialogContentText>
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={isDoctorApprovalNeeded}
                    onChange={(e) =>
                      setIsDoctorApprovalNeeded(e.target.checked)
                    }
                    color="primary"
                  />
                }
                label="Arztbestätigung erforderlich"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <ButtonBlock
              onClick={handleCancelSubmit}
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
              onClick={handleConfirmSubmit}
              style={{
                borderRadius: "40px",
                height: "40px",
                color: "white",
                background: "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
                width: "120px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Absenden
            </ButtonBlock>
          </DialogActions>
        </Dialog>

        {/* Cancel Confirmation Dialog */}
        <Dialog
          open={cancelDialogOpen}
          onClose={handleCancelCancel}
          aria-labelledby="cancel-dialog-title"
          aria-describedby="cancel-dialog-description"
        >
          <DialogTitle id="cancel-dialog-title">
            Behandlungsantrag abbrechen
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="cancel-dialog-description">
              Sind Sie sicher, dass Sie die Erstellung dieses Behandlungsantrags
              abbrechen möchten? Alle eingegebenen Daten gehen verloren und
              können nicht wiederhergestellt werden.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <ButtonBlock
              onClick={handleCancelCancel}
              style={{
                borderRadius: "40px",
                height: "40px",
                color: "rgba(107, 107, 107, 1)",
                width: "120px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Zurück
            </ButtonBlock>
            <ButtonBlock
              onClick={handleConfirmCancel}
              style={{
                borderRadius: "40px",
                height: "40px",
                color: "white",
                backgroundColor: "rgba(220, 53, 69, 1)",
                width: "120px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              Abbrechen
            </ButtonBlock>
          </DialogActions>
        </Dialog>

        {/* Full-page Loading Overlay */}
        <Backdrop
          sx={{
            color: "#fff",
            zIndex: (theme) => theme.zIndex.drawer + 1,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
          }}
          open={isSubmitting}
        >
          <CircularProgress color="inherit" size={60} />
        </Backdrop>
      </Stack>
    </Formik>
  );
}
