import { useState, useMemo } from "react";
import {
  Box,
  Stack,
  Typography,
  Paper,
  Avatar,
  IconButton,
  Alert,
  Backdrop,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Person,
  LocalHospital,
  Assignment,
  AccessTime,
  Badge,
  Wc,
  Cake,
  MedicalServices,
  Schedule,
  ArrowBack,
  Notes,
  Error as ErrorIcon,
  PlayArrow,
  CheckCircle,
  Cancel,
  LocalShipping,
  Description,
  Info,
  MedicalInformation,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import {
  useLabRequest,
  useUpdateLabRequestStatus,
  useRejectLabRequest,
  useMarkDispatched,
} from "../../api/lab-requests/hooks";
import { useLaborzettelByLabRequest } from "../../api/laborzettel/hooks";
import { useAuth } from "../../context/AuthContext";
import { RejectLabRequestDto } from "../../api/lab-requests/types";
import LoadingSpinner from "../../components/atoms/LoadingSpinner";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import LabStatusChip from "./components/LabStatusChip";
import LabStatusSection from "../Requests/components/LabStatusSection";
import RejectRequestModal from "./components/RejectRequestModal";
import RequestSummary from "../PatientDashboard/components/RequestSummary";
import { OperationSchema } from "../PatientDashboard";
import { isoDateToAge } from "../../utils/dateToAge";
import DateText from "../../components/atoms/DateText";

// Helper to check delivery date urgency
const getDeliveryDateUrgency = (
  deliveryDate: string,
): "overdue" | "today" | "normal" => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const delivery = new Date(deliveryDate);
  delivery.setHours(0, 0, 0, 0);
  if (delivery < today) return "overdue";
  if (delivery.getTime() === today.getTime()) return "today";
  return "normal";
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`lab-request-tabpanel-${index}`}
      aria-labelledby={`lab-request-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const LabRequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const {
    data: labRequest,
    isLoading,
    error,
    refetch,
  } = useLabRequest(id || "");
  const { data: laborzettel } = useLaborzettelByLabRequest(id || "");

  const updateStatusMutation = useUpdateLabRequestStatus();
  const rejectMutation = useRejectLabRequest();
  const markDispatchedMutation = useMarkDispatched();

  // Transform operations for display
  const configuredOperations = useMemo((): OperationSchema[] => {
    if (!labRequest?.request?.operations) return [];
    return labRequest.request.operations.map((operation, index) => ({
      operationIdx: operation?.operationIdx,
      selectedTeeth: operation?.selectedTeeth || [],
      operation: {
        ...operation.operation,
        label: operation.operation?.name || "Unbekannte Operation",
        color: operation.operation?.color || "#c3c3c3",
        id: operation.operation?._id || `operation-${index}`,
        category: operation.operation?.category?.name || "Unbekannte Kategorie",
      },
      material: {
        ...operation.material,
        id: operation.material?._id,
        name: operation.material?.name || "Unbekanntes Material",
      },
      optionsAndParameters: operation.optionsAndParameters || {},
      connectors: operation.connectors || [],
    }));
  }, [labRequest]);

  const selectedTeethRequest = useMemo(() => {
    if (!configuredOperations) return [];
    return configuredOperations.flatMap((op) => op.selectedTeeth || []);
  }, [configuredOperations]);

  const selectedConnectorsRequest = useMemo(() => {
    if (!configuredOperations) return [];
    return configuredOperations.flatMap((op) => op.connectors || []);
  }, [configuredOperations]);

  const teethRequestColorMap = useMemo(() => {
    if (!configuredOperations) return {};
    const colorMap: Record<number, string> = {};
    configuredOperations.forEach((op) => {
      const color = op.operation?.color || "#c3c3c3";
      op.selectedTeeth?.forEach((tooth) => {
        colorMap[tooth] = color;
      });
    });
    return colorMap;
  }, [configuredOperations]);

  const connectorsRequestColorMap = useMemo(() => {
    if (!configuredOperations) return {};
    const colorMap: Record<string, string> = {};
    configuredOperations.forEach((op) => {
      const color = op.operation?.color || "#c3c3c3";
      op.connectors?.forEach((connector) => {
        colorMap[`${connector[0]}-${connector[1]}`] = color;
      });
    });
    return colorMap;
  }, [configuredOperations]);

  const handleStartWorking = () => {
    if (id) {
      updateStatusMutation.mutate(
        { id, data: { status: "in_progress" } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lab-request", id] });
            queryClient.invalidateQueries({ queryKey: ["activity-logs", id] });
            refetch();
          },
        },
      );
    }
  };

  const handleMarkComplete = () => {
    if (id) {
      updateStatusMutation.mutate(
        { id, data: { status: "completed" } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["lab-request", id] });
            queryClient.invalidateQueries({ queryKey: ["activity-logs", id] });
            refetch();
          },
        },
      );
    }
  };

  const handleOpenRejectModal = () => setRejectModalOpen(true);
  const handleCloseRejectModal = () => setRejectModalOpen(false);

  const handleReject = (data: RejectLabRequestDto) => {
    if (id) {
      rejectMutation.mutate(
        { id, data },
        {
          onSuccess: () => {
            setRejectModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ["lab-request", id] });
            queryClient.invalidateQueries({ queryKey: ["activity-logs", id] });
            refetch();
          },
        },
      );
    }
  };

  const handleMarkDispatched = () => {
    if (id) {
      markDispatchedMutation.mutate(id, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["lab-request", id] });
          queryClient.invalidateQueries({ queryKey: ["activity-logs", id] });
          refetch();
        },
      });
    }
  };

  const handleGenerateLaborzettel = () => navigate(`/lab/${id}/laborzettel`);
  const handleGoBack = () => navigate("/lab/queue");
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) =>
    setActiveTab(newValue);

  if (isLoading) return <LoadingSpinner />;

  if (error || !labRequest) {
    return (
      <Stack flex="1" gap="20px" height="100%">
        <Alert severity="error">
          {error
            ? "Fehler beim Laden des Laborauftrags."
            : "Laborauftrag nicht gefunden."}
        </Alert>
        <ButtonBlock
          startIcon={<ArrowBack />}
          onClick={handleGoBack}
          style={{
            borderRadius: "40px",
            height: "40px",
            color: "rgba(107, 107, 107, 1)",
            width: "200px",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          Zurück zur Warteschlange
        </ButtonBlock>
      </Stack>
    );
  }

  const { request } = labRequest;
  const patient = request?.patient;
  const doctor = request?.doctor;
  const clinic = request?.clinic || labRequest?.clinic;
  const hasLaborzettel = !!laborzettel;

  const showStartWorkingButton =
    labRequest.labStatus === "read" || labRequest.labStatus === "notified";
  const showRejectButton =
    labRequest.labStatus === "read" || labRequest.labStatus === "notified";
  const showCompleteButton = labRequest.labStatus === "in_progress";
  const isRejected = labRequest.labStatus === "rejected";
  const isLabTechnician = hasRole(["lab_technician", "superadmin"]);
  const showDispatchedButton =
    labRequest.labStatus === "completed" && isLabTechnician;
  // Show Laborzettel button when completed or dispatched (to create or edit)
  const showGenerateLaborzettelButton =
    (labRequest.labStatus === "completed" ||
      labRequest.labStatus === "dispatched") &&
    isLabTechnician;
  // Hide "Aktion erforderlich" header when dispatched and laborzettel exists
  const hideActionHeader =
    labRequest.labStatus === "dispatched" && hasLaborzettel;
  const showActionSection =
    showStartWorkingButton ||
    showCompleteButton ||
    showRejectButton ||
    showDispatchedButton ||
    showGenerateLaborzettelButton;

  const isActionPending =
    updateStatusMutation.isPending ||
    rejectMutation.isPending ||
    markDispatchedMutation.isPending;

  const genderDisplay =
    patient?.gender === "male"
      ? "Männlich"
      : patient?.gender === "female"
        ? "Weiblich"
        : patient?.gender === "other"
          ? "Divers"
          : patient?.gender;

  return (
    <Stack flex="1" gap="16px" height="100%" sx={{ position: "relative" }}>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isActionPending}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <IconButton
        onClick={handleGoBack}
        sx={{
          position: "absolute",
          top: 0,
          left: -56,
          backgroundColor: "white",
          boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
          "&:hover": { backgroundColor: "rgba(245,245,245,1)" },
          zIndex: 10,
        }}
      >
        <ArrowBack />
      </IconButton>

      {/* Top Section: Hero Card + Actions */}
      <Box sx={{ display: "flex", gap: "16px", alignItems: "stretch" }}>
        {/* Hero Card */}
        <Paper
          sx={{
            flex: 1,
            borderRadius: "12px",
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
            border: "1px solid rgba(0,0,0,0.05)",
            overflow: "hidden",
          }}
        >
          <Box sx={{ display: "flex", flexWrap: "wrap" }}>
            {/* Auftrag Section */}
            <Box
              sx={{
                flex: 1,
                minWidth: 220,
                p: 2.5,
                borderRight: { xs: "none", md: "1px solid rgba(0,0,0,0.05)" },
                borderBottom: {
                  xs: "1px solid rgba(0,0,0,0.05)",
                  md: "none",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      backgroundColor: "rgba(255, 152, 0, 0.15)",
                      color: "rgba(255, 152, 0, 1)",
                    }}
                  >
                    <Assignment sx={{ fontSize: 20 }} />
                  </Avatar>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 700,
                      fontFamily: "monospace",
                      color: "rgba(33, 33, 33, 1)",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {request?.requestNumber || "-"}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box>
                  <LabStatusChip status={labRequest.labStatus} />
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(107, 107, 107, 1)",
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    <AccessTime
                      sx={{
                        fontSize: 12,
                        mr: 0.5,
                        color: "rgba(104, 201, 242, 1)",
                        verticalAlign: "middle",
                      }}
                    />
                    Erstellt
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    <DateText date={labRequest.createdAt} />
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(107, 107, 107, 1)",
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    <Schedule
                      sx={{
                        fontSize: 12,
                        mr: 0.5,
                        color: "rgba(104, 201, 242, 1)",
                        verticalAlign: "middle",
                      }}
                    />
                    Liefertermin
                  </Typography>
                  {request?.deliveryDate ? (
                    (() => {
                      const urgency = getDeliveryDateUrgency(
                        request.deliveryDate,
                      );
                      const showIcon =
                        urgency === "overdue" || urgency === "today";
                      const urgencyColor =
                        urgency === "overdue"
                          ? "#C62828"
                          : urgency === "today"
                            ? "#F9A825"
                            : undefined;
                      return (
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            color: urgencyColor,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <DateText date={request.deliveryDate} />
                          {showIcon && (
                            <ErrorIcon
                              sx={{ fontSize: 18, color: urgencyColor }}
                            />
                          )}
                        </Typography>
                      );
                    })()
                  ) : (
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      —
                    </Typography>
                  )}
                </Box>
                {(labRequest.assignedTechnicianName ||
                  labRequest.assignedTechnician) && (
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "rgba(107, 107, 107, 1)",
                        fontSize: "10px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      <Person
                        sx={{
                          fontSize: 12,
                          mr: 0.5,
                          color: "rgba(104, 201, 242, 1)",
                          verticalAlign: "middle",
                        }}
                      />
                      Zugewiesen an
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {labRequest.assignedTechnicianName ||
                        `${labRequest.assignedTechnician?.firstName || ""} ${labRequest.assignedTechnician?.lastName || ""}`.trim() ||
                        "—"}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Patient Section */}
            <Box
              sx={{
                flex: 1,
                minWidth: 220,
                p: 2.5,
                borderRight: { xs: "none", md: "1px solid rgba(0,0,0,0.05)" },
                borderBottom: {
                  xs: "1px solid rgba(0,0,0,0.05)",
                  md: "none",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 2,
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    backgroundColor: "rgba(104, 201, 242, 0.15)",
                    color: "rgba(104, 201, 242, 1)",
                  }}
                >
                  <Person sx={{ fontSize: 20 }} />
                </Avatar>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 600, color: "rgba(33, 33, 33, 1)" }}
                >
                  {patient?.firstName} {patient?.lastName}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(107, 107, 107, 1)",
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    <Badge
                      sx={{
                        fontSize: 12,
                        mr: 0.5,
                        color: "rgba(104, 201, 242, 1)",
                        verticalAlign: "middle",
                      }}
                    />
                    Patientennr.
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {patient?.patientNumber || "—"}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(107, 107, 107, 1)",
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    <Wc
                      sx={{
                        fontSize: 12,
                        mr: 0.5,
                        color: "rgba(104, 201, 242, 1)",
                        verticalAlign: "middle",
                      }}
                    />
                    Geschlecht
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {genderDisplay || "—"}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(107, 107, 107, 1)",
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    <Cake
                      sx={{
                        fontSize: 12,
                        mr: 0.5,
                        color: "rgba(104, 201, 242, 1)",
                        verticalAlign: "middle",
                      }}
                    />
                    Geburtsdatum
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {patient?.birthDate ? (
                      <>
                        <DateText date={patient.birthDate} /> (
                        {isoDateToAge(patient.birthDate)} J.)
                      </>
                    ) : (
                      "—"
                    )}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Praxis Section */}
            <Box sx={{ flex: 1, minWidth: 220, p: 2.5 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 2,
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    backgroundColor: "rgba(135, 193, 51, 0.15)",
                    color: "rgba(135, 193, 51, 1)",
                  }}
                >
                  <LocalHospital sx={{ fontSize: 20 }} />
                </Avatar>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 600, color: "rgba(33, 33, 33, 1)" }}
                >
                  {clinic?.name || "—"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "rgba(107, 107, 107, 1)",
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    <MedicalServices
                      sx={{
                        fontSize: 12,
                        mr: 0.5,
                        color: "rgba(104, 201, 242, 1)",
                        verticalAlign: "middle",
                      }}
                    />
                    Zahnarzt
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {doctor ? `${doctor.firstName} ${doctor.lastName}` : "—"}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Right Column: Action Buttons */}
        {showActionSection && (
          <Paper
            sx={{
              borderRadius: "12px",
              background: "white",
              overflow: "hidden",
              boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
              border: "1px solid rgba(0,0,0,0.05)",
              width: 280,
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {!hideActionHeader && (
              <Box
                sx={{
                  p: 2,
                  background:
                    "linear-gradient(90deg, rgba(135, 193, 51, 0.1) 0%, rgba(104, 201, 242, 0.1) 100%)",
                  borderBottom: "1px solid rgba(0,0,0,0.05)",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Assignment
                  sx={{ fontSize: 20, color: "rgba(104, 201, 242, 1)" }}
                />
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, fontSize: "14px" }}
                >
                  Aktion erforderlich
                </Typography>
              </Box>
            )}
            <Box
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                flex: 1,
              }}
            >
              {showStartWorkingButton && (
                <ButtonBlock
                  onClick={handleStartWorking}
                  disabled={updateStatusMutation.isPending}
                  style={{
                    borderRadius: "8px",
                    flex: 1,
                    color: "white",
                    background:
                      "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
                    width: "100%",
                    fontSize: "16px",
                    fontWeight: "600",
                    boxShadow: "0px 2px 4px rgba(104, 201, 242, 0.3)",
                    flexDirection: "column",
                    gap: "8px",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <PlayArrow sx={{ fontSize: 48 }} />
                  {updateStatusMutation.isPending
                    ? "..."
                    : "Bearbeitung starten"}
                </ButtonBlock>
              )}
              {showCompleteButton && (
                <ButtonBlock
                  onClick={handleMarkComplete}
                  disabled={updateStatusMutation.isPending}
                  style={{
                    borderRadius: "8px",
                    flex: 1,
                    color: "white",
                    background: "#4CAF50",
                    width: "100%",
                    fontSize: "16px",
                    fontWeight: "600",
                    boxShadow: "0px 2px 4px rgba(76, 175, 80, 0.3)",
                    flexDirection: "column",
                    gap: "8px",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <CheckCircle sx={{ fontSize: 48 }} />
                  {updateStatusMutation.isPending
                    ? "..."
                    : "Als Erledigt markieren"}
                </ButtonBlock>
              )}
              {showRejectButton && (
                <ButtonBlock
                  onClick={handleOpenRejectModal}
                  disabled={rejectMutation.isPending}
                  style={{
                    borderRadius: "8px",
                    flex: 1,
                    color: "white",
                    background: "#DC3545",
                    width: "100%",
                    fontSize: "16px",
                    fontWeight: "600",
                    boxShadow: "0px 2px 4px rgba(220, 53, 69, 0.3)",
                    flexDirection: "column",
                    gap: "8px",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Cancel sx={{ fontSize: 48 }} />
                  {rejectMutation.isPending ? "..." : "Ablehnen"}
                </ButtonBlock>
              )}
              {showDispatchedButton && (
                <ButtonBlock
                  onClick={handleMarkDispatched}
                  disabled={markDispatchedMutation.isPending}
                  style={{
                    borderRadius: "8px",
                    flex: 1,
                    color: "white",
                    background:
                      "linear-gradient(90deg, #00897B 0%, #26A69A 100%)",
                    width: "100%",
                    fontSize: "16px",
                    fontWeight: "600",
                    boxShadow: "0px 2px 4px rgba(0, 137, 123, 0.3)",
                    flexDirection: "column",
                    gap: "8px",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <LocalShipping sx={{ fontSize: 48 }} />
                  {markDispatchedMutation.isPending
                    ? "..."
                    : "Als Versandt markieren"}
                </ButtonBlock>
              )}
              {showGenerateLaborzettelButton && (
                <ButtonBlock
                  onClick={handleGenerateLaborzettel}
                  style={{
                    borderRadius: "8px",
                    flex: 1,
                    color: "white",
                    background:
                      "linear-gradient(90deg, #5C6BC0 0%, #7986CB 100%)",
                    width: "100%",
                    fontSize: "16px",
                    fontWeight: "600",
                    boxShadow: "0px 2px 4px rgba(92, 107, 192, 0.3)",
                    flexDirection: "column",
                    gap: "8px",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Description sx={{ fontSize: 48 }} />
                  {hasLaborzettel ? "Laborzettel" : "Laborzettel erstellen"}
                </ButtonBlock>
              )}
            </Box>
          </Paper>
        )}
      </Box>

      {/* Rejection Alert */}
      {isRejected && (
        <Alert
          severity="error"
          sx={{
            borderRadius: "12px",
            "& .MuiAlert-message": { width: "100%" },
          }}
        >
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Dieser Auftrag wurde abgelehnt
          </Typography>
          <Typography variant="body2">
            <strong>Grund:</strong>{" "}
            {labRequest.rejectionReason === "incomplete_information"
              ? "Unvollständige Informationen"
              : labRequest.rejectionReason === "invalid_specifications"
                ? "Ungültige Spezifikationen"
                : labRequest.rejectionReason === "material_unavailable"
                  ? "Material nicht verfügbar"
                  : labRequest.rejectionReason === "equipment_issue"
                    ? "Geräteproblem"
                    : labRequest.rejectionReason === "other"
                      ? "Sonstiges"
                      : labRequest.rejectionReason}
          </Typography>
          {labRequest.rejectionDetails && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Details:</strong> {labRequest.rejectionDetails}
            </Typography>
          )}
          {labRequest.rejectedBy && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Abgelehnt von:</strong>{" "}
              {`${labRequest.rejectedBy.firstName || ""} ${labRequest.rejectedBy.lastName || ""}`.trim()}
            </Typography>
          )}
          {labRequest.rejectedAt && (
            <Typography variant="body2">
              <strong>Abgelehnt am:</strong>{" "}
              {new Date(labRequest.rejectedAt).toLocaleString("de-DE")}
            </Typography>
          )}
        </Alert>
      )}

      {/* Notizen Card */}
      {request?.notes && (
        <Paper
          sx={{
            borderRadius: "12px",
            background: "white",
            overflow: "hidden",
            boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
            border: "1px solid rgba(0,0,0,0.05)",
            p: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
            <Notes
              sx={{ fontSize: 20, color: "rgba(104, 201, 242, 1)", mt: 0.25 }}
            />
            <Box>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(107, 107, 107, 1)",
                  fontSize: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  display: "block",
                  mb: 0.5,
                }}
              >
                Notizen
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, color: "rgba(33, 33, 33, 1)" }}
              >
                {request.notes}
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Tabs Section */}
      <Paper
        sx={{
          borderRadius: "12px",
          background: "white",
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
          border: "1px solid rgba(0,0,0,0.05)",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="lab request details tabs"
          >
            <Tab
              icon={<Info sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="Details"
              sx={{ textTransform: "none", fontWeight: 600, minHeight: 48 }}
            />
            <Tab
              icon={<MedicalInformation sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="Vorgangen"
              sx={{ textTransform: "none", fontWeight: 600, minHeight: 48 }}
            />
          </Tabs>
        </Box>

        <Box sx={{ p: 2, flex: 1, overflow: "auto" }}>
          {/* Tab 1: Details - Labor-Stand */}
          <TabPanel value={activeTab} index={0}>
            <Stack gap={2}>
              {id && (
                <LabStatusSection
                  labRequestId={id}
                  variant="horizontal"
                  showResubmitButton={false}
                />
              )}
            </Stack>
          </TabPanel>

          {/* Tab 2: Operations */}
          <TabPanel value={activeTab} index={1}>
            <RequestSummary
              selectedShade={request?.shade}
              selectedImpression={request?.impression}
              configuredOperations={configuredOperations}
              selectedTeethRequest={selectedTeethRequest}
              selectedConnectorsRequest={selectedConnectorsRequest}
              teethRequestColorMap={teethRequestColorMap}
              connectorsRequestColorMap={connectorsRequestColorMap}
              handleEditOperation={() => {}}
              handleDeleteOperation={() => {}}
              handleEditPatientInfo={() => {}}
              hideActionButtons={true}
            />
          </TabPanel>
        </Box>
      </Paper>

      <RejectRequestModal
        open={rejectModalOpen}
        onClose={handleCloseRejectModal}
        onSubmit={handleReject}
        isLoading={rejectMutation.isPending}
      />
    </Stack>
  );
};

export default LabRequestDetail;
