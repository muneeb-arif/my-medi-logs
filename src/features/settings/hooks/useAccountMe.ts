import { useQuery } from '@tanstack/react-query';
import { authApi } from '@features/auth/api/auth.api';

export const useAccountMe = () => {
  return useQuery({
    queryKey: ['account', 'me'],
    queryFn: () => authApi.getCurrentAccount(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

