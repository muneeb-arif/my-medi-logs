import { useMutation, useQueryClient } from '@tanstack/react-query';
import { vitalsApi } from '../api/vitals.api';
import type { CreateVitalInput } from '../types';

export const useCreateVital = (profileId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVitalInput) => vitalsApi.create(profileId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vitals', 'list', profileId] });
    },
  });
};

