
import { useQuery } from '@tanstack/react-query';
import { debugApi } from '@/services/api';

export const useDebugData = () => {
  return useQuery({
    queryKey: ['debug', 'all'],
    queryFn: debugApi.getAllRawData,
    staleTime: 0, // Always fetch fresh data for debugging
    retry: false, // Don't retry on debug queries
  });
};

export const useDebugNormalization = () => {
  return useQuery({
    queryKey: ['debug', 'normalization'],
    queryFn: debugApi.testIdNormalization,
    staleTime: 0,
    retry: false,
  });
};
