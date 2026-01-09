
import client from "../../../services/axiosClient";
import {
  CreateRequestDto,
  UpdateRequestDto,
  TreatmentRequest,
  GetTreatmentRequestsResponse,
  GetTreatmentRequestByIdResponse,
} from "./types";

// Create treatment request
export const createTreatmentRequest = async (
  data: CreateRequestDto
): Promise<TreatmentRequest> => {
  const res = await client.post("/requests", data);
  return res.data;
};

// Get all treatment requests
export const getTreatmentRequests = async (): Promise<GetTreatmentRequestsResponse> => {
  const res = await client.get("/requests");
  return res.data;
};

// Get a treatment request by ID
export const getTreatmentRequestById = async (
  requestId: string
): Promise<GetTreatmentRequestByIdResponse> => {
  const res = await client.get(`/requests/${requestId}`);
  return res.data;
};

// Update treatment request
export const updateTreatmentRequest = async (
  requestId: string,
  data: UpdateRequestDto
): Promise<TreatmentRequest> => {
  const res = await client.patch(`/requests/${requestId}`, data);
  return res.data;
};

// Delete treatment request
export const deleteTreatmentRequest = async (
  requestId: string
): Promise<{ success: boolean }> => {
  const res = await client.delete(`/requests/${requestId}`);
  return res.data;
};
