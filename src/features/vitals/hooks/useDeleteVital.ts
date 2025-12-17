import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vitalsApi } from '../api/vitals.api';

export const useDeleteVital = (profileId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vitalId: string) => vitalsApi.delete(profileId, vitalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vitals', 'list', profileId] });
    },
  });
};

