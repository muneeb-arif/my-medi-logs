import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi } from '../api/reports.api';

export const useDeleteReport = (profileId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: string) => reportsApi.delete(profileId, reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'list', profileId] });
    },
  });
};

