
import {
  useQuery,
  UseQueryResult,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  CreateRequestDto,
  TreatmentRequest,
  GetTreatmentRequestsResponse,
  GetTreatmentRequestByIdResponse,
} from "./types";
import {
  createTreatmentRequest,
  getTreatmentRequests,
  getTreatmentRequestById,
  updateTreatmentRequest,
  deleteTreatmentRequest,
} from "./requests";

// Create
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

// Get all
export const useGetTreatmentRequests = (): UseQueryResult<GetTreatmentRequestsResponse> => {
  return useQuery({
    queryKey: ["treatment-requests"],
    queryFn: getTreatmentRequests,
  });
};

// Get by ID
export const useGetTreatmentRequestById = (
  requestId: string
): UseQueryResult<GetTreatmentRequestByIdResponse> => {
  return useQuery({
    queryKey: ["treatment-request", requestId],
    queryFn: () => getTreatmentRequestById(requestId),
    enabled: !!requestId,
  });
};

// Update
export const useUpdateTreatmentRequest = (): UseMutationResult<
  TreatmentRequest,
  AxiosError,
  { requestId: string; data: Partial<CreateRequestDto> },
  unknown
> => {
  return useMutation({
    mutationFn: ({ requestId, data }) => updateTreatmentRequest(requestId, data),
  });
};

// Delete
export const useDeleteTreatmentRequest = (): UseMutationResult<
  { success: boolean },
  AxiosError,
  string,
  unknown
> => {
  return useMutation({
    mutationFn: (requestId) => deleteTreatmentRequest(requestId),
  });
};
