import { z } from 'zod';

const bloodPressureValueSchema = z.object({
  systolic: z.number().min(50).max(250),
  diastolic: z.number().min(30).max(150),
});

const vitalValueSchema = z.union([
  z.number().min(0),
  bloodPressureValueSchema,
]);

export const createVitalSchema = z.object({
  type: z.enum(['blood_pressure', 'blood_glucose', 'heart_rate', 'temperature', 'weight', 'spo2']),
  value: vitalValueSchema,
  unit: z.string().min(1, 'Unit is required'),
  recordedAt: z.string().min(1, 'Recorded date is required'),
  conditionProfileId: z.string().optional(),
  notes: z.string().optional(),
});

