import { useMutation, useQueryClient } from '@tanstack/react-query';
import { medicationsApi } from '../api/medications.api';
import type { UpdateMedicationInput } from '../types';

export const useUpdateMedication = (profileId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ medicationId, data }: { medicationId: string; data: UpdateMedicationInput }) =>
      medicationsApi.update(profileId, medicationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications', 'list', profileId] });
    },
  });
};

