import { Response } from 'express';
import { z } from 'zod';
import { HttpError } from '../../utils/httpError';
import { sendSuccess, sendError } from '../../utils/response';
import type { AuthRequest } from '../../middleware/auth';
import { reportsService } from './reports.service';
import { createReportSchema, updateReportSchema, uploadUrlSchema } from './reports.schemas';

const validateRequest = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new HttpError(400, 'VALIDATION_ERROR', result.error.errors[0]?.message || 'Invalid input');
  }
  return result.data;
};

export const reportsController = {
  getUploadUrl: (req: AuthRequest, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const profileId = req.params.profileId;
      const data = validateRequest(uploadUrlSchema, req.body);
      const result = reportsService.getUploadUrl(profileId, data.fileName, data.fileType);
      sendSuccess(res, result);
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'UPLOAD_URL_FAILED', 'Failed to generate upload URL', 500, requestId);
    }
  },

  create: (req: AuthRequest, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const profileId = req.params.profileId;
      const data = validateRequest(createReportSchema, req.body);
      const report = reportsService.create(profileId, data);
      sendSuccess(res, report, 201);
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'CREATE_FAILED', 'Failed to create report', 500, requestId);
    }
  },

  list: (req: AuthRequest, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const profileId = req.params.profileId;
      const params = {
        type: req.query.type as any,
        conditionProfileId: req.query.conditionProfileId as string | undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };
      const result = reportsService.list(profileId, params);
      sendSuccess(res, result);
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'FETCH_FAILED', 'Failed to fetch reports', 500, requestId);
    }
  },

  getById: (req: AuthRequest, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const profileId = req.params.profileId;
      const reportId = req.params.reportId;
      const report = reportsService.getById(profileId, reportId);

      if (!report) {
        return sendError(res, 'REPORT_NOT_FOUND', 'Report not found', 404, requestId);
      }

      sendSuccess(res, report);
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'FETCH_FAILED', 'Failed to fetch report', 500, requestId);
    }
  },

  update: (req: AuthRequest, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const profileId = req.params.profileId;
      const reportId = req.params.reportId;
      const data = validateRequest(updateReportSchema, req.body);

      try {
        const report = reportsService.update(profileId, reportId, data);
        sendSuccess(res, report);
      } catch (error: any) {
        if (error.message === 'REPORT_NOT_FOUND') {
          return sendError(res, 'REPORT_NOT_FOUND', 'Report not found', 404, requestId);
        }
        throw error;
      }
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'UPDATE_FAILED', 'Failed to update report', 500, requestId);
    }
  },

  delete: (req: AuthRequest, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const profileId = req.params.profileId;
      const reportId = req.params.reportId;

      try {
        reportsService.delete(profileId, reportId);
        sendSuccess(res, { message: 'Report deleted successfully' });
      } catch (error: any) {
        if (error.message === 'REPORT_NOT_FOUND') {
          return sendError(res, 'REPORT_NOT_FOUND', 'Report not found', 404, requestId);
        }
        throw error;
      }
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'DELETE_FAILED', 'Failed to delete report', 500, requestId);
    }
  },
};

