import client from "../../services/axiosClient";
import {
  LabRequest,
  GetLabRequestsResponse,
  GetLabRequestByIdResponse,
  FilterLabRequestsParams,
  UpdateLabRequestStatusDto,
  RejectLabRequestDto,
  ReassignLabRequestDto,
} from "./types";

// Get lab request work queue with pagination and filtering
export const getLabWorkQueue = async (
  params: FilterLabRequestsParams = {}
): Promise<GetLabRequestsResponse> => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.labStatus) queryParams.append("labStatus", params.labStatus);
  if (params.assignedTechnician)
    queryParams.append("assignedTechnician", params.assignedTechnician);
  if (params.clinic) queryParams.append("clinic", params.clinic);
  if (params.search) queryParams.append("search", params.search);
  if (params.operation) queryParams.append("operation", params.operation);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const url = `/lab-requests${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const response = await client.get<GetLabRequestsResponse>(url);
  return response.data;
};

// Get lab request by ID
export const getLabRequestById = async (
  id: string
): Promise<GetLabRequestByIdResponse> => {
  const response = await client.get<GetLabRequestByIdResponse>(
    `/lab-requests/${id}`
  );
  return response.data;
};

// Get lab request by original treatment request ID
export const getLabRequestByRequestId = async (
  requestId: string
): Promise<GetLabRequestByIdResponse> => {
  const response = await client.get<GetLabRequestByIdResponse>(
    `/lab-requests/by-request/${requestId}`
  );
  return response.data;
};

// Update lab request status
export const updateLabRequestStatus = async (
  id: string,
  data: UpdateLabRequestStatusDto
): Promise<LabRequest> => {
  const response = await client.patch<LabRequest>(
    `/lab-requests/${id}/status`,
    data
  );
  return response.data;
};

// Reject a lab request
export const rejectLabRequest = async (
  id: string,
  data: RejectLabRequestDto
): Promise<LabRequest> => {
  const response = await client.post<LabRequest>(
    `/lab-requests/${id}/reject`,
    data
  );
  return response.data;
};

// Resubmit a rejected lab request
export const resubmitLabRequest = async (id: string): Promise<LabRequest> => {
  const response = await client.post<LabRequest>(
    `/lab-requests/${id}/resubmit`
  );
  return response.data;
};

// Reassign a lab request to another technician (manager only)
export const reassignLabRequest = async (
  id: string,
  data: ReassignLabRequestDto
): Promise<LabRequest> => {
  const response = await client.post<LabRequest>(
    `/lab-requests/${id}/reassign`,
    data
  );
  return response.data;
};

// Mark a lab request as dispatched (sent to clinic)
export const markDispatched = async (id: string): Promise<LabRequest> => {
  const response = await client.post<LabRequest>(
    `/lab-requests/${id}/dispatched`
  );
  return response.data;
};
