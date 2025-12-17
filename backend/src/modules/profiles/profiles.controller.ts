import { Response } from 'express';
import { z } from 'zod';
import { HttpError } from '../../utils/httpError';
import { sendSuccess, sendError } from '../../utils/response';
import type { AuthRequest } from '../../middleware/auth';
import { profilesService } from './profiles.service';
import {
  createProfileSchema,
  profileSettingsSchema,
  updateProfileSchema,
} from './profiles.schemas';

const validateRequest = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new HttpError(400, 'VALIDATION_ERROR', result.error.errors[0]?.message || 'Invalid input');
  }
  return result.data;
};

export const profilesController = {
  list: (req: AuthRequest, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const accountId = req.accountId!;
      const profiles = profilesService.list(accountId);
      sendSuccess(res, { items: profiles });
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'FETCH_FAILED', 'Failed to fetch profiles', 500, requestId);
    }
  },

  getById: (req: AuthRequest, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const accountId = req.accountId!;
      const profileId = req.params.profileId;
      const profile = profilesService.getById(accountId, profileId);

      if (!profile) {
        return sendError(res, 'PROFILE_NOT_FOUND', 'Profile not found', 404, requestId);
      }

      sendSuccess(res, profile);
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'FETCH_FAILED', 'Failed to fetch profile', 500, requestId);
    }
  },

  create: (req: AuthRequest, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const accountId = req.accountId!;
      const data = validateRequest(createProfileSchema, req.body);
      const profile = profilesService.create(accountId, data);
      sendSuccess(res, profile, 201);
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'CREATE_FAILED', 'Failed to create profile', 500, requestId);
    }
  },

  update: (req: AuthRequest, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const accountId = req.accountId!;
      const profileId = req.params.profileId;
      const data = validateRequest(updateProfileSchema, req.body);

      try {
        const profile = profilesService.update(accountId, profileId, data);
        sendSuccess(res, profile);
      } catch (error: any) {
        if (error.message === 'PROFILE_NOT_FOUND') {
          return sendError(res, 'PROFILE_NOT_FOUND', 'Profile not found', 404, requestId);
        }
        throw error;
      }
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'UPDATE_FAILED', 'Failed to update profile', 500, requestId);
    }
  },

  delete: (req: AuthRequest, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const accountId = req.accountId!;
      const profileId = req.params.profileId;

      try {
        profilesService.delete(accountId, profileId);
        sendSuccess(res, { message: 'Profile deleted successfully' });
      } catch (error: any) {
        if (error.message === 'PROFILE_NOT_FOUND') {
          return sendError(res, 'PROFILE_NOT_FOUND', 'Profile not found', 404, requestId);
        }
        throw error;
      }
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'DELETE_FAILED', 'Failed to delete profile', 500, requestId);
    }
  },

  updateSettings: (req: AuthRequest, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const accountId = req.accountId!;
      const profileId = req.params.profileId;
      const data = validateRequest(profileSettingsSchema, req.body);

      try {
        const profile = profilesService.updateSettings(accountId, profileId, data);
        sendSuccess(res, profile);
      } catch (error: any) {
        if (error.message === 'PROFILE_NOT_FOUND') {
          return sendError(res, 'PROFILE_NOT_FOUND', 'Profile not found', 404, requestId);
        }
        throw error;
      }
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'UPDATE_FAILED', 'Failed to update profile settings', 500, requestId);
    }
  },
};

