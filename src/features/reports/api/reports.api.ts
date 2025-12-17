import { apiClient } from '@services/apiClient';
import * as FileSystem from 'expo-file-system';
import type {
    CreateReportInput,
    Report,
    ReportsListParams,
    ReportsListResponse,
    UpdateReportInput,
    UploadUrlRequest,
    UploadUrlResponse,
} from '../types';

export const reportsApi = {
  getUploadUrl: async (
    profileId: string,
    data: UploadUrlRequest
  ): Promise<UploadUrlResponse> => {
    return apiClient.post<UploadUrlResponse>(
      `/profiles/${profileId}/reports/upload-url`,
      data
    );
  },

  uploadFile: async (uploadUrl: string, fileUri: string, fileType: string): Promise<void> => {
    try {
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': fileType,
        },
        body: bytes,
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }
    } catch (error) {
      throw new Error('File upload failed');
    }
  },

  create: async (profileId: string, data: CreateReportInput): Promise<Report> => {
    return apiClient.post<Report>(`/profiles/${profileId}/reports`, data);
  },

  list: async (profileId: string, params?: ReportsListParams): Promise<ReportsListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.conditionProfileId) queryParams.append('conditionProfileId', params.conditionProfileId);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    const endpoint = `/profiles/${profileId}/reports${queryString ? `?${queryString}` : ''}`;
    return apiClient.get<ReportsListResponse>(endpoint);
  },

  getById: async (profileId: string, reportId: string): Promise<Report> => {
    return apiClient.get<Report>(`/profiles/${profileId}/reports/${reportId}`);
  },

  update: async (
    profileId: string,
    reportId: string,
    data: UpdateReportInput
  ): Promise<Report> => {
    return apiClient.patch<Report>(`/profiles/${profileId}/reports/${reportId}`, data);
  },

  delete: async (profileId: string, reportId: string): Promise<void> => {
    return apiClient.delete<void>(`/profiles/${profileId}/reports/${reportId}`);
  },
};

