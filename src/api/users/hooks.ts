import {
  useQuery,
  UseQueryResult,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  CreateUserDto,
  UpdateUserDto,
  User,
  GetUsersResponse,
  GetUserByIdResponse,
} from "./types";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  changeUserPassword,
  GetUsersParams,
} from "./requests";

// Create User
export const useCreateUser = (): UseMutationResult<
  User,
  AxiosError,
  CreateUserDto,
  unknown
> => {
  return useMutation({
    mutationFn: (data) => createUser(data),
  });
};

// Get all Users with pagination, sorting, and filtering
export const useGetUsers = (
  params: GetUsersParams = {}
): UseQueryResult<GetUsersResponse> => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => getUsers(params),
  });
};

// Get User by ID
export const useGetUserById = (
  userId: string
): UseQueryResult<GetUserByIdResponse> => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });
};

// Update User
export const useUpdateUser = (): UseMutationResult<
  User,
  AxiosError,
  { userId: string; data: UpdateUserDto },
  unknown
> => {
  return useMutation({
    mutationFn: ({ userId, data }) => updateUser(userId, data),
  });
};

// Delete User
export const useDeleteUser = (): UseMutationResult<
  User,
  AxiosError,
  string,
  unknown
> => {
  return useMutation({
    mutationFn: (userId) => deleteUser(userId),
  });
};

// Change User Password
export const useChangeUserPassword = (): UseMutationResult<
  { success: boolean },
  AxiosError,
  { userId: string; password: string },
  unknown
> => {
  return useMutation({
    mutationFn: ({ userId, password }) => changeUserPassword(userId, { password }),
  });
};
