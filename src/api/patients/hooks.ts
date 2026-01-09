import {
  useQuery,
  UseQueryResult,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  CreatePatientDto,
  UpdatePatientDto,
  PatientResponse,
  GetPatientsResponse,
  GetPatientByIdResponse,
  PatientStats,
} from "./types";
import {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  getPatientStats,
  GetPatientsParams,
  GetPatientStatsParams,
} from "./requests";

// Create Patient
export const useCreatePatient = (): UseMutationResult<
  PatientResponse,
  AxiosError,
  CreatePatientDto,
  unknown
> => {
  return useMutation({
    mutationFn: (data) => createPatient(data),
  });
};

// Get all Patients with pagination, sorting, and filtering
export const useGetPatients = (
  params: GetPatientsParams = {}
): UseQueryResult<GetPatientsResponse> => {
  return useQuery({
    queryKey: ["patients", params],
    queryFn: () => getPatients(params),
  });
};

// Get Patient Statistics
export const useGetPatientStats = (
  params: GetPatientStatsParams = {}
): UseQueryResult<PatientStats> => {
  return useQuery({
    queryKey: ["patients", "stats", params],
    queryFn: () => getPatientStats(params),
  });
};

// Get Patient by ID
export const useGetPatientById = (
  patientId: string
): UseQueryResult<GetPatientByIdResponse> => {
  return useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId),
    enabled: !!patientId,
  });
};

// Update Patient
export const useUpdatePatient = (): UseMutationResult<
  PatientResponse,
  AxiosError,
  { patientId: string; data: UpdatePatientDto },
  unknown
> => {
  return useMutation({
    mutationFn: ({ patientId, data }) => updatePatient(patientId, data),
  });
};

// Delete Patient
export const useDeletePatient = (): UseMutationResult<
  { success: boolean },
  AxiosError,
  string,
  unknown
> => {
  return useMutation({
    mutationFn: (patientId) => deletePatient(patientId),
  });
};
