import { useQuery } from '@tanstack/react-query';
import { vitalsApi } from '../api/vitals.api';
import type { VitalsListParams } from '../types';

export const useVitalsList = (profileId: string | null, params?: VitalsListParams) => {
  return useQuery({
    queryKey: ['vitals', 'list', profileId, params],
    queryFn: () => {
      if (!profileId) {
        throw new Error('Profile ID is required');
      }
      return vitalsApi.list(profileId, params);
    },
    enabled: !!profileId,
  });
};

