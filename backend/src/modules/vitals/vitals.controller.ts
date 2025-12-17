import { Response } from 'express';
import { z } from 'zod';
import { HttpError } from '../../utils/httpError';
import { sendSuccess, sendError } from '../../utils/response';
import type { AuthRequest } from '../../middleware/auth';
import { vitalsService } from './vitals.service';
import { createVitalSchema } from './vitals.schemas';

const validateRequest = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new HttpError(400, 'VALIDATION_ERROR', result.error.errors[0]?.message || 'Invalid input');
  }
  return result.data;
};

export const vitalsController = {
  create: (req: AuthRequest, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const profileId = req.params.profileId;
      const data = validateRequest(createVitalSchema, req.body);
      const vital = vitalsService.create(profileId, data);
      sendSuccess(res, vital, 201);
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'CREATE_FAILED', 'Failed to create vital', 500, requestId);
    }
  },

  list: (req: AuthRequest, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const profileId = req.params.profileId;
      const params: any = {};

      if (req.query.type) {
        params.type = req.query.type;
      }
      if (req.query.from) {
        params.from = req.query.from;
      }
      if (req.query.to) {
        params.to = req.query.to;
      }
      if (req.query.page) {
        params.page = parseInt(req.query.page as string, 10);
      }
      if (req.query.limit) {
        params.limit = parseInt(req.query.limit as string, 10);
      }

      const result = vitalsService.list(profileId, params);
      sendSuccess(res, result);
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'FETCH_FAILED', 'Failed to fetch vitals', 500, requestId);
    }
  },

  getById: (req: AuthRequest, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const profileId = req.params.profileId;
      const vitalId = req.params.vitalId;
      const vital = vitalsService.getById(profileId, vitalId);

      if (!vital) {
        return sendError(res, 'VITAL_NOT_FOUND', 'Vital not found', 404, requestId);
      }

      sendSuccess(res, vital);
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'FETCH_FAILED', 'Failed to fetch vital', 500, requestId);
    }
  },

  delete: (req: AuthRequest, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const profileId = req.params.profileId;
      const vitalId = req.params.vitalId;
      const deleted = vitalsService.delete(profileId, vitalId);

      if (!deleted) {
        return sendError(res, 'VITAL_NOT_FOUND', 'Vital not found', 404, requestId);
      }

      sendSuccess(res, { message: 'Vital deleted successfully' });
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'DELETE_FAILED', 'Failed to delete vital', 500, requestId);
    }
  },
};

