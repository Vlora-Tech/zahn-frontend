export interface LoginDto {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    username: string;
    role: string;
    clinic?: {
      _id: string;
      name: string;
      city: string;
    };
  };
}

export interface GetCurrentUserResponse {
  _id: string;
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  role: "superadmin" | "doctor" | "nurse" | "staff";
  clinic?: {
    _id: string;
    name: string;
    city: string;
  };
  gender?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface AuthUser {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  role: "superadmin" | "doctor" | "nurse" | "staff";
  clinic?: {
    _id: string;
    name: string;
    city: string;
  };
  gender?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}