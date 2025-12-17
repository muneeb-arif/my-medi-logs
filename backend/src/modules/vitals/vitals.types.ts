export type VitalType =
  | 'blood_pressure'
  | 'blood_glucose'
  | 'heart_rate'
  | 'temperature'
  | 'weight'
  | 'spo2';

export interface BloodPressureValue {
  systolic: number;
  diastolic: number;
}

export interface VitalEntry {
  id: string;
  profileId: string;
  type: VitalType;
  value: number | BloodPressureValue;
  unit: string;
  recordedAt: string;
  createdAt: string;
  conditionProfileId?: string;
  notes?: string;
}

export interface CreateVitalInput {
  type: VitalType;
  value: number | BloodPressureValue;
  unit: string;
  recordedAt: string;
  conditionProfileId?: string;
  notes?: string;
}

export interface VitalsListParams {
  type?: VitalType;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

