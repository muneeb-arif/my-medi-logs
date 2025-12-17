import { useQuery } from '@tanstack/react-query';
import { profilesApi } from '../api/profiles.api';

export const useProfileDetail = (profileId: string | null) => {
  return useQuery({
    queryKey: ['profiles', 'detail', profileId],
    queryFn: () => {
      if (!profileId) {
        throw new Error('Profile ID is required');
      }
      return profilesApi.getById(profileId);
    },
    enabled: !!profileId,
  });
};

