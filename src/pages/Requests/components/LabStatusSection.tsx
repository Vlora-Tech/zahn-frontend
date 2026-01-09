import React from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Refresh,
  Science,
  NotificationsActive,
  Visibility,
  PlayArrow,
  CheckCircle,
  LocalShipping,
  Cancel,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useLabRequestByRequestId, useLabRequest } from "../../../api/lab-requests/hooks";
import { useActivityLogs } from "../../../api/activity-logs/hooks";
import RejectionAlertBanner from "./RejectionAlertBanner";
import ButtonBlock from "../../../components/atoms/ButtonBlock";

interface LabStatusSectionProps {
  requestId?: string;
  labRequestId?: string;
  variant?: "vertical" | "horizontal";
  showResubmitButton?: boolean;
}

// Custom horizontal connector
const HorizontalConnector = styled(StepConnector)(() => ({
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      background: "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      background: "linear-gradient(90deg, #87C133 0%, #68C9F2 100%)",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: "#eaeaf0",
    borderRadius: 1,
  },
}));

// Custom vertical connector
const VerticalConnector = styled(StepConnector)(() => ({
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      background: "linear-gradient(180deg, #87C133 0%, #68C9F2 100%)",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      background: "linear-gradient(180deg, #87C133 0%, #68C9F2 100%)",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    minHeight: 24,
    width: 3,
    border: 0,
    backgroundColor: "#eaeaf0",
    borderRadius: 1,
    marginLeft: 4,
  },
}));

// Custom step icon
const StepIconRoot = styled("div")<{
  ownerState: { completed?: boolean; active?: boolean; rejected?: boolean };
}>(({ ownerState }) => ({
  backgroundColor: "#eaeaf0",
  zIndex: 1,
  color: "#fff",
  width: 32,
  height: 32,
  display: "flex",
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
  ...(ownerState.active && {
    background: "linear-gradient(135deg, #87C133 0%, #68C9F2 100%)",
    boxShadow: "0 2px 8px 0 rgba(104, 201, 242, 0.4)",
  }),
  ...(ownerState.completed && {
    background: "linear-gradient(135deg, #87C133 0%, #68C9F2 100%)",
  }),
  ...(ownerState.rejected && {
    background: "#DC3545",
  }),
}));

// Lab workflow steps
const labSteps = [
  { key: "notified", label: "Benachrichtigt", icon: <NotificationsActive sx={{ fontSize: 16 }} /> },
  { key: "read", label: "Gelesen", icon: <Visibility sx={{ fontSize: 16 }} /> },
  { key: "in_progress", label: "In Bearbeitung", icon: <PlayArrow sx={{ fontSize: 16 }} /> },
  { key: "completed", label: "Abgeschlossen", icon: <CheckCircle sx={{ fontSize: 16 }} /> },
  { key: "dispatched", label: "Versandt", icon: <LocalShipping sx={{ fontSize: 16 }} /> },
];

// Get step index from status
const getStepIndex = (status: string): number => {
  const index = labSteps.findIndex((step) => step.key === status);
  return index >= 0 ? index : 0;
};

// Format timestamp
const formatDateTime = (dateString: string | undefined): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Custom step icon component
function CustomStepIcon(props: {
  active?: boolean;
  completed?: boolean;
  icon: React.ReactNode;
  rejected?: boolean;
}) {
  const { active, completed, icon, rejected } = props;

  return (
    <StepIconRoot ownerState={{ completed, active, rejected }}>
      {rejected ? <Cancel sx={{ fontSize: 16 }} /> : icon}
    </StepIconRoot>
  );
}

const LabStatusSection: React.FC<LabStatusSectionProps> = ({ 
  requestId, 
  labRequestId,
  variant = "vertical",
  showResubmitButton = true,
}) => {
  const navigate = useNavigate();
  
  // Use the appropriate hook based on which prop is provided
  const { data: labRequestByRequestId, isLoading: isLoadingByRequestId, error: errorByRequestId } = 
    useLabRequestByRequestId(requestId || "");
  const { data: labRequestById, isLoading: isLoadingById, error: errorById } = 
    useLabRequest(labRequestId || "");
  
  // Select the appropriate data based on which prop was provided
  const labRequest = labRequestId ? labRequestById : labRequestByRequestId;
  const isLoading = labRequestId ? isLoadingById : isLoadingByRequestId;
  const error = labRequestId ? errorById : errorByRequestId;
  
  const { data: activityLogs } = useActivityLogs(labRequest?._id || "");
  const isHorizontal = variant === "horizontal";

  const handleEditAndResubmit = () => {
    navigate(`/requests/${requestId}/edit-resubmit`);
  };

  if (isLoading) {
    return (
      <Paper
        sx={{
          borderRadius: "12px",
          background: "white",
          p: 3,
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
          border: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <Box display="flex" justifyContent="center" alignItems="center" py={3}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            Labor-Stand wird geladen...
          </Typography>
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper
        sx={{
          borderRadius: "12px",
          background: "white",
          p: 3,
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
          border: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <Alert severity="error" sx={{ borderRadius: "8px" }}>
          Fehler beim Laden des Labor-Stand.
        </Alert>
      </Paper>
    );
  }

  if (!labRequest) return null;

  const isRejected = labRequest.labStatus === "rejected";
  // Add 1 to currentStep so the current status shows as completed (the action has happened)
  const currentStep = getStepIndex(labRequest.labStatus) + 1;

  // Build timestamps map for each step using activity logs
  const stepTimestamps: Record<string, string> = {};
  
  if (activityLogs && activityLogs.length > 0) {
    // Find notification_sent log for "notified" step
    const notificationLog = activityLogs.find(
      (log) => log.actionType === "notification_sent" || 
               (log.actionType === "status_change" && log.newState === "notified")
    );
    if (notificationLog) {
      stepTimestamps["notified"] = formatDateTime(notificationLog.timestamp);
    }
    
    // Find request_viewed log or status_change to read for "read" step
    const viewedLog = activityLogs.find(
      (log) => log.actionType === "request_viewed" || 
               (log.actionType === "status_change" && log.newState === "read")
    );
    if (viewedLog) {
      stepTimestamps["read"] = formatDateTime(viewedLog.timestamp);
    }
    
    // Find status_change to in_progress for "in_progress" step
    const inProgressLog = activityLogs.find(
      (log) => log.actionType === "status_change" && log.newState === "in_progress"
    );
    if (inProgressLog) {
      stepTimestamps["in_progress"] = formatDateTime(inProgressLog.timestamp);
    }
    
    // Find status_change to completed for "completed" step
    const completedLog = activityLogs.find(
      (log) => log.actionType === "status_change" && log.newState === "completed"
    );
    if (completedLog) {
      stepTimestamps["completed"] = formatDateTime(completedLog.timestamp);
    }
    
    // Find status_change to dispatched for "dispatched" step
    const dispatchedLog = activityLogs.find(
      (log) => log.actionType === "status_change" && log.newState === "dispatched"
    );
    if (dispatchedLog) {
      stepTimestamps["dispatched"] = formatDateTime(dispatchedLog.timestamp);
    }
  } else {
    // Fallback to labRequest fields if activity logs not available
    if (labRequest.createdAt) {
      stepTimestamps["notified"] = formatDateTime(labRequest.createdAt);
    }
    if (labRequest.readAt) {
      stepTimestamps["read"] = formatDateTime(labRequest.readAt);
    }
    if (labRequest.assignedAt) {
      stepTimestamps["in_progress"] = formatDateTime(labRequest.assignedAt);
    }
    if (labRequest.completedAt) {
      stepTimestamps["completed"] = formatDateTime(labRequest.completedAt);
    }
    if (labRequest.dispatchedAt) {
      stepTimestamps["dispatched"] = formatDateTime(labRequest.dispatchedAt);
    }
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Rejection Alert Banner */}
      {isRejected && (
        <RejectionAlertBanner
          rejectionReason={labRequest.rejectionReason || ""}
          rejectionDetails={labRequest.rejectionDetails}
          rejectedBy={labRequest.rejectedBy}
          rejectedAt={labRequest.rejectedAt}
        />
      )}

      {/* Lab Status Card */}
      <Paper
        sx={{
          borderRadius: "12px",
          background: "white",
          overflow: "hidden",
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
          border: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        {/* Header with gradient background */}
        <Box
          sx={{
            p: isHorizontal ? 1.5 : 2,
            background: isRejected
              ? "linear-gradient(90deg, rgba(220, 53, 69, 0.1) 0%, rgba(220, 53, 69, 0.05) 100%)"
              : "linear-gradient(90deg, rgba(135, 193, 51, 0.1) 0%, rgba(104, 201, 242, 0.1) 100%)",
            borderBottom: "1px solid rgba(0,0,0,0.05)",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Science
            sx={{
              fontSize: 20,
              color: isRejected ? "#DC3545" : "rgba(104, 201, 242, 1)",
            }}
          />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: "14px" }}>
            Labor-Stand
          </Typography>
        </Box>

        {/* Progress Stepper */}
        <Box sx={{ p: isHorizontal ? 2 : 2.5 }}>
          {isRejected ? (
            // Show rejected state
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, py: 1 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#DC3545",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Cancel sx={{ color: "white", fontSize: 16 }} />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#DC3545" }}>
                  Abgelehnt
                </Typography>
                {labRequest.rejectedAt && (
                  <Typography variant="caption" color="text.secondary">
                    {formatDateTime(labRequest.rejectedAt)}
                  </Typography>
                )}
              </Box>
            </Box>
          ) : (
            <Stepper
              orientation={isHorizontal ? "horizontal" : "vertical"}
              activeStep={currentStep}
              connector={isHorizontal ? <HorizontalConnector /> : <VerticalConnector />}
              alternativeLabel={isHorizontal}
              sx={{
                "& .MuiStepLabel-root": {
                  padding: 0,
                },
                "& .MuiStep-root": {
                  marginBottom: 0,
                },
                ...(isHorizontal && {
                  "& .MuiStep-root": {
                    flex: 1,
                    paddingLeft: 0,
                    paddingRight: 0,
                  },
                  "& .MuiStepLabel-iconContainer": {
                    paddingRight: 0,
                  },
                }),
              }}
            >
              {labSteps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isActive = index === currentStep && Boolean(stepTimestamps[step.key]);
                const timestamp = stepTimestamps[step.key];

                return (
                  <Step key={step.key} completed={isCompleted}>
                    <StepLabel
                      slots={{
                        stepIcon: () => (
                          <CustomStepIcon
                            icon={step.icon}
                            active={isActive}
                            completed={isCompleted}
                          />
                        ),
                      }}
                      sx={{
                        "& .MuiStepLabel-labelContainer": {
                          marginLeft: isHorizontal ? 0 : 1,
                        },
                      }}
                    >
                      <Box sx={{ 
                        display: "flex", 
                        flexDirection: "column",
                        alignItems: isHorizontal ? "center" : "flex-start", 
                        gap: 0.25,
                      }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: isActive || isCompleted ? 600 : 400,
                            color: isActive || isCompleted ? "text.primary" : "text.disabled",
                            fontSize: isHorizontal ? "11px" : "13px",
                            textAlign: isHorizontal ? "center" : "left",
                          }}
                        >
                          {step.label}
                        </Typography>
                        {(isCompleted || isActive) && timestamp && (
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: isHorizontal ? "10px" : "11px",
                              color: "text.secondary",
                              textAlign: isHorizontal ? "center" : "left",
                            }}
                          >
                            {timestamp}
                          </Typography>
                        )}
                      </Box>
                    </StepLabel>
                  </Step>
                );
              })}
            </Stepper>
          )}

          {/* Assigned Technician Info - only for vertical variant */}
          {!isHorizontal && labRequest.assignedTechnician &&
            ["in_progress", "completed", "dispatched"].includes(labRequest.labStatus) && (
              <Box
                sx={{
                  mt: 2,
                  pt: 2,
                  borderTop: "1px solid rgba(0,0,0,0.05)",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Bearbeitet von:
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {`${labRequest.assignedTechnician?.firstName || ""} ${labRequest.assignedTechnician?.lastName || ""}`.trim()}
                </Typography>
              </Box>
            )}

          {/* Technician info inline for horizontal variant */}
          {isHorizontal && labRequest.assignedTechnician &&
            ["in_progress", "completed", "dispatched"].includes(labRequest.labStatus) && (
              <Box
                sx={{
                  mt: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 0.5,
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "11px" }}>
                  Bearbeitet von:
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, fontSize: "11px" }}>
                  {`${labRequest.assignedTechnician?.firstName || ""} ${labRequest.assignedTechnician?.lastName || ""}`.trim()}
                </Typography>
              </Box>
            )}
        </Box>

        {/* Resubmit Button for rejected - only for vertical variant */}
        {!isHorizontal && isRejected && showResubmitButton && (
          <Box sx={{ px: 2.5, pb: 2.5 }}>
            <ButtonBlock
              startIcon={<Refresh />}
              onClick={handleEditAndResubmit}
              style={{
                borderRadius: "8px",
                height: "44px",
                color: "white",
                background: "linear-gradient(90deg, #FF9800 0%, #F57C00 100%)",
                width: "100%",
                fontSize: "13px",
                fontWeight: "600",
                boxShadow: "0px 2px 4px rgba(255, 152, 0, 0.3)",
              }}
            >
              Bearbeiten & erneut einreichen
            </ButtonBlock>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default LabStatusSection;
