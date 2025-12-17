export type MedicationStatus = 'ongoing' | 'stopped';

export type MedicationFrequency =
  | 'once_daily'
  | 'twice_daily'
  | 'three_times_daily'
  | 'weekly'
  | 'as_needed'
  | 'custom';

export interface Medication {
  id: string;
  profileId: string;
  name: string;
  genericName?: string;
  dose?: number;
  doseUnit?: string;
  frequency: MedicationFrequency;
  schedule?: string;
  startDate?: string;
  endDate?: string;
  status: MedicationStatus;
  conditionProfileId?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateMedicationInput {
  name: string;
  genericName?: string;
  dose?: number;
  doseUnit?: string;
  frequency: MedicationFrequency;
  schedule?: string;
  startDate?: string;
  endDate?: string;
  status: MedicationStatus;
  conditionProfileId?: string;
  notes?: string;
}

export interface UpdateMedicationInput {
  name?: string;
  genericName?: string;
  dose?: number;
  doseUnit?: string;
  frequency?: MedicationFrequency;
  schedule?: string;
  startDate?: string;
  endDate?: string;
  status?: MedicationStatus;
  conditionProfileId?: string;
  notes?: string;
}

export interface MedicationsListParams {
  status?: MedicationStatus;
  page?: number;
  limit?: number;
}

