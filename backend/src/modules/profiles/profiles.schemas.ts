import { z } from 'zod';

export const emergencyContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relation: z.string().min(1, 'Relation is required'),
  phone: z.string().min(1, 'Phone is required'),
});

export const createProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  relationToAccount: z.string().min(1, 'Relation to account is required'),
  bloodType: z.string().optional(),
  heightCm: z.number().positive().optional(),
  weightKg: z.number().positive().optional(),
  emergencyContacts: z.array(emergencyContactSchema).min(1, 'At least one emergency contact is required'),
});

export const updateProfileSchema = createProfileSchema.partial();

export const profileSettingsSchema = z.object({
  emergencyAccessEnabled: z.boolean(),
  doctorSharingEnabled: z.boolean(),
});

