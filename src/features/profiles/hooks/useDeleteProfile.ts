import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profilesApi } from '../api/profiles.api';
import { useActiveProfileStore } from '@store/activeProfile.store';

export const useDeleteProfile = () => {
  const queryClient = useQueryClient();
  const { activeProfileId, setActiveProfileId, clearActiveProfile } = useActiveProfileStore();

  return useMutation({
    mutationFn: (profileId: string) => profilesApi.delete(profileId),
    onSuccess: (_, deletedProfileId) => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      
      if (activeProfileId === deletedProfileId) {
        clearActiveProfile();
        queryClient.setQueryData(['profiles', 'list'], (old: any) => {
          if (!old?.items) return old;
          const remaining = old.items.filter((p: any) => p.id !== deletedProfileId);
          if (remaining.length > 0) {
            setActiveProfileId(remaining[0].id);
          }
          return { ...old, items: remaining };
        });
      }
    },
  });
};

