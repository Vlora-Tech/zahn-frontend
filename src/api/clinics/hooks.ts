import {
  useQuery,
  UseQueryResult,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  CreateClinicDto,
  UpdateClinicDto,
  Clinic,
  GetClinicsResponse,
  GetClinicByIdResponse,
} from "./types";
import {
  createClinic,
  getClinics,
  getClinicById,
  updateClinic,
  deleteClinic,
  GetClinicsParams,
} from "./requests";

// Create Clinic
export const useCreateClinic = (): UseMutationResult<
  Clinic,
  AxiosError,
  CreateClinicDto,
  unknown
> => {
  return useMutation({
    mutationFn: (data) => createClinic(data),
  });
};

// Get all Clinics with pagination and sorting
export const useGetClinics = (
  params: GetClinicsParams = {}
): UseQueryResult<GetClinicsResponse> => {
  return useQuery({
    queryKey: ["clinics", params],
    queryFn: () => getClinics(params),
  });
};

// Get Clinic by ID
export const useGetClinicById = (
  clinicId: string
): UseQueryResult<GetClinicByIdResponse> => {
  return useQuery({
    queryKey: ["clinic", clinicId],
    queryFn: () => getClinicById(clinicId),
    enabled: !!clinicId,
  });
};

// Update Clinic
export const useUpdateClinic = (): UseMutationResult<
  Clinic,
  AxiosError,
  { clinicId: string; data: UpdateClinicDto },
  unknown
> => {
  return useMutation({
    mutationFn: ({ clinicId, data }) => updateClinic(clinicId, data),
  });
};

// Delete Clinic
export const useDeleteClinic = (): UseMutationResult<
  Clinic,
  AxiosError,
  string,
  unknown
> => {
  return useMutation({
    mutationFn: (clinicId) => deleteClinic(clinicId),
  });
};
