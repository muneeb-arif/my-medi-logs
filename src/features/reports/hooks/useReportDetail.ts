import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../api/reports.api';

export const useReportDetail = (profileId: string | null, reportId: string | null) => {
  return useQuery({
    queryKey: ['reports', 'detail', profileId, reportId],
    queryFn: () => {
      if (!profileId || !reportId) {
        throw new Error('Profile ID and Report ID are required');
      }
      return reportsApi.getById(profileId, reportId);
    },
    enabled: !!profileId && !!reportId,
  });
};

