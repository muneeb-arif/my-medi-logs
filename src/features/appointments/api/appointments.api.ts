import { apiClient } from '@services/apiClient';
import type {
  Appointment,
  AppointmentsListParams,
  AppointmentsListResponse,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from '../types';

export const appointmentsApi = {
  list: async (
    profileId: string,
    params?: AppointmentsListParams
  ): Promise<AppointmentsListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.from) queryParams.append('from', params.from);
    if (params?.to) queryParams.append('to', params.to);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `/profiles/${profileId}/appointments${queryString ? `?${queryString}` : ''}`;
    return apiClient.get<AppointmentsListResponse>(endpoint);
  },

  getById: async (profileId: string, appointmentId: string): Promise<Appointment> => {
    return apiClient.get<Appointment>(`/profiles/${profileId}/appointments/${appointmentId}`);
  },

  create: async (profileId: string, data: CreateAppointmentInput): Promise<Appointment> => {
    return apiClient.post<Appointment>(`/profiles/${profileId}/appointments`, data);
  },

  update: async (
    profileId: string,
    appointmentId: string,
    data: UpdateAppointmentInput
  ): Promise<Appointment> => {
    return apiClient.put<Appointment>(`/profiles/${profileId}/appointments/${appointmentId}`, data);
  },

  delete: async (profileId: string, appointmentId: string): Promise<void> => {
    return apiClient.delete<void>(`/profiles/${profileId}/appointments/${appointmentId}`);
  },
};

