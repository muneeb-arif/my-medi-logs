import { z } from 'zod';

export const createMedicationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  genericName: z.string().optional(),
  dose: z.number().optional(),
  doseUnit: z.string().optional(),
  frequency: z.enum(['once_daily', 'twice_daily', 'three_times_daily', 'weekly', 'as_needed', 'custom']),
  schedule: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['ongoing', 'stopped']),
  conditionProfileId: z.string().optional(),
  notes: z.string().optional(),
});

export const updateMedicationSchema = z.object({
  name: z.string().min(1).optional(),
  genericName: z.string().optional(),
  dose: z.number().optional(),
  doseUnit: z.string().optional(),
  frequency: z.enum(['once_daily', 'twice_daily', 'three_times_daily', 'weekly', 'as_needed', 'custom']).optional(),
  schedule: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['ongoing', 'stopped']).optional(),
  conditionProfileId: z.string().optional(),
  notes: z.string().optional(),
});

