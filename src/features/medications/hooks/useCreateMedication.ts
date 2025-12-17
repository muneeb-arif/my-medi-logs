import { useMutation, useQueryClient } from '@tanstack/react-query';
import { medicationsApi } from '../api/medications.api';
import type { CreateMedicationInput } from '../types';

export const useCreateMedication = (profileId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMedicationInput) => medicationsApi.create(profileId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medications', 'list', profileId] });
    },
  });
};

