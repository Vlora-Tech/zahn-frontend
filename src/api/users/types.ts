import { Pagination } from "../clinics/types";

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  gender: "male" | "female" | "other";
  role: "nurse" | "staff";
  username: string;
  password: string;
  clinic: string;
  notes?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  gender?: "male" | "female" | "other";
  role?: "nurse" | "staff";
  username?: string;
  clinic?: string;
  notes?: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  gender: string;
  role: string;
  username: string;
  clinic: {
    _id: string;
    name: string;
    city: string;
  };
  notes: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GetUsersResponse {
  data: User[];
  pagination: Pagination;
}

export type GetUserByIdResponse = User;

export interface UserRequestBody {
  firstName: string;
  lastName: string;
  gender: "male" | "female";
  role: "nurse" | "staff";
  username: string;
  password: string;
  clinic: string;
  notes?: string;
}
