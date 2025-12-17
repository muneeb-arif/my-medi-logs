import { useMutation, useQueryClient } from '@tanstack/react-query';
import { medicationsApi } from '../api/medications.api';

export const useDeleteMedication = (profileId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (medicationId: string) => medicationsApi.delete(profileId, medicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications', 'list', profileId] });
    },
  });
};

