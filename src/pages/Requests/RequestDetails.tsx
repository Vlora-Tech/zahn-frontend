import {
  Box,
  Stack,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Avatar,
  IconButton,
  Backdrop,
  CircularProgress,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Close,
  Edit,
  Person,
  LocalHospital,
  AccessTime,
  Badge,
  Wc,
  Cake,
  MedicalServices,
  Schedule,
  ArrowBack,
  Notes,
  Error as ErrorIcon,
  Inventory,
  CardGiftcard,
  Info,
  Assignment,
  MedicalInformation,
  FlashOn,
} from "@mui/icons-material";

import {
  useGetTreatmentRequestById,
  useApproveTreatmentRequest,
  useRejectTreatmentRequest,
  useMarkReceivedFromLab,
  useMarkDeliveredToPatient,
} from "../../api/treatment-requests/hooks";
import { useLabRequestByRequestId } from "../../api/lab-requests/hooks";
import { useLaborzettelByLabRequest } from "../../api/laborzettel/hooks";
import RequestSummary from "../PatientDashboard/components/RequestSummary";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import LoadingSpinner from "../../components/atoms/LoadingSpinner";
import { OperationSchema } from "../PatientDashboard";
import { isoDateToAge } from "../../utils/dateToAge";
import DateText from "../../components/atoms/DateText";
import LabStatusSection from "./components/LabStatusSection";
import RequestStatusChip from "./components/RequestStatusChip";
import RequestActivitySection from "./components/RequestActivitySection";
import LaborzettelSection from "./components/LaborzettelSection";

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
      id={`request-tabpanel-${index}`}
      aria-labelledby={`request-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function RequestDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const requestId = params.id;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // < 600px

  const {
    data: treatmentRequest,
    isLoading,
    refetch,
  } = useGetTreatmentRequestById(requestId || "");

  const approveMutation = useApproveTreatmentRequest();
  const rejectMutation = useRejectTreatmentRequest();
  const markReceivedFromLabMutation = useMarkReceivedFromLab();
  const markDeliveredToPatientMutation = useMarkDeliveredToPatient();

  // Get lab request to check its status
  const { data: labRequest } = useLabRequestByRequestId(requestId || "");

  // Get laborzettel to check if it exists
  const { data: laborzettel } = useLaborzettelByLabRequest(
    labRequest?._id || "",
  );
  const hasLaborzettel = !!laborzettel;

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approveNotes, setApproveNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  // Transform treatment request data to match RequestSummary expected format
  const patientData = useMemo(() => {
    if (!treatmentRequest?.patient) return null;

    const patient = treatmentRequest.patient as any;

    return {
      id: patient._id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      type: patient.patientType,
      birthDate: patient.birthDate || "",
      gender: patient.gender || "Masculin",
      patientNumber: patient.patientNumber || "123",
      clinic: treatmentRequest.clinic?.name || "",
      deliveryDate: treatmentRequest.deliveryDate || "",
      doctor: `${treatmentRequest.doctor?.firstName || ""} ${
        treatmentRequest.doctor?.lastName || ""
      }`.trim(),
      insurance: patient.patientType || "",
      notes: treatmentRequest.notes || "",
    };
  }, [treatmentRequest]);

  // Transform treatment request operations to match RequestSummary expected format
  const configuredOperations = useMemo((): OperationSchema[] => {
    return treatmentRequest?.operations?.map((operation, index) => ({
      operationIdx: operation?.operationIdx,
      selectedTeeth: operation?.selectedTeeth,
      impression: operation.impression || "",
      shade: operation.shade || "",
      operation: {
        ...operation.operation,
        label:
          operation.operation?.name ||
          operation.operation?.name ||
          "Unknown Operation",
        color: operation.operation?.color || "#c3c3c3",
        id: operation.operation?._id || `operation-${index}`,
        category: operation.operation?.category?.name || "Unkown Category",
      },
      material: {
        ...operation.material,
        name: operation.material?.name || "Unknown Material",
      },
      optionsAndParameters: operation.optionsAndParameters,
      connectors: operation.connectors || [],
    }));
  }, [treatmentRequest]);

  // Compute teeth selection data for coloring
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
        const key = `${connector[0]}-${connector[1]}`;
        colorMap[key] = color;
      });
    });
    return colorMap;
  }, [configuredOperations]);

  const handleApprove = () => setApproveDialogOpen(true);
  const handleReject = () => setRejectDialogOpen(true);

  const handleConfirmApprove = () => {
    if (requestId) {
      approveMutation.mutate(
        { requestId, data: { notes: approveNotes } },
        {
          onSuccess: () => {
            setApproveDialogOpen(false);
            setApproveNotes("");
            refetch();
            queryClient.invalidateQueries({
              queryKey: ["activity-logs", "request", requestId],
            });
          },
          onError: (error) => console.error("Error approving request:", error),
        },
      );
    }
  };

  const handleConfirmReject = () => {
    if (requestId && rejectReason.trim()) {
      rejectMutation.mutate(
        { requestId, data: { reason: rejectReason } },
        {
          onSuccess: () => {
            setRejectDialogOpen(false);
            setRejectReason("");
            refetch();
            queryClient.invalidateQueries({
              queryKey: ["activity-logs", "request", requestId],
            });
          },
          onError: (error) => console.error("Error rejecting request:", error),
        },
      );
    }
  };

  const handleCancelApprove = () => {
    setApproveDialogOpen(false);
    setApproveNotes("");
  };

  const handleCancelReject = () => {
    setRejectDialogOpen(false);
    setRejectReason("");
  };

  const handleEditRequest = () => {
    if (treatmentRequest?.patient?._id) {
      navigate(
        `/patients/${treatmentRequest.patient._id}/requests/edit/${requestId}`,
      );
    }
  };

  const handleGoBack = () => navigate(-1);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (isLoading) return <LoadingSpinner />;

  if (!treatmentRequest) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="400px"
      >
        <Typography>Request not found</Typography>
      </Box>
    );
  }

  const canApproveReject =
    treatmentRequest.status === "pending_approval" &&
    treatmentRequest.isDoctorApprovalNeeded;

  // Show "Received from Lab" button when lab has dispatched
  const canMarkReceivedFromLab =
    treatmentRequest.status === "approved" &&
    labRequest?.labStatus === "dispatched";

  // Show "Delivered to Patient" button when received from lab
  const canMarkDeliveredToPatient =
    treatmentRequest.status === "received_from_lab";

  const showLabStatusSection =
    treatmentRequest.status === "approved" ||
    treatmentRequest.status === "received_from_lab" ||
    treatmentRequest.status === "delivered_to_patient" ||
    !treatmentRequest.isDoctorApprovalNeeded;

  // Show action section when any action is available
  const showActionSection =
    canApproveReject || canMarkReceivedFromLab || canMarkDeliveredToPatient;

  // Handlers for new actions
  const handleMarkReceivedFromLab = () => {
    if (requestId) {
      markReceivedFromLabMutation.mutate(requestId, {
        onSuccess: () => {
          refetch();
          queryClient.invalidateQueries({
            queryKey: ["activity-logs", "request", requestId],
          });
        },
      });
    }
  };

  const handleMarkDeliveredToPatient = () => {
    if (requestId) {
      markDeliveredToPatientMutation.mutate(requestId, {
        onSuccess: () => {
          refetch();
          queryClient.invalidateQueries({
            queryKey: ["activity-logs", "request", requestId],
          });
        },
      });
    }
  };

  // Gender display
  const genderDisplay =
    patientData?.gender === "male"
      ? "Männlich"
      : patientData?.gender === "female"
        ? "Weiblich"
        : patientData?.gender;

  // Check if any mutation is pending
  const isActionPending =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    markReceivedFromLabMutation.isPending ||
    markDeliveredToPatientMutation.isPending;

  return (
    <Stack flex="1" gap="16px" height="100%">
      {/* Full page loading overlay */}
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isActionPending}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      {/* Top Section: Hero Card with Back Button */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: "16px",
          alignItems: { xs: "stretch", md: "stretch" },
        }}
      >
        {/* Left Column: Hero Card */}
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
          {/* Row 1: Back Button + Auftrag Section */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "stretch", md: "center" },
              p: 2.5,
              borderBottom: "1px solid rgba(0,0,0,0.05)",
              gap: { xs: 2, md: 3 },
            }}
          >
            {/* Back Button */}
            <IconButton
              onClick={handleGoBack}
              sx={{
                backgroundColor: "white",
                boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
                "&:hover": { backgroundColor: "rgba(245,245,245,1)" },
                alignSelf: { xs: "flex-start", md: "center" },
                flexShrink: 0,
              }}
            >
              <ArrowBack />
            </IconButton>

            {/* Auftrag Info - horizontal on desktop */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: { xs: "flex-start", md: "center" },
                gap: { xs: 1.5, md: 3 },
                flex: 1,
                flexWrap: "wrap",
              }}
            >
              {/* Request Number + Edit Button */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    backgroundColor: "rgba(255, 152, 0, 0.15)",
                    color: "rgba(255, 152, 0, 1)",
                  }}
                >
                  <MedicalInformation sx={{ fontSize: 20 }} />
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
                  {treatmentRequest.requestNumber}
                </Typography>
                {treatmentRequest.status === "pending_approval" && (
                  <ButtonBlock
                    startIcon={<Edit sx={{ fontSize: 16 }} />}
                    onClick={handleEditRequest}
                    style={{
                      borderRadius: "6px",
                      height: "32px",
                      color: "rgba(104, 201, 242, 1)",
                      background: "rgba(104, 201, 242, 0.1)",
                      fontSize: "12px",
                      fontWeight: "600",
                      padding: "0 12px",
                    }}
                  >
                    Bearbeiten
                  </ButtonBlock>
                )}
              </Box>

              {/* Status */}
              <RequestStatusChip status={treatmentRequest.status} />

              {/* Erstellt */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <AccessTime
                  sx={{
                    fontSize: 18,
                    color: "rgba(104, 201, 242, 1)",
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(107, 107, 107, 1)",
                    fontSize: "16px",
                  }}
                >
                  Erstellt:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 500, fontSize: "16px" }}
                >
                  <DateText date={treatmentRequest.createdAt} />
                </Typography>
              </Box>

              {/* Liefertermin */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Schedule
                  sx={{
                    fontSize: 18,
                    color: "rgba(104, 201, 242, 1)",
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(107, 107, 107, 1)",
                    fontSize: "16px",
                  }}
                >
                  Liefertermin:
                </Typography>
                {treatmentRequest.deliveryDate ? (
                  (() => {
                    const isDelivered =
                      treatmentRequest.status === "delivered_to_patient";
                    const urgency = isDelivered
                      ? "normal"
                      : getDeliveryDateUrgency(treatmentRequest.deliveryDate);
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
                          fontSize: "16px",
                          color: urgencyColor,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <DateText date={treatmentRequest.deliveryDate} />
                        {showIcon && (
                          <ErrorIcon
                            sx={{ fontSize: 18, color: urgencyColor }}
                          />
                        )}
                      </Typography>
                    );
                  })()
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, fontSize: "16px" }}
                  >
                    —
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {/* Row 2: Patient + Praxis - side by side on desktop */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            {/* Patient Section */}
            <Box
              sx={{
                flex: 1,
                p: 2.5,
                borderRight: { xs: "none", md: "1px solid rgba(0,0,0,0.05)" },
                borderBottom: { xs: "1px solid rgba(0,0,0,0.05)", md: "none" },
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
                  {patientData?.firstName} {patientData?.lastName}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: { xs: 1.5, md: 3 },
                  flexWrap: "wrap",
                }}
              >
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
                    {patientData?.patientNumber || "—"}
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
                    {patientData?.birthDate ? (
                      <>
                        <DateText date={patientData.birthDate} /> (
                        {isoDateToAge(patientData.birthDate)} J.)
                      </>
                    ) : (
                      "—"
                    )}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Praxis Section */}
            <Box sx={{ flex: 1, p: 2.5 }}>
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
                  {treatmentRequest.clinic?.name || "—"}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: { xs: 1.5, md: 3 },
                  flexWrap: "wrap",
                }}
              >
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
                    {treatmentRequest.doctor
                      ? `${treatmentRequest.doctor.firstName} ${treatmentRequest.doctor.lastName}`
                      : "—"}
                  </Typography>
                </Box>
                {treatmentRequest.requestedBy && (
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
                      Angefordert von
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {`${treatmentRequest.requestedBy.firstName || ""} ${treatmentRequest.requestedBy.lastName || ""}`.trim() ||
                        "—"}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Right Column: Action Buttons Section - full width on mobile */}
        {showActionSection && (
          <Paper
            sx={{
              borderRadius: "12px",
              background: "white",
              overflow: "hidden",
              boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
              border: "1px solid rgba(0,0,0,0.05)",
              width: { xs: "100%", md: 300 },
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                p: 2.5,
                background:
                  "linear-gradient(90deg, rgba(135, 193, 51, 0.1) 0%, rgba(104, 201, 242, 0.1) 100%)",
                borderBottom: "1px solid rgba(0,0,0,0.05)",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <FlashOn sx={{ fontSize: 40, color: "rgba(255, 152, 0, 1)" }} />
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, fontSize: 18 }}
              >
                Aktion erforderlich
              </Typography>
            </Box>
            <Box
              sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                flex: 1,
              }}
            >
              {canApproveReject && (
                <>
                  <ButtonBlock
                    onClick={handleApprove}
                    disabled={approveMutation.isPending}
                    style={{
                      borderRadius: "8px",
                      flex: 1,
                      color: "white",
                      background: "#4CAF50",
                      width: "100%",
                      fontSize: isMobile ? "14px" : "16px",
                      fontWeight: "600",
                      boxShadow: "0px 2px 4px rgba(76, 175, 80, 0.3)",
                      flexDirection: isMobile ? "row" : "column",
                      gap: "8px",
                      justifyContent: "center",
                      alignItems: "center",
                      minHeight: "44px",
                      padding: isMobile ? "12px 16px" : undefined,
                    }}
                  >
                    <Check sx={{ fontSize: isMobile ? 24 : 36 }} />
                    {approveMutation.isPending ? "..." : "Genehmigen"}
                  </ButtonBlock>
                  <ButtonBlock
                    onClick={handleReject}
                    disabled={rejectMutation.isPending}
                    style={{
                      borderRadius: "8px",
                      flex: 1,
                      color: "white",
                      background: "#DC3545",
                      width: "100%",
                      fontSize: isMobile ? "14px" : "16px",
                      fontWeight: "600",
                      boxShadow: "0px 2px 4px rgba(220, 53, 69, 0.3)",
                      flexDirection: isMobile ? "row" : "column",
                      gap: "8px",
                      justifyContent: "center",
                      alignItems: "center",
                      minHeight: "44px",
                      padding: isMobile ? "12px 16px" : undefined,
                    }}
                  >
                    <Close sx={{ fontSize: isMobile ? 24 : 36 }} />
                    {rejectMutation.isPending ? "..." : "Ablehnen"}
                  </ButtonBlock>
                </>
              )}
              {canMarkReceivedFromLab && (
                <ButtonBlock
                  onClick={handleMarkReceivedFromLab}
                  disabled={markReceivedFromLabMutation.isPending}
                  style={{
                    borderRadius: "8px",
                    flex: 1,
                    color: "white",
                    background:
                      "linear-gradient(90deg, #00897B 0%, #26A69A 100%)",
                    width: "100%",
                    fontSize: isMobile ? "14px" : "16px",
                    fontWeight: "600",
                    boxShadow: "0px 2px 4px rgba(0, 137, 123, 0.3)",
                    flexDirection: isMobile ? "row" : "column",
                    gap: "8px",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "44px",
                    padding: isMobile ? "12px 16px" : undefined,
                  }}
                >
                  <Inventory sx={{ fontSize: isMobile ? 24 : 36 }} />
                  {markReceivedFromLabMutation.isPending
                    ? "..."
                    : isMobile
                      ? "Aus Labor erhalten"
                      : "Labor-Zustellung bestätigen"}
                </ButtonBlock>
              )}
              {canMarkDeliveredToPatient && (
                <ButtonBlock
                  onClick={handleMarkDeliveredToPatient}
                  disabled={markDeliveredToPatientMutation.isPending}
                  style={{
                    borderRadius: "8px",
                    flex: 1,
                    color: "white",
                    background:
                      "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
                    width: "100%",
                    fontSize: isMobile ? "14px" : "16px",
                    fontWeight: "600",
                    boxShadow: "0px 2px 4px rgba(104, 201, 242, 0.3)",
                    flexDirection: isMobile ? "row" : "column",
                    gap: "8px",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "44px",
                    padding: isMobile ? "12px 16px" : undefined,
                  }}
                >
                  <CardGiftcard sx={{ fontSize: isMobile ? 24 : 36 }} />
                  {markDeliveredToPatientMutation.isPending
                    ? "..."
                    : isMobile
                      ? "An Patient geliefert"
                      : "Patient-Zustellung bestätigen"}
                </ButtonBlock>
              )}
            </Box>
          </Paper>
        )}
      </Box>

      {/* Notizen Card */}
      {(treatmentRequest.notes || treatmentRequest.rejectionReason) && (
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
          <Stack gap={2}>
            {treatmentRequest.notes && (
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                <Notes
                  sx={{
                    fontSize: 20,
                    color: "rgba(104, 201, 242, 1)",
                    mt: 0.25,
                  }}
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
                    Notizen •{" "}
                    {treatmentRequest.requestedBy
                      ? `${treatmentRequest.requestedBy.firstName || ""} ${treatmentRequest.requestedBy.lastName || ""}`.trim()
                      : ""}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, color: "rgba(33, 33, 33, 1)" }}
                  >
                    {treatmentRequest.notes}
                  </Typography>
                </Box>
              </Box>
            )}
            {treatmentRequest.rejectionReason && (
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                <Close sx={{ fontSize: 20, color: "#C62828", mt: 0.25 }} />
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#C62828",
                      fontSize: "10px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      display: "block",
                      mb: 0.5,
                    }}
                  >
                    Ablehnungsgrund •{" "}
                    {treatmentRequest.rejectedBy
                      ? `${treatmentRequest.rejectedBy.firstName || ""} ${treatmentRequest.rejectedBy.lastName || ""}`.trim()
                      : ""}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, color: "rgba(33, 33, 33, 1)" }}
                  >
                    {treatmentRequest.rejectionReason}
                  </Typography>
                </Box>
              </Box>
            )}
          </Stack>
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
            aria-label="request details tabs"
          >
            <Tab
              icon={<Info sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="Details"
              sx={{ textTransform: "none", fontWeight: 600, minHeight: 48 }}
            />
            <Tab
              icon={<MedicalServices sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="Vorgänge"
              sx={{ textTransform: "none", fontWeight: 600, minHeight: 48 }}
            />
            {hasLaborzettel && (
              <Tab
                icon={<Assignment sx={{ fontSize: 18 }} />}
                iconPosition="start"
                label="Laborzettel"
                sx={{ textTransform: "none", fontWeight: 600, minHeight: 48 }}
              />
            )}
          </Tabs>
        </Box>

        <Box sx={{ p: 2, flex: 1, overflow: "auto" }}>
          {/* Tab 1: Details - Labor-Stand and Aktivitätsverlauf */}
          <TabPanel value={activeTab} index={0}>
            <Stack gap={2}>
              {showLabStatusSection && requestId && (
                <LabStatusSection requestId={requestId} variant="horizontal" />
              )}
              {requestId && (
                <RequestActivitySection
                  requestId={requestId}
                  variant="horizontal"
                />
              )}
            </Stack>
          </TabPanel>

          {/* Tab 2: Operations - Operations and Selected Teeth */}
          <TabPanel value={activeTab} index={1}>
            {patientData && (
              <RequestSummary
                selectedShade={treatmentRequest.shade}
                selectedImpression={treatmentRequest.impression}
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
            )}
          </TabPanel>

          {/* Tab 3: Laborzettel (only if exists) */}
          {hasLaborzettel && (
            <TabPanel value={activeTab} index={2}>
              {requestId && <LaborzettelSection requestId={requestId} />}
            </TabPanel>
          )}
        </Box>
      </Paper>

      {/* Approve Dialog */}
      <Dialog
        open={approveDialogOpen}
        onClose={handleCancelApprove}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        slotProps={{ paper: { sx: { borderRadius: isMobile ? 0 : "12px" } } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Behandlungsantrag genehmigen
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Sind Sie sicher, dass Sie diesen Behandlungsantrag genehmigen
            möchten?
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Notizen (optional)"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={approveNotes}
            onChange={(e) => setApproveNotes(e.target.value)}
            placeholder="Zusätzliche Notizen zur Genehmigung..."
          />
        </DialogContent>
        <DialogActions
          sx={{
            p: 2.5,
            pt: 1,
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 0 },
          }}
        >
          <ButtonBlock
            onClick={handleCancelApprove}
            style={{
              borderRadius: "8px",
              height: "44px",
              color: "rgba(107, 107, 107, 1)",
              width: isMobile ? "100%" : "120px",
              fontSize: "14px",
              fontWeight: "500",
              order: isMobile ? 2 : 1,
            }}
          >
            Abbrechen
          </ButtonBlock>
          <ButtonBlock
            onClick={handleConfirmApprove}
            disabled={approveMutation.isPending}
            style={{
              borderRadius: "8px",
              height: "44px",
              color: "white",
              background: "#4CAF50",
              width: isMobile ? "100%" : "120px",
              fontSize: "14px",
              fontWeight: "600",
              order: isMobile ? 1 : 2,
            }}
          >
            {approveMutation.isPending ? "..." : "Genehmigen"}
          </ButtonBlock>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={handleCancelReject}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        slotProps={{ paper: { sx: { borderRadius: isMobile ? 0 : "12px" } } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Behandlungsantrag ablehnen
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Bitte geben Sie einen Grund für die Ablehnung an:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Ablehnungsgrund *"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Grund für die Ablehnung des Behandlungsantrags..."
            required
          />
        </DialogContent>
        <DialogActions
          sx={{
            p: 2.5,
            pt: 1,
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 0 },
          }}
        >
          <ButtonBlock
            onClick={handleCancelReject}
            style={{
              borderRadius: "8px",
              height: "44px",
              color: "rgba(107, 107, 107, 1)",
              width: isMobile ? "100%" : "120px",
              fontSize: "14px",
              fontWeight: "500",
              order: isMobile ? 2 : 1,
            }}
          >
            Abbrechen
          </ButtonBlock>
          <ButtonBlock
            onClick={handleConfirmReject}
            disabled={rejectMutation.isPending || !rejectReason.trim()}
            style={{
              borderRadius: "8px",
              height: "44px",
              color: "white",
              background: "#DC3545",
              width: isMobile ? "100%" : "120px",
              fontSize: "14px",
              fontWeight: "600",
              order: isMobile ? 1 : 2,
            }}
          >
            {rejectMutation.isPending ? "..." : "Ablehnen"}
          </ButtonBlock>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
