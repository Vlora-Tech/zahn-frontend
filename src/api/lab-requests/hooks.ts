import {
  useQuery,
  UseQueryResult,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  LabRequest,
  GetLabRequestsResponse,
  GetLabRequestByIdResponse,
  FilterLabRequestsParams,
  UpdateLabRequestStatusDto,
  RejectLabRequestDto,
  ReassignLabRequestDto,
} from "./types";
import {
  getLabWorkQueue,
  getLabRequestById,
  getLabRequestByRequestId,
  updateLabRequestStatus,
  rejectLabRequest,
  resubmitLabRequest,
  reassignLabRequest,
  markDispatched,
} from "./requests";

// Get lab work queue with pagination and filtering
export const useLabWorkQueue = (
  params: FilterLabRequestsParams = {}
): UseQueryResult<GetLabRequestsResponse> => {
  return useQuery({
    queryKey: ["lab-requests", params],
    queryFn: () => getLabWorkQueue(params),
  });
};

// Get lab request by ID
export const useLabRequest = (
  id: string
): UseQueryResult<GetLabRequestByIdResponse> => {
  return useQuery({
    queryKey: ["lab-request", id],
    queryFn: () => getLabRequestById(id),
    enabled: !!id,
  });
};

// Get lab request by original treatment request ID
export const useLabRequestByRequestId = (
  requestId: string
): UseQueryResult<GetLabRequestByIdResponse> => {
  return useQuery({
    queryKey: ["lab-request-by-request", requestId],
    queryFn: () => getLabRequestByRequestId(requestId),
    enabled: !!requestId && requestId.length > 0,
  });
};

// Update lab request status
export const useUpdateLabRequestStatus = (): UseMutationResult<
  LabRequest,
  AxiosError,
  { id: string; data: UpdateLabRequestStatusDto },
  unknown
> => {
  return useMutation({
    mutationFn: ({ id, data }) => updateLabRequestStatus(id, data),
  });
};

// Reject a lab request
export const useRejectLabRequest = (): UseMutationResult<
  LabRequest,
  AxiosError,
  { id: string; data: RejectLabRequestDto },
  unknown
> => {
  return useMutation({
    mutationFn: ({ id, data }) => rejectLabRequest(id, data),
  });
};

// Resubmit a rejected lab request
export const useResubmitLabRequest = (): UseMutationResult<
  LabRequest,
  AxiosError,
  string,
  unknown
> => {
  return useMutation({
    mutationFn: (id) => resubmitLabRequest(id),
  });
};

// Reassign a lab request to another technician
export const useReassignLabRequest = (): UseMutationResult<
  LabRequest,
  AxiosError,
  { id: string; data: ReassignLabRequestDto },
  unknown
> => {
  return useMutation({
    mutationFn: ({ id, data }) => reassignLabRequest(id, data),
  });
};

// Mark a lab request as dispatched (sent to clinic)
export const useMarkDispatched = (): UseMutationResult<
  LabRequest,
  AxiosError,
  string,
  unknown
> => {
  return useMutation({
    mutationFn: (id) => markDispatched(id),
  });
};
