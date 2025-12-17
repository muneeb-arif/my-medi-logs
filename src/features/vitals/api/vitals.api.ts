import { apiClient } from '@services/apiClient';
import type { CreateVitalInput, VitalEntry, VitalsListParams, VitalsListResponse } from '../types';

export const vitalsApi = {
  list: async (profileId: string, params?: VitalsListParams): Promise<VitalsListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.from) queryParams.append('from', params.from);
    if (params?.to) queryParams.append('to', params.to);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `/profiles/${profileId}/vitals${queryString ? `?${queryString}` : ''}`;
    return apiClient.get<VitalsListResponse>(endpoint);
  },

  create: async (profileId: string, data: CreateVitalInput): Promise<VitalEntry> => {
    return apiClient.post<VitalEntry>(`/profiles/${profileId}/vitals`, data);
  },

  delete: async (profileId: string, vitalId: string): Promise<void> => {
    return apiClient.delete<void>(`/profiles/${profileId}/vitals/${vitalId}`);
  },
};

