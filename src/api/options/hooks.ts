import {
  useQuery,
  UseQueryResult,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  CreateOptionDto,
  UpdateOptionDto,
  Option,
  GetOptionsResponse,
  GetOptionByIdResponse,
  GetOptionTypesResponse,
} from "./types";
import {
  createOption,
  getOptions,
  getOptionTypes,
  getOptionById,
  updateOption,
  deleteOption,
  addValueToOption,
  removeValueFromOption,
  GetOptionsParams,
} from "./requests";

// Create Option
export const useCreateOption = (): UseMutationResult<
  Option,
  AxiosError,
  CreateOptionDto,
  unknown
> => {
  return useMutation({
    mutationFn: (data) => createOption(data),
  });
};

// Get all Options with pagination, sorting, and filtering
export const useGetOptions = (
  params: GetOptionsParams = {}
): UseQueryResult<GetOptionsResponse> => {
  return useQuery({
    queryKey: ["options", params],
    queryFn: () => getOptions(params),
  });
};

// Get Option Types
export const useGetOptionTypes = (): UseQueryResult<GetOptionTypesResponse> => {
  return useQuery({
    queryKey: ["option-types"],
    queryFn: getOptionTypes,
  });
};

// Get Option by ID
export const useGetOptionById = (
  optionId: string
): UseQueryResult<GetOptionByIdResponse> => {
  return useQuery({
    queryKey: ["option", optionId],
    queryFn: () => getOptionById(optionId),
    enabled: !!optionId,
  });
};

// Update Option
export const useUpdateOption = (): UseMutationResult<
  Option,
  AxiosError,
  { optionId: string; data: UpdateOptionDto },
  unknown
> => {
  return useMutation({
    mutationFn: ({ optionId, data }) => updateOption(optionId, data),
  });
};

// Delete Option
export const useDeleteOption = (): UseMutationResult<
  Option,
  AxiosError,
  string,
  unknown
> => {
  return useMutation({
    mutationFn: (optionId) => deleteOption(optionId),
  });
};

// Add Value to Option
export const useAddValueToOption = (): UseMutationResult<
  Option,
  AxiosError,
  { optionId: string; value: string },
  unknown
> => {
  return useMutation({
    mutationFn: ({ optionId, value }) => addValueToOption(optionId, value),
  });
};

// Remove Value from Option
export const useRemoveValueFromOption = (): UseMutationResult<
  Option,
  AxiosError,
  { optionId: string; value: string },
  unknown
> => {
  return useMutation({
    mutationFn: ({ optionId, value }) => removeValueFromOption(optionId, value),
  });
};
