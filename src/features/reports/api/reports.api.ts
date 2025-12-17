import { apiClient } from '@services/apiClient';
import * as FileSystem from 'expo-file-system/legacy';
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
      // Validate inputs
      if (!uploadUrl) {
        throw new Error('Upload URL is required');
      }
      if (!fileUri) {
        throw new Error('File URI is required');
      }

      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!base64) {
        throw new Error('File is empty or could not be read');
      }

      // Convert base64 to Uint8Array (binary)
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Safe logging - no PHI, just URL structure check
      console.log('Uploading to:', uploadUrl.substring(0, 50) + '...');

      // Upload raw bytes via PUT (no Authorization header for signed URLs)
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': fileType,
          // Explicitly do NOT include Authorization header
        },
        body: bytes,
      });

      if (!response.ok) {
        const statusText = response.statusText || `HTTP ${response.status}`;
        // Safe error - no file URI/name in message, but include status for debugging
        throw new Error(`Upload failed: ${statusText}`);
      }
    } catch (error) {
      // Preserve error message if it's already an Error, otherwise create safe message
      if (error instanceof Error) {
        // Check if it's a network error
        if (error.message.includes('Network') || error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
          throw new Error('Network error: Could not reach upload server. Please check your connection and ensure the backend is running.');
        }
        // Safe logging - no PHI
        console.log('Upload error:', error.message);
        throw error;
      }
      // Safe error - no file URI/name in message
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

