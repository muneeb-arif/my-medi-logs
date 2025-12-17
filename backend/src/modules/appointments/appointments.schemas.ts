import { z } from 'zod';

export const createAppointmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  specialty: z.string().optional(),
  doctorName: z.string().optional(),
  facility: z.string().optional(),
  location: z.string().optional(),
  startAt: z.string().min(1, 'Start date and time is required'),
  endAt: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']),
  notes: z.string().optional(),
});

export const updateAppointmentSchema = z.object({
  title: z.string().min(1).optional(),
  specialty: z.string().optional(),
  doctorName: z.string().optional(),
  facility: z.string().optional(),
  location: z.string().optional(),
  startAt: z.string().min(1).optional(),
  endAt: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
  notes: z.string().optional(),
});

