import { Pagination } from "../clinics/types";
import { TreatmentRequest } from "../treatment-requests/types";
import { User } from "../users/types";
import { Clinic } from "../clinics/types";

// Lab Status enum values
export type LabStatus =
  | "new"
  | "notified"
  | "read"
  | "in_progress"
  | "completed"
  | "rejected"
  | "dispatched";

// Rejection reason enum values
export type RejectionReason =
  | "incomplete_information"
  | "invalid_specifications"
  | "material_unavailable"
  | "equipment_issue"
  | "other";

// Lab Request interface matching backend schema
export interface LabRequest {
  _id: string;
  request: TreatmentRequest;
  clinic: Clinic;
  labStatus: LabStatus;
  assignedTechnician?: User;
  assignedTechnicianName?: string;
  assignedAt?: string;
  readAt?: string;
  rejectionReason?: RejectionReason;
  rejectionDetails?: string;
  rejectedBy?: User;
  rejectedAt?: string;
  completedAt?: string;
  completedBy?: User;
  readyForReportGeneration: boolean;
  labReportPlaceholder?: Record<string, unknown>;
  dispatchedAt?: string;
  dispatchedBy?: User;
  createdAt: string;
  updatedAt: string;
}

// Filter parameters for work queue
export interface FilterLabRequestsParams {
  page?: number;
  limit?: number;
  labStatus?: LabStatus;
  assignedTechnician?: string;
  clinic?: string;
  search?: string;
  operation?: string;
  sortBy?: "requestNumber" | "deliveryDate" | "createdAt";
  sortOrder?: "asc" | "desc";
}

// Response type for paginated lab requests
export interface GetLabRequestsResponse {
  data: LabRequest[];
  pagination: Pagination;
}

// Response type for single lab request
export type GetLabRequestByIdResponse = LabRequest;

// DTO for updating lab request status
export interface UpdateLabRequestStatusDto {
  status: "read" | "in_progress" | "completed";
}

// DTO for rejecting a lab request
export interface RejectLabRequestDto {
  reason: RejectionReason;
  details?: string;
}

// DTO for reassigning a lab request
export interface ReassignLabRequestDto {
  newTechnicianId: string;
}
