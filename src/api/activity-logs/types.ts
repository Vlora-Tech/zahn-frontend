// Activity action type enum values
export type ActivityActionType =
  // Lab request action types
  | "status_change"
  | "assignment"
  | "rejection"
  | "notification_sent"
  | "comment_added"
  | "request_viewed"
  | "resubmission"
  // Treatment request action types
  | "request_created"
  | "request_approved"
  | "request_rejected"
  | "received_from_lab"
  | "delivered_to_patient";

// Actor model enum values
export type ActorModel = "User" | "Doctor" | "Superadmin" | "System";

// Activity Log interface matching backend schema
export interface ActivityLog {
  _id: string;
  labRequest?: string;
  request?: string;
  actionType: ActivityActionType;
  actorId: string;
  actorName: string;
  actorModel: ActorModel;
  previousState?: string;
  newState?: string;
  details?: Record<string, unknown>;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

// Response type for activity logs list
export type GetActivityLogsResponse = ActivityLog[];
