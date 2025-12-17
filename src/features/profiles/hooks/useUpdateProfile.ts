import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profilesApi } from '../api/profiles.api';
import type { UpdateProfileInput } from '../types';

export const useUpdateProfile = (profileId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileInput) => profilesApi.update(profileId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['profiles', 'detail', profileId] });
    },
  });
};

