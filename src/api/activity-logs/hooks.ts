import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { GetActivityLogsResponse } from "./types";
import { getActivityLogsByLabRequest, getActivityLogsByRequest } from "./requests";

// Get activity logs for a lab request
export const useActivityLogs = (
  labRequestId: string
): UseQueryResult<GetActivityLogsResponse> => {
  return useQuery({
    queryKey: ["activity-logs", labRequestId],
    queryFn: () => getActivityLogsByLabRequest(labRequestId),
    enabled: !!labRequestId,
  });
};

// Get activity logs for a treatment request
export const useRequestActivityLogs = (
  requestId: string
): UseQueryResult<GetActivityLogsResponse> => {
  return useQuery({
    queryKey: ["activity-logs", "request", requestId],
    queryFn: () => getActivityLogsByRequest(requestId),
    enabled: !!requestId,
  });
};
