import React from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  StepConnector,
  stepConnectorClasses,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Add,
  CheckCircle,
  Cancel,
  Inventory,
  CardGiftcard,
  History,
} from "@mui/icons-material";
import { useRequestActivityLogs } from "../../../api/activity-logs/hooks";

interface RequestActivitySectionProps {
  requestId: string;
  variant?: "vertical" | "horizontal";
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

// Action type to step mapping
const actionTypeToStep: Record<string, { label: string; icon: React.ReactNode }> = {
  request_created: { label: "Erstellt", icon: <Add sx={{ fontSize: 16 }} /> },
  request_approved: { label: "Genehmigt", icon: <CheckCircle sx={{ fontSize: 16 }} /> },
  request_rejected: { label: "Abgelehnt", icon: <Cancel sx={{ fontSize: 16 }} /> },
  received_from_lab: { label: "Vom Labor erhalten", icon: <Inventory sx={{ fontSize: 16 }} /> },
  delivered_to_patient: { label: "An Patient übergeben", icon: <CardGiftcard sx={{ fontSize: 16 }} /> },
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

const RequestActivitySection: React.FC<RequestActivitySectionProps> = ({
  requestId,
  variant = "horizontal",
}) => {
  const { data: activityLogs, isLoading } = useRequestActivityLogs(requestId);
  const isHorizontal = variant === "horizontal";

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
            Aktivitätsverlauf wird geladen...
          </Typography>
        </Box>
      </Paper>
    );
  }

  if (!activityLogs || activityLogs.length === 0) {
    return null;
  }

  // Build steps from activity logs
  const steps = activityLogs
    .filter((log) => actionTypeToStep[log.actionType])
    .map((log) => ({
      key: log.actionType,
      label: actionTypeToStep[log.actionType].label,
      icon: actionTypeToStep[log.actionType].icon,
      timestamp: formatDateTime(log.timestamp),
      actorName: log.actorName,
      isRejected: log.actionType === "request_rejected",
      details: log.details,
    }));

  if (steps.length === 0) return null;

  return (
    <Paper
      sx={{
        borderRadius: "12px",
        background: "white",
        overflow: "hidden",
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
        border: "1px solid rgba(0,0,0,0.05)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: isHorizontal ? 1.5 : 2,
          background: "linear-gradient(90deg, rgba(135, 193, 51, 0.1) 0%, rgba(104, 201, 242, 0.1) 100%)",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <History sx={{ fontSize: 20, color: "rgba(104, 201, 242, 1)" }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: "14px" }}>
          Aktivitätsverlauf
        </Typography>
      </Box>

      {/* Activity Timeline */}
      <Box sx={{ p: isHorizontal ? 2 : 2.5 }}>
        <Stepper
          orientation={isHorizontal ? "horizontal" : "vertical"}
          activeStep={steps.length}
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
          {steps.map((step, index) => (
            <Step key={`${step.key}-${index}`} completed={true}>
              <StepLabel
                slots={{
                  stepIcon: () => (
                    <CustomStepIcon
                      icon={step.icon}
                      active={false}
                      completed={true}
                      rejected={step.isRejected}
                    />
                  ),
                }}
                sx={{
                  "& .MuiStepLabel-labelContainer": {
                    marginLeft: isHorizontal ? 0 : 1,
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isHorizontal ? "center" : "flex-start",
                    gap: 0.25,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: step.isRejected ? "#DC3545" : "text.primary",
                      fontSize: isHorizontal ? "11px" : "13px",
                      textAlign: isHorizontal ? "center" : "left",
                    }}
                  >
                    {step.label}
                  </Typography>
                  {step.timestamp && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: isHorizontal ? "10px" : "11px",
                        color: "text.secondary",
                        textAlign: isHorizontal ? "center" : "left",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {step.timestamp}
                    </Typography>
                  )}
                  {step.actorName && step.actorName !== "Unknown" && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: isHorizontal ? "9px" : "10px",
                        color: "text.disabled",
                        textAlign: isHorizontal ? "center" : "left",
                      }}
                    >
                      {step.actorName}
                    </Typography>
                  )}
                </Box>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>
    </Paper>
  );
};

export default RequestActivitySection;
