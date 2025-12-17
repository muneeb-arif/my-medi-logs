import { apiClient } from '@services/apiClient';
import type {
  PersonProfile,
  CreateProfileInput,
  UpdateProfileInput,
  ProfilesListResponse,
  ProfileSettingsInput,
} from '../types';

export const profilesApi = {
  list: async (): Promise<ProfilesListResponse> => {
    return apiClient.get<ProfilesListResponse>('/profiles');
  },

  getById: async (profileId: string): Promise<PersonProfile> => {
    return apiClient.get<PersonProfile>(`/profiles/${profileId}`);
  },

  create: async (data: CreateProfileInput): Promise<PersonProfile> => {
    return apiClient.post<PersonProfile>('/profiles', data);
  },

  update: async (profileId: string, data: UpdateProfileInput): Promise<PersonProfile> => {
    return apiClient.patch<PersonProfile>(`/profiles/${profileId}`, data);
  },

  delete: async (profileId: string): Promise<void> => {
    return apiClient.delete<void>(`/profiles/${profileId}`);
  },

  updateSettings: async (
    profileId: string,
    data: ProfileSettingsInput
  ): Promise<PersonProfile> => {
    return apiClient.patch<PersonProfile>(`/profiles/${profileId}/settings`, data);
  },
};

