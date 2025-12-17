import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsApi } from '../api/reports.api';
import type { CreateReportInput, UploadUrlRequest } from '../types';

export const useCreateReport = (profileId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { input: CreateReportInput; fileUri: string; fileType: string }) => {
      const { input, fileUri, fileType } = data;

      const uploadRequest: UploadUrlRequest = {
        fileName: `report.${fileType.split('/')[1] || 'pdf'}`,
        fileType,
      };

      const { uploadUrl, fileKey } = await reportsApi.getUploadUrl(profileId, uploadRequest);

      await reportsApi.uploadFile(uploadUrl, fileUri, fileType);

      const reportInput: CreateReportInput = {
        ...input,
        fileKey,
      };

      return reportsApi.create(profileId, reportInput);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports', 'list', profileId] });
    },
  });
};

