import client from "../../services/axiosClient";
import {
  CreateUserDto,
  UpdateUserDto,
  User,
  GetUsersResponse,
  GetUserByIdResponse,
} from "./types";

export interface GetUsersParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  clinic?: string;
  search?: string;
}

// Create user
export const createUser = async (
  data: CreateUserDto
): Promise<User> => {
  const response = await client.post<User>("/users", data);
  return response.data;
};

// Get all users with pagination, sorting, and filtering
export const getUsers = async (
  params: GetUsersParams = {}
): Promise<GetUsersResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
  if (params.clinic) queryParams.append("clinic", params.clinic);
  if (params.search) queryParams.append("search", params.search);

  const url = `/users${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  const response = await client.get<GetUsersResponse>(url);
  return response.data;
};

// Get user by ID
export const getUserById = async (
  userId: string
): Promise<GetUserByIdResponse> => {
  const response = await client.get<GetUserByIdResponse>(`/users/${userId}`);
  return response.data;
};

// Update user
export const updateUser = async (
  userId: string,
  data: UpdateUserDto
): Promise<User> => {
  const response = await client.patch<User>(`/users/${userId}`, data);
  return response.data;
};

// Delete user
export const deleteUser = async (
  userId: string
): Promise<User> => {
  const response = await client.delete<User>(`/users/${userId}`);
  return response.data;
};

// Change user password
export const changeUserPassword = async (
  userId: string,
  passwordData: { password: string }
): Promise<{ success: boolean }> => {
  const response = await client.patch<{ success: boolean }>(`/users/${userId}/password`, passwordData);
  return response.data;
};
