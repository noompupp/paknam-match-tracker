import { useQuery } from "@tanstack/react-query";
import { seasonsService } from "@/services/seasonsService";

export const useSeasons = () => {
  return useQuery({
    queryKey: ["seasons"],
    queryFn: () => seasonsService.getAll(),
    staleTime: 5 * 60 * 1000,
  });
};