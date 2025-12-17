export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  profileId: string;
  title: string;
  specialty?: string;
  doctorName?: string;
  facility?: string;
  location?: string;
  startAt: string;
  endAt?: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateAppointmentInput {
  title: string;
  specialty?: string;
  doctorName?: string;
  facility?: string;
  location?: string;
  startAt: string;
  endAt?: string;
  status: AppointmentStatus;
  notes?: string;
}

export interface UpdateAppointmentInput {
  title?: string;
  specialty?: string;
  doctorName?: string;
  facility?: string;
  location?: string;
  startAt?: string;
  endAt?: string;
  status?: AppointmentStatus;
  notes?: string;
}

export interface AppointmentsListParams {
  status?: AppointmentStatus;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

