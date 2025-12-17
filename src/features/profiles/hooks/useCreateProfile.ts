import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profilesApi } from '../api/profiles.api';
import type { CreateProfileInput } from '../types';

export const useCreateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProfileInput) => profilesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
};

