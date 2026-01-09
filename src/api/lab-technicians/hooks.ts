import {
  useQuery,
  UseQueryResult,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  CreateLabTechnicianDto,
  UpdateLabTechnicianDto,
  LabTechnician,
  GetLabTechniciansResponse,
  GetLabTechnicianByIdResponse,
} from "./types";
import {
  createLabTechnician,
  getLabTechnicians,
  getLabTechnicianById,
  updateLabTechnician,
  deleteLabTechnician,
  changeLabTechnicianPassword,
  GetLabTechniciansParams,
} from "./requests";

// Create Lab Technician
export const useCreateLabTechnician = (): UseMutationResult<
  LabTechnician,
  AxiosError,
  CreateLabTechnicianDto,
  unknown
> => {
  return useMutation({
    mutationFn: (data) => createLabTechnician(data),
  });
};

// Get all Lab Technicians with pagination, sorting, and filtering
export const useGetLabTechnicians = (
  params: GetLabTechniciansParams = {}
): UseQueryResult<GetLabTechniciansResponse> => {
  return useQuery({
    queryKey: ["lab-technicians", params],
    queryFn: () => getLabTechnicians(params),
  });
};

// Get Lab Technician by ID
export const useGetLabTechnicianById = (
  id: string
): UseQueryResult<GetLabTechnicianByIdResponse> => {
  return useQuery({
    queryKey: ["lab-technician", id],
    queryFn: () => getLabTechnicianById(id),
    enabled: !!id,
  });
};

// Update Lab Technician
export const useUpdateLabTechnician = (): UseMutationResult<
  LabTechnician,
  AxiosError,
  { id: string; data: UpdateLabTechnicianDto },
  unknown
> => {
  return useMutation({
    mutationFn: ({ id, data }) => updateLabTechnician(id, data),
  });
};

// Delete Lab Technician
export const useDeleteLabTechnician = (): UseMutationResult<
  LabTechnician,
  AxiosError,
  string,
  unknown
> => {
  return useMutation({
    mutationFn: (id) => deleteLabTechnician(id),
  });
};

// Change Lab Technician Password
export const useChangeLabTechnicianPassword = (): UseMutationResult<
  { success: boolean },
  AxiosError,
  { id: string; password: string },
  unknown
> => {
  return useMutation({
    mutationFn: ({ id, password }) => changeLabTechnicianPassword(id, { password }),
  });
};
