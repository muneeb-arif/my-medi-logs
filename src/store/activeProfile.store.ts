import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface ActiveProfileState {
  activeProfileId: string | null;
  setActiveProfileId: (profileId: string | null) => Promise<void>;
  clearActiveProfile: () => Promise<void>;
  hydrate: () => Promise<void>;
}

const ACTIVE_PROFILE_KEY = 'active_profile_id';

export const useActiveProfileStore = create<ActiveProfileState>((set) => ({
  activeProfileId: null,

  setActiveProfileId: async (profileId: string | null) => {
    if (profileId) {
      await SecureStore.setItemAsync(ACTIVE_PROFILE_KEY, profileId);
    } else {
      await SecureStore.deleteItemAsync(ACTIVE_PROFILE_KEY);
    }
    set({ activeProfileId: profileId });
  },

  clearActiveProfile: async () => {
    await SecureStore.deleteItemAsync(ACTIVE_PROFILE_KEY);
    set({ activeProfileId: null });
  },

  hydrate: async () => {
    try {
      const profileId = await SecureStore.getItemAsync(ACTIVE_PROFILE_KEY);
      set({ activeProfileId: profileId });
    } catch {
      set({ activeProfileId: null });
    }
  },
}));

