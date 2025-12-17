import { Response } from 'express';
import { z } from 'zod';
import { HttpError } from '../../utils/httpError';
import { sendSuccess, sendError } from '../../utils/response';
import type { AuthRequest } from '../../middleware/auth';
import { medicationsService } from './medications.service';
import { createMedicationSchema, updateMedicationSchema } from './medications.schemas';

const validateRequest = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new HttpError(400, 'VALIDATION_ERROR', result.error.errors[0]?.message || 'Invalid input');
  }
  return result.data;
};

export const medicationsController = {
  create: (req: AuthRequest, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const profileId = req.params.profileId;
      const data = validateRequest(createMedicationSchema, req.body);
      const medication = medicationsService.create(profileId, data);
      sendSuccess(res, medication, 201);
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'CREATE_FAILED', 'Failed to create medication', 500, requestId);
    }
  },

  list: (req: AuthRequest, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const profileId = req.params.profileId;
      const params: any = {};

      if (req.query.status) {
        params.status = req.query.status;
      }
      if (req.query.page) {
        params.page = parseInt(req.query.page as string, 10);
      }
      if (req.query.limit) {
        params.limit = parseInt(req.query.limit as string, 10);
      }

      const result = medicationsService.list(profileId, params);
      sendSuccess(res, result);
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'FETCH_FAILED', 'Failed to fetch medications', 500, requestId);
    }
  },

  getById: (req: AuthRequest, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const profileId = req.params.profileId;
      const medicationId = req.params.medicationId;
      const medication = medicationsService.getById(profileId, medicationId);

      if (!medication) {
        return sendError(res, 'MEDICATION_NOT_FOUND', 'Medication not found', 404, requestId);
      }

      sendSuccess(res, medication);
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'FETCH_FAILED', 'Failed to fetch medication', 500, requestId);
    }
  },

  update: (req: AuthRequest, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const profileId = req.params.profileId;
      const medicationId = req.params.medicationId;
      const data = validateRequest(updateMedicationSchema, req.body);
      const medication = medicationsService.update(profileId, medicationId, data);

      if (!medication) {
        return sendError(res, 'MEDICATION_NOT_FOUND', 'Medication not found', 404, requestId);
      }

      sendSuccess(res, medication);
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'UPDATE_FAILED', 'Failed to update medication', 500, requestId);
    }
  },

  delete: (req: AuthRequest, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const profileId = req.params.profileId;
      const medicationId = req.params.medicationId;
      const deleted = medicationsService.delete(profileId, medicationId);

      if (!deleted) {
        return sendError(res, 'MEDICATION_NOT_FOUND', 'Medication not found', 404, requestId);
      }

      sendSuccess(res, { message: 'Medication deleted successfully' });
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'DELETE_FAILED', 'Failed to delete medication', 500, requestId);
    }
  },
};

