// Centralized status configuration for consistent styling across the application

export type RequestStatus =
  | "pending_approval"
  | "approved"
  | "rejected"
  | "received_from_lab"
  | "delivered_to_patient";

export type LabStatus =
  | "new"
  | "notified"
  | "read"
  | "in_progress"
  | "completed"
  | "rejected"
  | "dispatched";

export interface StatusConfig {
  label: string;
  bgColor: string;
  textColor: string;
}

// Request status configuration - distinct colors
export const REQUEST_STATUS_CONFIG: Record<RequestStatus, StatusConfig> = {
  pending_approval: {
    label: "Genehmigung ausstehend",
    bgColor: "#FFF3E0", // Orange light
    textColor: "#E65100", // Orange dark
  },
  approved: {
    label: "Genehmigt",
    bgColor: "#E8F5E9", // Green light
    textColor: "#2E7D32", // Green dark
  },
  rejected: {
    label: "Abgelehnt",
    bgColor: "#FFEBEE", // Red light
    textColor: "#C62828", // Red dark
  },
  received_from_lab: {
    label: "Vom Labor erhalten",
    bgColor: "#E1F5FE", // Light blue
    textColor: "#0277BD", // Blue dark
  },
  delivered_to_patient: {
    label: "An Patient übergeben",
    bgColor: "#F3E5F5", // Purple light
    textColor: "#7B1FA2", // Purple dark
  },
};

// Lab status configuration - distinct colors
export const LAB_STATUS_CONFIG: Record<LabStatus, StatusConfig> = {
  new: {
    label: "Neu",
    bgColor: "#E3F2FD", // Blue light
    textColor: "#1565C0", // Blue dark
  },
  notified: {
    label: "Benachrichtigt",
    bgColor: "#E0F7FA", // Cyan light
    textColor: "#00838F", // Cyan dark
  },
  read: {
    label: "Gelesen",
    bgColor: "#EDE7F6", // Deep purple light
    textColor: "#5E35B1", // Deep purple dark
  },
  in_progress: {
    label: "In Bearbeitung",
    bgColor: "#FFFDE7", // Yellow light
    textColor: "#F9A825", // Yellow dark
  },
  completed: {
    label: "Abgeschlossen",
    bgColor: "#E8F5E9", // Green light
    textColor: "#2E7D32", // Green dark
  },
  rejected: {
    label: "Abgelehnt",
    bgColor: "#FFEBEE", // Red light
    textColor: "#C62828", // Red dark
  },
  dispatched: {
    label: "Versandt",
    bgColor: "#E0F2F1", // Teal light
    textColor: "#00695C", // Teal dark
  },
};

// Helper functions
export const getRequestStatusConfig = (status: string): StatusConfig => {
  return (
    REQUEST_STATUS_CONFIG[status as RequestStatus] ||
    REQUEST_STATUS_CONFIG.pending_approval
  );
};

export const getLabStatusConfig = (status: string): StatusConfig => {
  return LAB_STATUS_CONFIG[status as LabStatus] || LAB_STATUS_CONFIG.new;
};
