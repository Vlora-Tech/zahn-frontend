import {
  useQuery,
  UseQueryResult,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  CreateRequestDto,
  UpdateRequestDto,
  ApproveRequestDto,
  RejectRequestDto,
  TreatmentRequest,
  GetTreatmentRequestsResponse,
  GetTreatmentRequestByIdResponse,
  TreatmentRequestStats,
} from "./types";
import {
  createTreatmentRequest,
  getTreatmentRequests,
  getPendingRequestsByDoctor,
  getTreatmentRequestStats,
  getTreatmentRequestById,
  updateTreatmentRequest,
  deleteTreatmentRequest,
  approveTreatmentRequest,
  rejectTreatmentRequest,
  GetTreatmentRequestsParams,
  GetPendingRequestsByDoctorParams,
  GetTreatmentRequestStatsParams,
} from "./requests";

// Create Treatment Request
export const useCreateTreatmentRequest = (): UseMutationResult<
  TreatmentRequest,
  AxiosError,
  CreateRequestDto,
  unknown
> => {
  return useMutation({
    mutationFn: (data) => createTreatmentRequest(data),
  });
};

// Get all Treatment Requests with pagination, sorting, and filtering
export const useGetTreatmentRequests = (
  params: GetTreatmentRequestsParams = {}
): UseQueryResult<GetTreatmentRequestsResponse> => {
  return useQuery({
    queryKey: ["treatment-requests", params],
    queryFn: () => getTreatmentRequests(params),
  });
};

// Get Pending Requests by Doctor
export const useGetPendingRequestsByDoctor = (
  doctorId: string,
  params: GetPendingRequestsByDoctorParams = {}
): UseQueryResult<GetTreatmentRequestsResponse> => {
  return useQuery({
    queryKey: ["pending-requests", doctorId, params],
    queryFn: () => getPendingRequestsByDoctor(doctorId, params),
    enabled: !!doctorId,
  });
};

// Get Treatment Request Statistics
export const useGetTreatmentRequestStats = (
  params: GetTreatmentRequestStatsParams = {}
): UseQueryResult<TreatmentRequestStats> => {
  return useQuery({
    queryKey: ["treatment-request-stats", params],
    queryFn: () => getTreatmentRequestStats(params),
  });
};

// Get Treatment Request by ID
export const useGetTreatmentRequestById = (
  requestId: string
): UseQueryResult<GetTreatmentRequestByIdResponse> => {
  return useQuery({
    queryKey: ["treatment-request", requestId],
    queryFn: () => getTreatmentRequestById(requestId),
    enabled: !!requestId,
  });
};

// Update Treatment Request
export const useUpdateTreatmentRequest = (): UseMutationResult<
  TreatmentRequest,
  AxiosError,
  { requestId: string; data: UpdateRequestDto },
  unknown
> => {
  return useMutation({
    mutationFn: ({ requestId, data }) => updateTreatmentRequest(requestId, data),
  });
};

// Delete Treatment Request
export const useDeleteTreatmentRequest = (): UseMutationResult<
  TreatmentRequest,
  AxiosError,
  string,
  unknown
> => {
  return useMutation({
    mutationFn: (requestId) => deleteTreatmentRequest(requestId),
  });
};

// Approve Treatment Request
export const useApproveTreatmentRequest = (): UseMutationResult<
  TreatmentRequest,
  AxiosError,
  { requestId: string; data: ApproveRequestDto },
  unknown
> => {
  return useMutation({
    mutationFn: ({ requestId, data }) => approveTreatmentRequest(requestId, data),
  });
};

// Reject Treatment Request
export const useRejectTreatmentRequest = (): UseMutationResult<
  TreatmentRequest,
  AxiosError,
  { requestId: string; data: RejectRequestDto },
  unknown
> => {
  return useMutation({
    mutationFn: ({ requestId, data }) => rejectTreatmentRequest(requestId, data),
  });
};
