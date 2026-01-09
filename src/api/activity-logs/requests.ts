import client from "../../services/axiosClient";
import { GetActivityLogsResponse } from "./types";

// Get activity logs for a lab request
export const getActivityLogsByLabRequest = async (
  labRequestId: string
): Promise<GetActivityLogsResponse> => {
  const response = await client.get<GetActivityLogsResponse>(
    `/activity-logs/lab-request/${labRequestId}`
  );
  return response.data;
};

// Get activity logs for a treatment request
export const getActivityLogsByRequest = async (
  requestId: string
): Promise<GetActivityLogsResponse> => {
  const response = await client.get<GetActivityLogsResponse>(
    `/activity-logs/request/${requestId}`
  );
  return response.data;
};
