import React, { useEffect, useState } from "react";
import {
  Stack,
  Typography,
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import { useGetTreatmentRequestById } from "../../api/treatment-requests/hooks";
import {
  useLabRequestByRequestId,
  useResubmitLabRequest,
} from "../../api/lab-requests/hooks";
import { useSnackbar } from "../../context/SnackbarContext";
import LoadingSpinner from "../../components/atoms/LoadingSpinner";
import ButtonBlock from "../../components/atoms/ButtonBlock";
import RejectionAlertBanner from "./components/RejectionAlertBanner";

const EditRejectedRequest: React.FC = () => {
  const { id: requestId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { openSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Fetch the treatment request
  const {
    data: treatmentRequest,
    isLoading: isRequestLoading,
    error: requestError,
  } = useGetTreatmentRequestById(requestId || "");

  // Fetch the lab request to get rejection details
  const {
    data: labRequest,
    isLoading: isLabRequestLoading,
    error: labRequestError,
  } = useLabRequestByRequestId(requestId || "");

  const resubmitMutation = useResubmitLabRequest();

  const isLoading = isRequestLoading || isLabRequestLoading;
  const hasError = requestError || labRequestError;

  // Check if the lab request is actually rejected
  const isRejected = labRequest?.labStatus === "rejected";

  const handleGoBack = () => {
    navigate(`/requests/${requestId}`);
  };

  // If not rejected, redirect back to request details
  useEffect(() => {
    if (labRequest && !isRejected) {
      openSnackbar({
        type: "error",
        message:
          "Dieser Auftrag ist nicht abgelehnt und kann nicht bearbeitet werden.",
      });
      navigate(`/requests/${requestId}`);
    }
  }, [labRequest, isRejected, navigate, requestId, openSnackbar]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (hasError || !treatmentRequest) {
    return (
      <Stack flex="1" gap="20px" height="100%">
        <Typography variant="h2" sx={{ color: "rgba(146, 146, 146, 1)" }}>
          Abgelehnten Auftrag bearbeiten
        </Typography>
        <Alert severity="error">
          {hasError
            ? "Fehler beim Laden des Auftrags. Bitte versuchen Sie es erneut."
            : "Auftrag nicht gefunden."}
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
          Zurück zum Auftrag
        </ButtonBlock>
      </Stack>
    );
  }

  if (!labRequest || !isRejected) {
    return <LoadingSpinner />;
  }

  return (
    <Stack flex="1" gap="20px" height="100%" px={{ xs: 2, sm: 0 }}>
      {/* Header with back button */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={2}
      >
        <ButtonBlock
          startIcon={<ArrowBack />}
          onClick={handleGoBack}
          sx={{
            borderRadius: "40px",
            height: { xs: "44px", sm: "36px" },
            color: "rgba(107, 107, 107, 1)",
            fontSize: "14px",
            fontWeight: "500",
            padding: "0 16px",
          }}
        >
          Zurück
        </ButtonBlock>
        <Typography
          variant="h2"
          sx={{
            color: "rgba(146, 146, 146, 1)",
            fontSize: { xs: "18px", sm: "24px" },
          }}
        >
          Abgelehnten Auftrag bearbeiten & erneut einreichen
        </Typography>
      </Box>

      {/* Rejection Alert Banner */}
      <RejectionAlertBanner
        rejectionReason={labRequest.rejectionReason || ""}
        rejectionDetails={labRequest.rejectionDetails}
        rejectedBy={labRequest.rejectedBy}
        rejectedAt={labRequest.rejectedAt}
      />

      {/* Info Alert */}
      <Alert severity="info" sx={{ borderRadius: { xs: 0, sm: "10px" } }}>
        <Typography variant="body2">
          Bitte korrigieren Sie die Angaben entsprechend dem Ablehnungsgrund und
          reichen Sie den Auftrag erneut ein. Nach der erneuten Einreichung wird
          das Labor benachrichtigt.
        </Typography>
      </Alert>

      {/* 
        Note: The PatientDashboard component is used for editing requests.
        It's already configured to work in edit mode when requestId is present.
        The user navigates to /patients/:patientId/requests/edit/:requestId
        which renders PatientDashboard in edit mode.
        
        For the rejected request flow, we redirect to that existing edit page
        and handle the resubmit after the user saves their changes.
      */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Um den Auftrag zu bearbeiten, klicken Sie auf den Button unten. Nach
          dem Speichern der Änderungen können Sie den Auftrag erneut einreichen.
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          gap={2}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          <ButtonBlock
            onClick={() => {
              if (treatmentRequest?.patient?._id) {
                navigate(
                  `/patients/${treatmentRequest.patient._id}/requests/edit/${requestId}`,
                );
              }
            }}
            sx={{
              borderRadius: "40px",
              height: { xs: "44px", sm: "40px" },
              color: "white",
              background: "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
              width: { xs: "100%", sm: "fit-content" },
              padding: "0 24px",
              fontSize: "14px",
              fontWeight: "500",
              boxShadow: "1px 2px 1px 0px rgba(0, 0, 0, 0.25)",
            }}
          >
            Auftrag bearbeiten
          </ButtonBlock>

          <ButtonBlock
            onClick={() => setConfirmDialogOpen(true)}
            disabled={resubmitMutation.isPending}
            sx={{
              borderRadius: "40px",
              height: { xs: "44px", sm: "40px" },
              color: "white",
              background: resubmitMutation.isPending
                ? "rgba(0, 0, 0, 0.12)"
                : "linear-gradient(90deg, #4CAF50 0%, #45A049 100%)",
              width: { xs: "100%", sm: "fit-content" },
              padding: "0 24px",
              fontSize: "14px",
              fontWeight: "500",
              boxShadow: resubmitMutation.isPending
                ? "none"
                : "1px 2px 1px 0px rgba(0, 0, 0, 0.25)",
            }}
          >
            {resubmitMutation.isPending
              ? "Wird eingereicht..."
              : "Direkt erneut einreichen"}
          </ButtonBlock>
        </Stack>
      </Box>

      {/* Confirm Resubmit Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        aria-labelledby="resubmit-dialog-title"
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle id="resubmit-dialog-title">
          Auftrag erneut einreichen
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Sind Sie sicher, dass Sie diesen Auftrag ohne weitere Änderungen
            erneut einreichen möchten? Das Labor wird über die erneute
            Einreichung benachrichtigt.
          </DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            pb: 2,
            flexDirection: { xs: "column", sm: "row" },
            gap: { xs: 1, sm: 0 },
          }}
        >
          <ButtonBlock
            onClick={() => setConfirmDialogOpen(false)}
            disabled={resubmitMutation.isPending}
            sx={{
              borderRadius: "40px",
              height: { xs: "44px", sm: "40px" },
              color: "rgba(107, 107, 107, 1)",
              width: { xs: "100%", sm: "120px" },
              fontSize: "14px",
              fontWeight: "500",
              order: { xs: 2, sm: 1 },
            }}
          >
            Abbrechen
          </ButtonBlock>
          <ButtonBlock
            onClick={() => {
              if (labRequest?._id) {
                resubmitMutation.mutate(labRequest._id, {
                  onSuccess: () => {
                    setConfirmDialogOpen(false);
                    queryClient.invalidateQueries({
                      queryKey: ["lab-request-by-request", requestId],
                    });
                    queryClient.invalidateQueries({
                      queryKey: ["treatment-request", requestId],
                    });
                    openSnackbar({
                      type: "success",
                      message:
                        "Auftrag wurde erfolgreich erneut eingereicht. Das Labor wurde benachrichtigt.",
                    });
                    navigate(`/requests/${requestId}`);
                  },
                  onError: (error) => {
                    const errorMessage =
                      (error.response?.data as { message?: string })?.message ||
                      "Fehler beim erneuten Einreichen des Auftrags.";
                    openSnackbar({
                      type: "error",
                      message: errorMessage,
                    });
                  },
                });
              }
            }}
            disabled={resubmitMutation.isPending}
            sx={{
              borderRadius: "40px",
              height: { xs: "44px", sm: "40px" },
              color: "white",
              background: resubmitMutation.isPending
                ? "rgba(0, 0, 0, 0.12)"
                : "linear-gradient(90deg, #4CAF50 0%, #45A049 100%)",
              width: { xs: "100%", sm: "120px" },
              fontSize: "14px",
              fontWeight: "500",
              order: { xs: 1, sm: 2 },
            }}
          >
            {resubmitMutation.isPending ? "..." : "Einreichen"}
          </ButtonBlock>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default EditRejectedRequest;
