import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createLaborzettel,
  getLaborzettelByLabRequest,
  getLaborzettelById,
  updateLaborzettel,
  deleteLaborzettel,
  getAllLaborzettel,
  GetLaborzettelParams,
} from "./requests";
import { CreateLaborzettelDto, UpdateLaborzettelDto } from "./types";

// Get all Laborzettel with pagination
export const useGetAllLaborzettel = (params: GetLaborzettelParams = {}) => {
  return useQuery({
    queryKey: ["laborzettel", "list", params],
    queryFn: () => getAllLaborzettel(params),
  });
};

// Get Laborzettel by lab request ID
export const useLaborzettelByLabRequest = (labRequestId: string) => {
  return useQuery({
    queryKey: ["laborzettel", "lab-request", labRequestId],
    queryFn: () => getLaborzettelByLabRequest(labRequestId),
    enabled: !!labRequestId,
  });
};

// Get Laborzettel by ID
export const useLaborzettel = (id: string) => {
  return useQuery({
    queryKey: ["laborzettel", id],
    queryFn: () => getLaborzettelById(id),
    enabled: !!id,
  });
};

// Create Laborzettel
export const useCreateLaborzettel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLaborzettelDto) => createLaborzettel(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["laborzettel", "lab-request", variables.labRequestId],
      });
    },
  });
};

// Update Laborzettel
export const useUpdateLaborzettel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLaborzettelDto }) =>
      updateLaborzettel(id, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ["laborzettel", result._id],
      });
      queryClient.invalidateQueries({
        queryKey: ["laborzettel", "lab-request", result.labRequest],
      });
    },
  });
};

// Delete Laborzettel
export const useDeleteLaborzettel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteLaborzettel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["laborzettel"] });
    },
  });
};
