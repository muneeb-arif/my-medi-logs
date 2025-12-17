import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../api/reports.api';
import type { ReportsListParams } from '../types';

export const useReportsList = (profileId: string | null, params?: ReportsListParams) => {
  return useQuery({
    queryKey: ['reports', 'list', profileId, params],
    queryFn: () => {
      if (!profileId) {
        throw new Error('Profile ID is required');
      }
      return reportsApi.list(profileId, params);
    },
    enabled: !!profileId,
  });
};

