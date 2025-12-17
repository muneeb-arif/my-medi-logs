export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface PersonProfile {
  id: string;
  accountId: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  relationToAccount: string;
  bloodType?: string;
  heightCm?: number;
  weightKg?: number;
  allergies?: string[];
  chronicConditions?: string[];
  emergencyContacts: EmergencyContact[];
  emergencyAccessEnabled: boolean;
  doctorSharingEnabled: boolean;
  photoUrl?: string | null;
  lastUpdatedAt: string;
}

export interface CreateProfileInput {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  relationToAccount: string;
  bloodType?: string;
  heightCm?: number;
  weightKg?: number;
  emergencyContacts: EmergencyContact[];
}

export interface UpdateProfileInput {
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  relationToAccount?: string;
  bloodType?: string;
  heightCm?: number;
  weightKg?: number;
  emergencyContacts?: EmergencyContact[];
}

export interface ProfileSettingsInput {
  emergencyAccessEnabled: boolean;
  doctorSharingEnabled: boolean;
}

