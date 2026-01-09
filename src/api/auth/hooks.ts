import {
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  LoginDto,
  LoginResponse,
  GetCurrentUserResponse,
} from "./types";
import { login, getCurrentUserInformation } from "./requests";

// Login mutation
export const useLogin = (): UseMutationResult<
  LoginResponse,
  AxiosError,
  LoginDto,
  unknown
> => {
  return useMutation({
    mutationFn: (data) => login(data),
  });
};

// Get current user information query
export const useGetCurrentUserInformation = (options?: {
  enabled?: boolean;
}): UseQueryResult<GetCurrentUserResponse> => {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUserInformation,
    enabled: options?.enabled,
  });
};