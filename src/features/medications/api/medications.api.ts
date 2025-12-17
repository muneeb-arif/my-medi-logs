import { apiClient } from '@services/apiClient';
import type {
  CreateMedicationInput,
  Medication,
  MedicationsListParams,
  MedicationsListResponse,
  UpdateMedicationInput,
} from '../types';

export const medicationsApi = {
  list: async (
    profileId: string,
    params?: MedicationsListParams
  ): Promise<MedicationsListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `/profiles/${profileId}/medications${queryString ? `?${queryString}` : ''}`;
    return apiClient.get<MedicationsListResponse>(endpoint);
  },

  getById: async (profileId: string, medicationId: string): Promise<Medication> => {
    return apiClient.get<Medication>(`/profiles/${profileId}/medications/${medicationId}`);
  },

  create: async (profileId: string, data: CreateMedicationInput): Promise<Medication> => {
    return apiClient.post<Medication>(`/profiles/${profileId}/medications`, data);
  },

  update: async (
    profileId: string,
    medicationId: string,
    data: UpdateMedicationInput
  ): Promise<Medication> => {
    return apiClient.put<Medication>(`/profiles/${profileId}/medications/${medicationId}`, data);
  },

  delete: async (profileId: string, medicationId: string): Promise<void> => {
    return apiClient.delete<void>(`/profiles/${profileId}/medications/${medicationId}`);
  },
};

