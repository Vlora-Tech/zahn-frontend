import client from "../../services/axiosClient";
import {
  CreateLabTechnicianDto,
  UpdateLabTechnicianDto,
  LabTechnician,
  GetLabTechniciansResponse,
  GetLabTechnicianByIdResponse,
} from "./types";

export interface GetLabTechniciansParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  clinic?: string;
  search?: string;
}

// Create lab technician
export const createLabTechnician = async (
  data: CreateLabTechnicianDto
): Promise<LabTechnician> => {
  const requestData = {
    ...data,
    role: "lab_technician",
  };
  const response = await client.post<LabTechnician>("/users", requestData);
  return response.data;
};

// Get all lab technicians with pagination, sorting, and filtering
export const getLabTechnicians = async (
  params: GetLabTechniciansParams = {}
): Promise<GetLabTechniciansResponse> => {
  const queryParams = new URLSearchParams();
  
  queryParams.append("role", "lab_technician");
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
  if (params.clinic) queryParams.append("clinic", params.clinic);
  if (params.search) queryParams.append("search", params.search);

  const url = `/users?${queryParams.toString()}`;
  const response = await client.get<GetLabTechniciansResponse>(url);
  return response.data;
};

// Get lab technician by ID
export const getLabTechnicianById = async (
  id: string
): Promise<GetLabTechnicianByIdResponse> => {
  const response = await client.get<GetLabTechnicianByIdResponse>(`/users/${id}`);
  return response.data;
};

// Update lab technician
export const updateLabTechnician = async (
  id: string,
  data: UpdateLabTechnicianDto
): Promise<LabTechnician> => {
  const response = await client.patch<LabTechnician>(`/users/${id}`, data);
  return response.data;
};

// Delete lab technician
export const deleteLabTechnician = async (
  id: string
): Promise<LabTechnician> => {
  const response = await client.delete<LabTechnician>(`/users/${id}`);
  return response.data;
};

// Change lab technician password
export const changeLabTechnicianPassword = async (
  id: string,
  passwordData: { password: string }
): Promise<{ success: boolean }> => {
  const response = await client.patch<{ success: boolean }>(`/users/${id}/password`, passwordData);
  return response.data;
};
