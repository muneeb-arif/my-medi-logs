import { useQuery } from '@tanstack/react-query';
import { profilesApi } from '../api/profiles.api';

export const useProfilesList = () => {
  return useQuery({
    queryKey: ['profiles', 'list'],
    queryFn: () => profilesApi.list(),
  });
};

