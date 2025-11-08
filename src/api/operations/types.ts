import { Pagination } from "../clinics/types";

export type OptionsSchema = {
  mode: "multi" | "single" | "all";
  parents: OptionsSchemaParent[];
};

export type OptionsSchemaParent = {
  label: string;
  value: string;
  onlyShowChildrenIfSelected?: boolean;
  children?: OptionsSchemaChild[];
};

export type OptionsSchemaChild =
  | { type: "text"; label?: string }
  | {
      type: "select";
      label?: string;
      options: { label: string; value: string }[];
    }
  | {
      type: "multi-select";
      label?: string;
      options: { label: string; value: string }[];
    }
  | { type: "drawing"; label?: string }
  | {
      type: "file-upload";
      label?: string;
      accept?: string[];
      maxFiles?: number;
    };

export interface CreateOperationDto {
  name: string;
  category: string;
  description?: string;
  color?: string;
  materials?: string[];
  options?: OptionsSchema;
}

export interface UpdateOperationDto {
  name?: string;
  category?: string;
  description?: string;
  color?: string;
  materials?: string[];
  options?: OptionsSchema;
}

export interface Category {
  _id: string;
  name: string;
  description: string;
}

export interface Material {
  _id: string;
  name: string;
  image: string;
  description: string;
}

export interface Option {
  _id: string;
  name: string;
  type: "selection" | "input";
  values: string[];
}

export interface Operation {
  _id: string;
  name: string;
  category: Category;
  description: string;
  color: string;
  materials: Material[];
  options: Option[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface GetOperationsResponse {
  data: Operation[];
  pagination: Pagination;
}

export type GetOperationByIdResponse = Operation;

export type GetOperationCategoriesResponse = {
  _id: string;
  name: string;
  description: string;
}[];

export interface OperationRequestBody {
  name: string;
  category: string;
  description?: string;
  color?: string;
  materials?: string[];
  options?: string[];
}
