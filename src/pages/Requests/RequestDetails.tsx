import {
  Box,
  Stack,
  Typography,
  Paper,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Divider,
} from "@mui/material";
import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, Close, Edit } from "@mui/icons-material";

import {
  useGetTreatmentRequestById,
  useApproveTreatmentRequest,
  useRejectTreatmentRequest,
} from "../../api/treatment-requests/hooks";
import RequestSummary from "../PatientDashboard/components/RequestSummary";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import LoadingSpinner from "../../components/atoms/LoadingSpinner";
import { OperationSchema } from "../PatientDashboard";
import { isoDateToAge } from "../../utils/isoDateToAge";

export default function RequestDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const requestId = params.id;

  const {
    data: treatmentRequest,
    isLoading,
    refetch,
  } = useGetTreatmentRequestById(requestId || "");

  const approveMutation = useApproveTreatmentRequest();
  const rejectMutation = useRejectTreatmentRequest();

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approveNotes, setApproveNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  // Transform treatment request data to match RequestSummary expected format
  const patientData = useMemo(() => {
    if (!treatmentRequest?.patient) return null;

    const patient = treatmentRequest.patient as any; // Type assertion for missing properties

    return {
      id: patient._id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      type: treatmentRequest?.insurance === "private" ? "Privat" : "GKV",
      birthDate: patient.birthDate || "",
      gender: patient.gender || "Masculin",
      patientNumber: patient.patientNumber || "123",
      clinic: treatmentRequest.clinic?.name || "",
      deliveryDate: treatmentRequest.deliveryDate || "",
      doctor: `${treatmentRequest.doctor?.firstName || ""} ${
        treatmentRequest.doctor?.lastName || ""
      }`.trim(),
      insurance: treatmentRequest.insurance || "",
      notes: treatmentRequest.notes || "",
    };
  }, [treatmentRequest]);

  // Transform treatment request operations to match RequestSummary expected format
  const configuredOperations = useMemo((): OperationSchema[] => {
    // if (!treatmentRequest?.selectedTeeth) return [];

    // return treatmentRequest.operations

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
        // color: operation.material?.color || "#c3c3c3",
        // image: operation.material?.image || null
      },
      optionsAndParameters: operation.optionsAndParameters,
      connectors: operation.connectors || [],
    }));
  }, [treatmentRequest]);

  const handleApprove = () => {
    setApproveDialogOpen(true);
  };

  const handleReject = () => {
    setRejectDialogOpen(true);
  };

  const handleConfirmApprove = () => {
    if (requestId) {
      approveMutation.mutate(
        { requestId, data: { notes: approveNotes } },
        {
          onSuccess: () => {
            setApproveDialogOpen(false);
            setApproveNotes("");
            refetch();
          },
          onError: (error) => {
            console.error("Error approving request:", error);
          },
        }
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
          },
          onError: (error) => {
            console.error("Error rejecting request:", error);
          },
        }
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
        `/patients/${treatmentRequest.patient._id}/requests/edit/${requestId}`
      );
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

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

  const canApproveReject = treatmentRequest.status === "pending";

  return (
    <Stack flex="1" gap="20px" height="100%">
      <Typography
        variant="h2"
        sx={{
          color: "rgba(146, 146, 146, 1)",
        }}
      >
        Antrageninformation
      </Typography>

      <Box display="flex" gap="20px" flex="1">
        {/* Left Column - Request Summary */}
        <Stack flex="2" gap="20px">
          {patientData && (
            <RequestSummary
              // patientData={patientData}
              selectedShade={treatmentRequest.shade}
              selectedImpression={treatmentRequest.impression}
              configuredOperations={configuredOperations}
              handleEditOperation={() => {}} // Disabled in view mode
              handleDeleteOperation={() => {}} // Disabled in view mode
              handleEditPatientInfo={() => {}} // Disabled in view mode
              hideActionButtons={true} // Hide action buttons in view mode
            />
          )}
        </Stack>

        {/* Right Column - Status and Actions */}
        <Stack flex="1" gap="20px">
          <Paper
            sx={{
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 1)",
              padding: "26px 40px",
              boxShadow: "0px 4px 8px 0px rgba(0, 0, 0, 0.25)",
            }}
          >
            <Grid container spacing={2}>
              <Grid size={12}>
                <Typography variant="body2" color="text.secondary">
                  Stand
                </Typography>
                <Chip
                  label={treatmentRequest.status}
                  color={
                    treatmentRequest.status === "approved"
                      ? "success"
                      : treatmentRequest.status === "rejected"
                      ? "error"
                      : "default"
                  }
                  sx={{ mt: 1 }}
                />
              </Grid>
              <Grid size={12}>
                <Typography variant="body2" color="text.secondary">
                  Antragennummer
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ mt: 1, fontFamily: "monospace" }}
                >
                  {treatmentRequest.requestNumber}
                </Typography>
              </Grid>
              <Grid size={12}>
                <Typography variant="body2" color="text.secondary">
                  Erstellt am
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {treatmentRequest.createdAt
                    ? new Date(treatmentRequest.createdAt).toLocaleString()
                    : "N/A"}
                </Typography>
              </Grid>
              {treatmentRequest.updatedAt && (
                <Grid size={12}>
                  <Typography variant="body2" color="text.secondary">
                    Zuletzt aktualisiert
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {new Date(treatmentRequest.updatedAt).toLocaleString()}
                  </Typography>
                </Grid>
              )}
              {treatmentRequest.requestedBy && (
                <Grid size={12}>
                  <Typography variant="body2" color="text.secondary">
                    Angefordert von
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {`${treatmentRequest.requestedBy.firstName ?? ""} ${
                      treatmentRequest.requestedBy.lastName
                    }`}
                  </Typography>
                </Grid>
              )}
              {treatmentRequest.notes && (
                <Grid size={12}>
                  <Typography variant="body2" color="text.secondary">
                    Notizen
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {treatmentRequest.notes}
                  </Typography>
                </Grid>
              )}
            </Grid>

            {/* Edit Request Button */}
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Aktionen zur Antrag
            </Typography>
            <ButtonBlock
              startIcon={<Edit />}
              onClick={handleEditRequest}
              style={{
                borderRadius: "40px",
                height: "40px",
                color: "white",
                background:
                  treatmentRequest?.status !== "pending"
                    ? "rgba(0, 0, 0, 0.12)"
                    : "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
                width: "100%",
                fontSize: "14px",
                fontWeight: "500",
                boxShadow: "1px 2px 1px 0px rgba(0, 0, 0, 0.25)",
                marginBottom: "12px",
              }}
              disabled={treatmentRequest?.status !== "pending"}
            >
              Antrag bearbeiten
            </ButtonBlock>

            {/* Doctor Action Buttons */}
            {canApproveReject && (
              <>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Aktionen von Arzt
                </Typography>
                <Stack gap="12px">
                  <ButtonBlock
                    startIcon={<Check />}
                    onClick={handleApprove}
                    disabled={approveMutation.isPending}
                    style={{
                      borderRadius: "40px",
                      height: "40px",
                      color: "white",
                      background:
                        "linear-gradient(90deg, #4CAF50 0%, #45A049 100%)",
                      width: "100%",
                      fontSize: "14px",
                      fontWeight: "500",
                      boxShadow: "1px 2px 1px 0px rgba(0, 0, 0, 0.25)",
                    }}
                  >
                    {approveMutation.isPending
                      ? "Genehmigung..."
                      : "Genehmigen"}
                  </ButtonBlock>
                  <ButtonBlock
                    startIcon={<Close />}
                    onClick={handleReject}
                    disabled={rejectMutation.isPending}
                    style={{
                      borderRadius: "40px",
                      height: "40px",
                      color: "white",
                      backgroundColor: "rgba(220, 53, 69, 1)",
                      width: "100%",
                      fontSize: "14px",
                      fontWeight: "500",
                      boxShadow: "1px 2px 1px 0px rgba(0, 0, 0, 0.25)",
                    }}
                  >
                    {rejectMutation.isPending ? "Ablehnung..." : "Ablehnen"}
                  </ButtonBlock>
                </Stack>
              </>
            )}
          </Paper>
          <Paper
            sx={{
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 1)",
              padding: "26px 40px",
              boxShadow: "0px 4px 8px 0px rgba(0, 0, 0, 0.25)",
            }}
          >
            <Grid container spacing={2}>
              <Grid size={12}>
                <Typography variant="body2" color="text.secondary">
                  Patientenname
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {patientData?.firstName} {patientData?.lastName}
                </Typography>
              </Grid>
              <Grid size={12}>
                <Typography variant="body2" color="text.secondary">
                  Patientennummer
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {patientData?.patientNumber}
                </Typography>
              </Grid>
              <Grid size={12}>
                <Typography variant="body2" color="text.secondary">
                  Geschlecht
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {patientData?.gender}
                </Typography>
              </Grid>
              <Grid size={12}>
                <Typography variant="body2" color="text.secondary">
                  Geburtstag
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {new Date(patientData?.birthDate).toLocaleDateString("de-DE")}{" "}
                  ( {isoDateToAge(patientData?.birthDate)} J. )
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          <Paper
            sx={{
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 1)",
              padding: "26px 40px",
              boxShadow: "0px 4px 8px 0px rgba(0, 0, 0, 0.25)",
            }}
          >
            <Grid container spacing={2}>
              <Grid size={12}>
                <Typography variant="body2" color="text.secondary">
                  Praxis
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {treatmentRequest.clinic?.name || "N/A"}
                </Typography>
              </Grid>
              <Grid size={12}>
                <Typography variant="body2" color="text.secondary">
                  Zahnarzt
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  {`${treatmentRequest.doctor?.firstName || ""} ${
                    treatmentRequest.doctor?.lastName || ""
                  }`.trim() || "N/A"}
                </Typography>
              </Grid>
              {treatmentRequest.deliveryDate && (
                <Grid size={12}>
                  <Typography variant="body2" color="text.secondary">
                    Liefertermin
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {new Date(treatmentRequest.deliveryDate).toLocaleDateString(
                      "de-DE"
                    )}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
          {/* Request Status Card */}
        </Stack>
      </Box>

      {/* Approve Confirmation Dialog */}
      <Dialog
        open={approveDialogOpen}
        onClose={handleCancelApprove}
        aria-labelledby="approve-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="approve-dialog-title">
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
        <DialogActions>
          <ButtonBlock
            onClick={handleCancelApprove}
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
            onClick={handleConfirmApprove}
            disabled={approveMutation.isPending}
            style={{
              borderRadius: "40px",
              height: "40px",
              color: "white",
              background: "linear-gradient(90deg, #4CAF50 0%, #45A049 100%)",
              width: "120px",
              fontSize: "14px",
              fontWeight: "500",
            }}
          >
            {approveMutation.isPending ? "..." : "Genehmigen"}
          </ButtonBlock>
        </DialogActions>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={handleCancelReject}
        aria-labelledby="reject-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="reject-dialog-title">
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
        <DialogActions>
          <ButtonBlock
            onClick={handleCancelReject}
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
            onClick={handleConfirmReject}
            disabled={rejectMutation.isPending || !rejectReason.trim()}
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
            {rejectMutation.isPending ? "..." : "Ablehnen"}
          </ButtonBlock>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
