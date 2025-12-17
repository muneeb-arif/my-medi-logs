import { v4 as uuidv4 } from 'uuid';
import type {
  CreateProfileInput,
  PersonProfile,
  ProfileSettingsInput,
  UpdateProfileInput,
} from './profiles.types';

// In-memory storage: accountId -> profiles[]
const profilesByAccount = new Map<string, PersonProfile[]>();

export const profilesService = {
  list: (accountId: string): PersonProfile[] => {
    return profilesByAccount.get(accountId) || [];
  },

  getById: (accountId: string, profileId: string): PersonProfile | undefined => {
    const profiles = profilesByAccount.get(accountId) || [];
    return profiles.find((p) => p.id === profileId);
  },

  create: (accountId: string, data: CreateProfileInput): PersonProfile => {
    const profiles = profilesByAccount.get(accountId) || [];
    const now = new Date().toISOString();

    const profile: PersonProfile = {
      id: `prof_${uuidv4().replace(/-/g, '')}`,
      accountId,
      fullName: data.fullName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      relationToAccount: data.relationToAccount,
      bloodType: data.bloodType,
      heightCm: data.heightCm,
      weightKg: data.weightKg,
      allergies: [],
      chronicConditions: [],
      emergencyContacts: data.emergencyContacts,
      emergencyAccessEnabled: false,
      doctorSharingEnabled: false,
      photoUrl: null,
      lastUpdatedAt: now,
    };

    profiles.push(profile);
    profilesByAccount.set(accountId, profiles);

    return profile;
  },

  update: (
    accountId: string,
    profileId: string,
    data: UpdateProfileInput
  ): PersonProfile => {
    const profiles = profilesByAccount.get(accountId) || [];
    const index = profiles.findIndex((p) => p.id === profileId);

    if (index === -1) {
      throw new Error('PROFILE_NOT_FOUND');
    }

    const existing = profiles[index];
    const updated: PersonProfile = {
      ...existing,
      ...data,
      lastUpdatedAt: new Date().toISOString(),
    };

    profiles[index] = updated;
    profilesByAccount.set(accountId, profiles);

    return updated;
  },

  delete: (accountId: string, profileId: string): void => {
    const profiles = profilesByAccount.get(accountId) || [];
    const filtered = profiles.filter((p) => p.id !== profileId);

    if (filtered.length === profiles.length) {
      throw new Error('PROFILE_NOT_FOUND');
    }

    profilesByAccount.set(accountId, filtered);
  },

  updateSettings: (
    accountId: string,
    profileId: string,
    data: ProfileSettingsInput
  ): PersonProfile => {
    const profiles = profilesByAccount.get(accountId) || [];
    const index = profiles.findIndex((p) => p.id === profileId);

    if (index === -1) {
      throw new Error('PROFILE_NOT_FOUND');
    }

    const existing = profiles[index];
    const updated: PersonProfile = {
      ...existing,
      emergencyAccessEnabled: data.emergencyAccessEnabled,
      doctorSharingEnabled: data.doctorSharingEnabled,
      lastUpdatedAt: new Date().toISOString(),
    };

    profiles[index] = updated;
    profilesByAccount.set(accountId, profiles);

    return updated;
  },
};

