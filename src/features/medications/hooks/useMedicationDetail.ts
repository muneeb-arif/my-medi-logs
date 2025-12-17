import { useQuery } from '@tanstack/react-query';
import { medicationsApi } from '../api/medications.api';

export const useMedicationDetail = (profileId: string | null, medicationId: string | null) => {
  return useQuery({
    queryKey: ['medications', 'detail', profileId, medicationId],
    queryFn: () => {
      if (!profileId || !medicationId) {
        throw new Error('Profile ID and Medication ID are required');
      }
      return medicationsApi.getById(profileId, medicationId);
    },
    enabled: !!profileId && !!medicationId,
  });
};

