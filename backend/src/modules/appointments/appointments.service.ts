import { v4 as uuidv4 } from 'uuid';
import type {
  Appointment,
  AppointmentsListParams,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from './appointments.types';

// In-memory storage: profileId -> appointments[]
const appointmentsByProfile = new Map<string, Appointment[]>();

// Seed function to create fake appointments
const seedAppointments = (profileId: string): Appointment[] => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const lastMonth = new Date(now);
  lastMonth.setMonth(lastMonth.getMonth() - 1);

  return [
    {
      id: `apt_${uuidv4().replace(/-/g, '')}`,
      profileId,
      title: 'Cardiology Follow-up',
      specialty: 'Cardiology',
      doctorName: 'Dr. Sarah Rehman',
      facility: 'St. Mary\'s Medical Center',
      location: '123 Medical St, City',
      startAt: tomorrow.toISOString(),
      endAt: new Date(tomorrow.getTime() + 30 * 60 * 1000).toISOString(),
      status: 'scheduled',
      notes: 'Bring previous test results',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: `apt_${uuidv4().replace(/-/g, '')}`,
      profileId,
      title: 'Annual Checkup',
      specialty: 'General Medicine',
      doctorName: 'Dr. Ahmed Khan',
      facility: 'City Hospital',
      startAt: nextWeek.toISOString(),
      endAt: new Date(nextWeek.getTime() + 60 * 60 * 1000).toISOString(),
      status: 'scheduled',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: `apt_${uuidv4().replace(/-/g, '')}`,
      profileId,
      title: 'Lab Results Review',
      specialty: 'Endocrinology',
      doctorName: 'Dr. Fatima Ali',
      facility: 'Medical Center',
      startAt: lastMonth.toISOString(),
      status: 'completed',
      notes: 'All results normal',
      createdAt: lastMonth.toISOString(),
      updatedAt: lastMonth.toISOString(),
    },
  ];
};

export const appointmentsService = {
  create: (profileId: string, data: CreateAppointmentInput): Appointment => {
    const appointments = appointmentsByProfile.get(profileId) || [];
    const now = new Date().toISOString();

    const appointment: Appointment = {
      id: `apt_${uuidv4().replace(/-/g, '')}`,
      profileId,
      title: data.title,
      specialty: data.specialty,
      doctorName: data.doctorName,
      facility: data.facility,
      location: data.location,
      startAt: data.startAt,
      endAt: data.endAt,
      status: data.status,
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    };

    appointments.push(appointment);
    appointmentsByProfile.set(profileId, appointments);

    return appointment;
  },

  list: (
    profileId: string,
    params?: AppointmentsListParams
  ): { items: Appointment[]; meta: { page: number; limit: number; total: number } } => {
    let appointments = appointmentsByProfile.get(profileId) || [];

    // Seed fake data if empty
    if (appointments.length === 0) {
      appointments = seedAppointments(profileId);
      appointmentsByProfile.set(profileId, appointments);
    }

    // Filter by status
    if (params?.status) {
      appointments = appointments.filter((a) => a.status === params.status);
    }

    // Filter by date range
    if (params?.from) {
      const fromDate = new Date(params.from);
      appointments = appointments.filter((a) => new Date(a.startAt) >= fromDate);
    }

    if (params?.to) {
      const toDate = new Date(params.to);
      appointments = appointments.filter((a) => new Date(a.startAt) <= toDate);
    }

    // Sort by startAt descending (newest first)
    appointments.sort((a, b) => {
      const dateA = new Date(a.startAt).getTime();
      const dateB = new Date(b.startAt).getTime();
      return dateB - dateA;
    });

    const total = appointments.length;
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;

    const paginated = appointments.slice(start, end);

    return {
      items: paginated,
      meta: {
        page,
        limit,
        total,
      },
    };
  },

  getById: (profileId: string, appointmentId: string): Appointment | undefined => {
    const appointments = appointmentsByProfile.get(profileId) || [];
    return appointments.find((a) => a.id === appointmentId);
  },

  update: (
    profileId: string,
    appointmentId: string,
    data: UpdateAppointmentInput
  ): Appointment | null => {
    const appointments = appointmentsByProfile.get(profileId) || [];
    const appointment = appointments.find((a) => a.id === appointmentId);

    if (!appointment) {
      return null;
    }

    Object.assign(appointment, {
      ...data,
      updatedAt: new Date().toISOString(),
    });

    appointmentsByProfile.set(profileId, appointments);
    return appointment;
  },

  delete: (profileId: string, appointmentId: string): boolean => {
    const appointments = appointmentsByProfile.get(profileId) || [];
    const index = appointments.findIndex((a) => a.id === appointmentId);

    if (index === -1) {
      return false;
    }

    appointments.splice(index, 1);
    appointmentsByProfile.set(profileId, appointments);
    return true;
  },
};

