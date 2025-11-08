import client from "../../services/axiosClient";
import {
  CreateDoctorDto,
  UpdateDoctorDto,
  Doctor,
  GetDoctorsResponse,
  GetDoctorByIdResponse,
} from "./types";

export interface GetDoctorsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  clinic?: string;
  search?: string;
}

// Create doctor
export const createDoctor = async (
  data: CreateDoctorDto
): Promise<Doctor> => {
  const response = await client.post<Doctor>("/doctors", data);
  return response.data;
};

// Get all doctors with pagination, sorting, and filtering
export const getDoctors = async (
  params: GetDoctorsParams = {}
): Promise<GetDoctorsResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
  if (params.clinic) queryParams.append("clinic", params.clinic);
  if (params.search) queryParams.append("search", params.search);

  const url = `/doctors${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const response = await client.get<GetDoctorsResponse>(url);
  return response.data;
};

// Get doctor by ID
export const getDoctorById = async (
  doctorId: string
): Promise<GetDoctorByIdResponse> => {
  const response = await client.get<GetDoctorByIdResponse>(`/doctors/${doctorId}`);
  return response.data;
};

// Update doctor
export const updateDoctor = async (
  doctorId: string,
  data: UpdateDoctorDto
): Promise<Doctor> => {
  const response = await client.patch<Doctor>(`/doctors/${doctorId}`, data);
  return response.data;
};

// Delete doctor
export const deleteDoctor = async (
  doctorId: string
): Promise<Doctor> => {
  const response = await client.delete<Doctor>(`/doctors/${doctorId}`);
  return response.data;
};

// Change doctor password
export const changeDoctorPassword = async (
  doctorId: string,
  passwordData: { password: string }
): Promise<{ success: boolean }> => {
  const response = await client.patch<{ success: boolean }>(`/doctors/${doctorId}/password`, passwordData);
  return response.data;
};
