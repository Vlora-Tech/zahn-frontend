import React from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from "@mui/lab";
import {
  CheckCircle,
  PlayArrow,
  Visibility,
  NotificationsActive,
  Cancel,
  Assignment,
  Comment,
  Replay,
  LocalShipping,
} from "@mui/icons-material";
import { useActivityLogs } from "../../../api/activity-logs/hooks";
import { ActivityActionType } from "../../../api/activity-logs/types";

interface ActivityHistoryProps {
  labRequestId: string;
  compact?: boolean;
}

const actionConfig: Record<
  ActivityActionType,
  { label: string; color: string; icon: React.ReactNode }
> = {
  status_change: {
    label: "Status geändert",
    color: "#1976D2",
    icon: <CheckCircle fontSize="small" />,
  },
  assignment: {
    label: "Zugewiesen",
    color: "#7B1FA2",
    icon: <Assignment fontSize="small" />,
  },
  rejection: {
    label: "Abgelehnt",
    color: "#C62828",
    icon: <Cancel fontSize="small" />,
  },
  notification_sent: {
    label: "Benachrichtigung gesendet",
    color: "#E65100",
    icon: <NotificationsActive fontSize="small" />,
  },
  comment_added: {
    label: "Kommentar hinzugefügt",
    color: "#00695C",
    icon: <Comment fontSize="small" />,
  },
  request_viewed: {
    label: "Angesehen",
    color: "#5E35B1",
    icon: <Visibility fontSize="small" />,
  },
  resubmission: {
    label: "Erneut eingereicht",
    color: "#2E7D32",
    icon: <Replay fontSize="small" />,
  },
  // Treatment request action types
  request_created: {
    label: "Erstellt",
    color: "#1976D2",
    icon: <Assignment fontSize="small" />,
  },
  request_approved: {
    label: "Genehmigt",
    color: "#2E7D32",
    icon: <CheckCircle fontSize="small" />,
  },
  request_rejected: {
    label: "Abgelehnt",
    color: "#C62828",
    icon: <Cancel fontSize="small" />,
  },
  received_from_lab: {
    label: "Vom Labor erhalten",
    color: "#00695C",
    icon: <LocalShipping fontSize="small" />,
  },
  delivered_to_patient: {
    label: "An Patient übergeben",
    color: "#87C133",
    icon: <CheckCircle fontSize="small" />,
  },
};

const statusLabels: Record<string, string> = {
  new: "Neu",
  notified: "Benachrichtigt",
  read: "Gelesen",
  in_progress: "In Bearbeitung",
  completed: "Abgeschlossen",
  rejected: "Abgelehnt",
  ready_for_delivery: "Bereit zur Abholung",
};

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getActionIcon = (
  actionType: ActivityActionType,
  newState?: string
): React.ReactNode => {
  if (actionType === "status_change" && newState) {
    switch (newState) {
      case "in_progress":
        return <PlayArrow sx={{ fontSize: 14 }} />;
      case "completed":
        return <CheckCircle sx={{ fontSize: 14 }} />;
      case "rejected":
        return <Cancel sx={{ fontSize: 14 }} />;
      case "ready_for_delivery":
        return <LocalShipping sx={{ fontSize: 14 }} />;
      default:
        return actionConfig[actionType].icon;
    }
  }
  return actionConfig[actionType]?.icon || <CheckCircle sx={{ fontSize: 14 }} />;
};

const getActionColor = (
  actionType: ActivityActionType,
  newState?: string
): string => {
  if (actionType === "status_change" && newState) {
    switch (newState) {
      case "in_progress":
        return "#F9A825";
      case "completed":
        return "#2E7D32";
      case "rejected":
        return "#C62828";
      case "ready_for_delivery":
        return "#00695C";
      default:
        return actionConfig[actionType]?.color || "#1976D2";
    }
  }
  return actionConfig[actionType]?.color || "#1976D2";
};

const buildDescription = (
  actionType: ActivityActionType,
  previousState?: string,
  newState?: string,
  details?: Record<string, unknown>
): string => {
  const config = actionConfig[actionType];
  if (!config) return "Unbekannte Aktion";

  switch (actionType) {
    case "status_change":
      if (previousState && newState) {
        const prevLabel = statusLabels[previousState] || previousState;
        const newLabel = statusLabels[newState] || newState;
        return `${prevLabel} → ${newLabel}`;
      }
      if (newState) {
        return `Status: ${statusLabels[newState] || newState}`;
      }
      return config.label;

    case "assignment":
      if (details?.technicianName) {
        return `Zugewiesen an ${details.technicianName}`;
      }
      return config.label;

    case "rejection":
      if (details?.reason) {
        const reasonLabels: Record<string, string> = {
          incomplete_information: "Unvollständige Informationen",
          invalid_specifications: "Ungültige Spezifikationen",
          material_unavailable: "Material nicht verfügbar",
          equipment_issue: "Geräteproblem",
          other: "Sonstiges",
        };
        const reasonLabel =
          reasonLabels[details.reason as string] || details.reason;
        return `Abgelehnt: ${reasonLabel}`;
      }
      return config.label;

    case "notification_sent":
      return "Benachrichtigung gesendet";

    case "resubmission":
      return "Erneut eingereicht";

    default:
      return config.label;
  }
};

const ActivityHistory: React.FC<ActivityHistoryProps> = ({
  labRequestId,
  compact = false,
}) => {
  const { data: activityLogs, isLoading, error } = useActivityLogs(labRequestId);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={3}>
        <CircularProgress size={18} />
        <Typography variant="caption" color="text.secondary" sx={{ ml: 1.5 }}>
          Wird geladen...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: "8px", fontSize: "12px" }}>
        Fehler beim Laden des Aktivitätsverlaufs.
      </Alert>
    );
  }

  if (!activityLogs || activityLogs.length === 0) {
    return (
      <Box py={2}>
        <Typography
          variant="caption"
          color="text.secondary"
          textAlign="center"
          display="block"
        >
          Keine Aktivitäten vorhanden.
        </Typography>
      </Box>
    );
  }

  const sortedLogs = [...activityLogs]
    .sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
    // Filter out "new → notified" and "notified → read" status changes
    .filter((log) => {
      if (log.actionType === "status_change") {
        if (log.previousState === "new" && log.newState === "notified") {
          return false;
        }
        if (log.previousState === "notified" && log.newState === "read") {
          return false;
        }
      }
      return true;
    })
    // Keep only the first "request_viewed" action
    .filter((log, index, arr) => {
      if (log.actionType === "request_viewed") {
        const firstViewedIndex = arr.findIndex((l) => l.actionType === "request_viewed");
        return index === firstViewedIndex;
      }
      return true;
    });

  const content = (
    <Timeline
      sx={{
        padding: 0,
        margin: 0,
        "& .MuiTimelineItem-root:before": {
          flex: 0,
          padding: 0,
        },
      }}
    >
      {sortedLogs.map((log, index) => {
        const actionColor = getActionColor(log.actionType, log.newState);
        const actionIcon = getActionIcon(log.actionType, log.newState);
        const description = buildDescription(
          log.actionType,
          log.previousState,
          log.newState,
          log.details
        );
        const isLast = index === sortedLogs.length - 1;

        return (
          <TimelineItem key={log._id}>
            <TimelineOppositeContent
              sx={{
                flex: 0.35,
                py: "8px",
                px: 1,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ whiteSpace: "nowrap", fontSize: "10px" }}
              >
                {formatTimestamp(log.timestamp)}
              </Typography>
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot
                sx={{
                  backgroundColor: actionColor,
                  boxShadow: "none",
                  width: 24,
                  height: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: 0,
                }}
              >
                {actionIcon}
              </TimelineDot>
              {!isLast && (
                <TimelineConnector
                  sx={{
                    backgroundColor: "rgba(0,0,0,0.08)",
                    width: 2,
                  }}
                />
              )}
            </TimelineSeparator>
            <TimelineContent sx={{ py: "8px", px: 1.5 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 500, fontSize: "12px" }}
              >
                {description}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "10px" }}
              >
                {log.actorName}
              </Typography>
            </TimelineContent>
          </TimelineItem>
        );
      })}
    </Timeline>
  );

  if (compact) {
    return content;
  }

  return (
    <Paper
      sx={{
        borderRadius: "12px",
        background: "white",
        p: 2,
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
        border: "1px solid rgba(0,0,0,0.05)",
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{ mb: 2, fontWeight: 600, fontSize: "14px" }}
      >
        Aktivitätsverlauf
      </Typography>
      {content}
    </Paper>
  );
};

export default ActivityHistory;
