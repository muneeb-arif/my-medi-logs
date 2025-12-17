import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profilesApi } from '../api/profiles.api';
import type { ProfileSettingsInput } from '../types';

export const useUpdateProfileSettings = (profileId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProfileSettingsInput) => profilesApi.updateSettings(profileId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['profiles', 'detail', profileId] });
    },
  });
};

