import client from "../../services/axiosClient";
import {
  CreatePatientDto,
  UpdatePatientDto,
  PatientResponse,
  GetPatientsResponse,
  GetPatientByIdResponse,
  PatientStats,
} from "./types";

export interface GetPatientsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  clinic?: string;
  doctor?: string;
  search?: string;
}

export interface GetPatientStatsParams {
  clinic?: string;
}

// Create patient
export const createPatient = async (
  data: CreatePatientDto
): Promise<PatientResponse> => {
  const res = await client.post<PatientResponse>("/patients", data);
  return res.data;
};

// Get all patients with pagination, sorting, and filtering
export const getPatients = async (
  params: GetPatientsParams = {}
): Promise<GetPatientsResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
  if (params.clinic) queryParams.append("clinic", params.clinic);
  if (params.doctor) queryParams.append("doctor", params.doctor);
  if (params.search) queryParams.append("search", params.search);

  const url = `/patients${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const res = await client.get<GetPatientsResponse>(url);
  return res.data;
};

// Get patient statistics
export const getPatientStats = async (
  params: GetPatientStatsParams = {}
): Promise<PatientStats> => {
  const queryParams = new URLSearchParams();
  
  if (params.clinic) queryParams.append("clinic", params.clinic);

  const url = `/patients/stats${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const res = await client.get<PatientStats>(url);
  return res.data;
};

// Get patient by ID
export const getPatientById = async (
  patientId: string
): Promise<GetPatientByIdResponse> => {
  const res = await client.get<GetPatientByIdResponse>(`/patients/${patientId}`);
  return res.data;
};

// Update patient
export const updatePatient = async (
  patientId: string,
  data: UpdatePatientDto
): Promise<PatientResponse> => {
  const res = await client.patch<PatientResponse>(`/patients/${patientId}`, data);
  return res.data;
};

// Delete patient
export const deletePatient = async (
  patientId: string
): Promise<{ success: boolean }> => {
  const res = await client.delete<{ success: boolean }>(`/patients/${patientId}`);
  return res.data;
};
