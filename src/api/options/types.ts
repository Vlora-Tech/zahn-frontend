import { Pagination } from "../clinics/types";

export interface CreateOptionDto {
  name: string;
  type: "selection" | "input";
  values: string[];
  operation: string;
  material?: string;
}

export interface UpdateOptionDto {
  name?: string;
  type?: "selection" | "input";
  values?: string[];
  operation?: string;
  material?: string;
}

export interface Option {
  _id: string;
  name: string;
  type: "selection" | "input";
  values: string[];
  operation: {
    _id: string;
    name: string;
    category: string;
    description: string;
  };
  material?: {
    _id: string;
    name: string;
    description: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GetOptionsResponse {
  data: Option[];
  pagination: Pagination;
}

export type GetOptionByIdResponse = Option;

export type GetOptionTypesResponse = string[];

export interface OptionRequestBody {
  name: string;
  type: "selection" | "input";
  values: string[];
  operation: string;
  material?: string;
}
