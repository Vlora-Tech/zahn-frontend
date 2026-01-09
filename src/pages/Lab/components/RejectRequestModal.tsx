import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Alert,
  SelectChangeEvent,
} from "@mui/material";
import ButtonBlock from "../../../components/atoms/ButtonBlock";
import { RejectLabRequestDto, RejectionReason } from "../../../api/lab-requests/types";

interface RejectRequestModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RejectLabRequestDto) => void;
  isLoading: boolean;
}

// Rejection reason options with German labels
const rejectionReasonOptions: { value: RejectionReason; label: string }[] = [
  { value: "incomplete_information", label: "Unvollständige Informationen" },
  { value: "invalid_specifications", label: "Ungültige Spezifikationen" },
  { value: "material_unavailable", label: "Material nicht verfügbar" },
  { value: "equipment_issue", label: "Geräteproblem" },
  { value: "other", label: "Sonstiges" },
];

const RejectRequestModal: React.FC<RejectRequestModalProps> = ({
  open,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [reason, setReason] = useState<RejectionReason | "">("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setReason("");
      setDetails("");
      setError(null);
    }
  }, [open]);

  const handleReasonChange = (event: SelectChangeEvent<string>) => {
    setReason(event.target.value as RejectionReason);
    setError(null);
    // Clear details if reason is not "other"
    if (event.target.value !== "other") {
      setDetails("");
    }
  };

  const handleDetailsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDetails(event.target.value);
    setError(null);
  };

  const handleSubmit = () => {
    // Validation
    if (!reason) {
      setError("Bitte wählen Sie einen Ablehnungsgrund aus.");
      return;
    }

    if (reason === "other" && !details.trim()) {
      setError("Bitte geben Sie Details zur Ablehnung an.");
      return;
    }

    const data: RejectLabRequestDto = {
      reason,
      ...(details.trim() && { details: details.trim() }),
    };

    onSubmit(data);
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const isOtherReason = reason === "other";
  const isSubmitDisabled =
    isLoading || !reason || (isOtherReason && !details.trim());

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="reject-request-dialog-title"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="reject-request-dialog-title">
        Laborauftrag ablehnen
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Bitte wählen Sie einen Grund für die Ablehnung aus. Der Arzt/die Praxis
          wird über die Ablehnung informiert.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="rejection-reason-label">Ablehnungsgrund *</InputLabel>
          <Select
            labelId="rejection-reason-label"
            id="rejection-reason"
            value={reason}
            label="Ablehnungsgrund *"
            onChange={handleReasonChange}
            disabled={isLoading}
          >
            {rejectionReasonOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {isOtherReason && (
          <TextField
            autoFocus
            margin="dense"
            id="rejection-details"
            label="Details zur Ablehnung *"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={details}
            onChange={handleDetailsChange}
            placeholder="Bitte beschreiben Sie den Grund für die Ablehnung..."
            disabled={isLoading}
            required
          />
        )}

        {!isOtherReason && reason && (
          <TextField
            margin="dense"
            id="rejection-details-optional"
            label="Zusätzliche Details (optional)"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={details}
            onChange={handleDetailsChange}
            placeholder="Optionale zusätzliche Informationen..."
            disabled={isLoading}
          />
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <ButtonBlock
          onClick={handleClose}
          disabled={isLoading}
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
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          style={{
            borderRadius: "40px",
            height: "40px",
            color: "white",
            backgroundColor: isSubmitDisabled
              ? "rgba(0, 0, 0, 0.12)"
              : "rgba(220, 53, 69, 1)",
            width: "120px",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: isSubmitDisabled
              ? "none"
              : "1px 2px 1px 0px rgba(0, 0, 0, 0.25)",
          }}
        >
          {isLoading ? "..." : "Ablehnen"}
        </ButtonBlock>
      </DialogActions>
    </Dialog>
  );
};

export default RejectRequestModal;
