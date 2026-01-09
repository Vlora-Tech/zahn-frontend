import client from "../../services/axiosClient";
import {
  CreateRequestDto,
  UpdateRequestDto,
  ApproveRequestDto,
  RejectRequestDto,
  TreatmentRequest,
  GetTreatmentRequestsResponse,
  GetTreatmentRequestByIdResponse,
  TreatmentRequestStats,
} from "./types";

export interface GetTreatmentRequestsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: "pending_approval" | "approved" | "rejected" | "received_from_lab" | "delivered_to_patient";
  labStatus?: "new" | "notified" | "read" | "in_progress" | "completed" | "rejected" | "dispatched";
  clinic?: string;
  doctor?: string;
  patient?: string;
  tooth?: number;
  search?: string;
}

export interface GetPendingRequestsByDoctorParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface GetTreatmentRequestStatsParams {
  clinic?: string;
  doctor?: string;
}

// Create treatment request
export const createTreatmentRequest = async (
  data: CreateRequestDto
): Promise<TreatmentRequest> => {
  const response = await client.post<TreatmentRequest>("/requests", data);
  return response.data;
};

// Get all treatment requests with pagination, sorting, and filtering
export const getTreatmentRequests = async (
  params: GetTreatmentRequestsParams = {}
): Promise<GetTreatmentRequestsResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
  if (params.status) queryParams.append("status", params.status);
  if (params.labStatus) queryParams.append("labStatus", params.labStatus);
  if (params.clinic) queryParams.append("clinic", params.clinic);
  if (params.doctor) queryParams.append("doctor", params.doctor);
  if (params.patient) queryParams.append("patient", params.patient);
  if (params.tooth) queryParams.append("tooth", params.tooth.toString());
  if (params.search) queryParams.append("search", params.search);

  const url = `/requests${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const response = await client.get<GetTreatmentRequestsResponse>(url);
  return response.data;
};

// Get pending requests for doctor
export const getPendingRequestsByDoctor = async (
  doctorId: string,
  params: GetPendingRequestsByDoctorParams = {}
): Promise<GetTreatmentRequestsResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const url = `/requests/pending/${doctorId}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const response = await client.get<GetTreatmentRequestsResponse>(url);
  return response.data;
};

// Get treatment request statistics
export const getTreatmentRequestStats = async (
  params: GetTreatmentRequestStatsParams = {}
): Promise<TreatmentRequestStats> => {
  const queryParams = new URLSearchParams();
  
  if (params.clinic) queryParams.append("clinic", params.clinic);
  if (params.doctor) queryParams.append("doctor", params.doctor);

  const url = `/requests/stats${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const response = await client.get<TreatmentRequestStats>(url);
  return response.data;
};

// Get treatment request by ID
export const getTreatmentRequestById = async (
  requestId: string
): Promise<GetTreatmentRequestByIdResponse> => {
  const response = await client.get<GetTreatmentRequestByIdResponse>(`/requests/${requestId}`);
  return response.data;
};

// Update treatment request
export const updateTreatmentRequest = async (
  requestId: string,
  data: UpdateRequestDto
): Promise<TreatmentRequest> => {
  const response = await client.patch<TreatmentRequest>(`/requests/${requestId}`, data);
  return response.data;
};

// Delete treatment request
export const deleteTreatmentRequest = async (
  requestId: string
): Promise<TreatmentRequest> => {
  const response = await client.delete<TreatmentRequest>(`/requests/${requestId}`);
  return response.data;
};

// Approve treatment request
export const approveTreatmentRequest = async (
  requestId: string,
  data: ApproveRequestDto
): Promise<TreatmentRequest> => {
  const response = await client.patch<TreatmentRequest>(`/requests/${requestId}/approve`, data);
  return response.data;
};

// Reject treatment request
export const rejectTreatmentRequest = async (
  requestId: string,
  data: RejectRequestDto
): Promise<TreatmentRequest> => {
  const response = await client.patch<TreatmentRequest>(`/requests/${requestId}/reject`, data);
  return response.data;
};

// Mark treatment request as received from lab
export const markReceivedFromLab = async (
  requestId: string
): Promise<TreatmentRequest> => {
  const response = await client.patch<TreatmentRequest>(`/requests/${requestId}/received-from-lab`);
  return response.data;
};

// Mark treatment request as delivered to patient
export const markDeliveredToPatient = async (
  requestId: string
): Promise<TreatmentRequest> => {
  const response = await client.patch<TreatmentRequest>(`/requests/${requestId}/delivered-to-patient`);
  return response.data;
};
