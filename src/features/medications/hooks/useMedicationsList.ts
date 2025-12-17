import { useQuery } from '@tanstack/react-query';
import { medicationsApi } from '../api/medications.api';
import type { MedicationsListParams } from '../types';

export const useMedicationsList = (profileId: string | null, params?: MedicationsListParams) => {
  return useQuery({
    queryKey: ['medications', 'list', profileId, params],
    queryFn: () => {
      if (!profileId) {
        throw new Error('Profile ID is required');
      }
      return medicationsApi.list(profileId, params);
    },
    enabled: !!profileId,
  });
};

