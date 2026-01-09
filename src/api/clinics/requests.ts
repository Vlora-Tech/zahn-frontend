import client from "../../services/axiosClient";
import {
  CreateClinicDto,
  UpdateClinicDto,
  Clinic,
  GetClinicsResponse,
  GetClinicByIdResponse,
} from "./types";

export interface GetClinicsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}

// Create clinic
export const createClinic = async (
  data: CreateClinicDto
): Promise<Clinic> => {
  const response = await client.post<Clinic>("/clinics", data);
  return response.data;
};

// Get all clinics with pagination and sorting
export const getClinics = async (
  params: GetClinicsParams = {}
): Promise<GetClinicsResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
  if (params.search) queryParams.append("search", params.search);

  const url = `/clinics${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const response = await client.get<GetClinicsResponse>(url);
  return response.data;
};

// Get clinic by ID
export const getClinicById = async (
  clinicId: string
): Promise<GetClinicByIdResponse> => {
  const response = await client.get<GetClinicByIdResponse>(`/clinics/${clinicId}`);
  return response.data;
};

// Update clinic
export const updateClinic = async (
  clinicId: string,
  data: UpdateClinicDto
): Promise<Clinic> => {
  const response = await client.patch<Clinic>(`/clinics/${clinicId}`, data);
  return response.data;
};

// Delete clinic
export const deleteClinic = async (
  clinicId: string
): Promise<Clinic> => {
  const response = await client.delete<Clinic>(`/clinics/${clinicId}`);
  return response.data;
};
