import client from "../../services/axiosClient";
import {
  LoginDto,
  LoginResponse,
  GetCurrentUserResponse,
} from "./types";

// Login user
export const login = async (data: LoginDto): Promise<LoginResponse> => {
  const response = await client.post<LoginResponse>("/auth/login", data);
  return response.data;
};

// Get current user information
export const getCurrentUserInformation = async (): Promise<GetCurrentUserResponse> => {
  const response = await client.get<GetCurrentUserResponse>("/auth/me");
  return response.data;
};
