import {
  useQuery,
  UseQueryResult,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  CreateDoctorDto,
  UpdateDoctorDto,
  Doctor,
  GetDoctorsResponse,
  GetDoctorByIdResponse,
} from "./types";
import {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  changeDoctorPassword,
  GetDoctorsParams,
} from "./requests";

// Create Doctor
export const useCreateDoctor = (): UseMutationResult<
  Doctor,
  AxiosError,
  CreateDoctorDto,
  unknown
> => {
  return useMutation({
    mutationFn: (data) => createDoctor(data),
  });
};

// Get all Doctors with pagination, sorting, and filtering
export const useGetDoctors = (
  params: GetDoctorsParams = {}
): UseQueryResult<GetDoctorsResponse> => {
  return useQuery({
    queryKey: ["doctors", params],
    queryFn: () => getDoctors(params),
  });
};

// Get Doctor by ID
export const useGetDoctorById = (
  doctorId: string
): UseQueryResult<GetDoctorByIdResponse> => {
  return useQuery({
    queryKey: ["doctor", doctorId],
    queryFn: () => getDoctorById(doctorId),
    enabled: !!doctorId,
  });
};

// Update Doctor
export const useUpdateDoctor = (): UseMutationResult<
  Doctor,
  AxiosError,
  { doctorId: string; data: UpdateDoctorDto },
  unknown
> => {
  return useMutation({
    mutationFn: ({ doctorId, data }) => updateDoctor(doctorId, data),
  });
};

// Delete Doctor
export const useDeleteDoctor = (): UseMutationResult<
  Doctor,
  AxiosError,
  string,
  unknown
> => {
  return useMutation({
    mutationFn: (doctorId) => deleteDoctor(doctorId),
  });
};

// Change Doctor Password
export const useChangeDoctorPassword = (): UseMutationResult<
  { success: boolean },
  AxiosError,
  { doctorId: string; password: string },
  unknown
> => {
  return useMutation({
    mutationFn: ({ doctorId, password }) => changeDoctorPassword(doctorId, { password }),
  });
};
