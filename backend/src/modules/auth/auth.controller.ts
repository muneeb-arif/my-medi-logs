import { Request, Response } from 'express';
import { z } from 'zod';
import { HttpError } from '../../utils/httpError';
import { sendSuccess, sendError } from '../../utils/response';
import { authService } from './auth.service';
import {
  loginSchema,
  logoutSchema,
  refreshTokenSchema,
  registerSchema,
} from './auth.schemas';
import type { AuthRequest } from '../../middleware/auth';

const validateRequest = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new HttpError(400, 'VALIDATION_ERROR', result.error.errors[0]?.message || 'Invalid input');
  }
  return result.data;
};

export const authController = {
  register: async (req: Request, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const data = validateRequest(registerSchema, req.body);
      const result = await authService.register(data);
      sendSuccess(res, result, 201);
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        return sendError(res, 'EMAIL_ALREADY_EXISTS', 'Email already registered', 409, requestId);
      }
      sendError(res, 'REGISTRATION_FAILED', 'Registration failed', 500, requestId);
    }
  },

  login: async (req: Request, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const data = validateRequest(loginSchema, req.body);
      const result = await authService.login(data);
      sendSuccess(res, result);
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      if (error.message === 'INVALID_CREDENTIALS') {
        return sendError(res, 'INVALID_CREDENTIALS', 'Invalid email or password', 401, requestId);
      }
      sendError(res, 'LOGIN_FAILED', 'Login failed', 500, requestId);
    }
  },

  refresh: async (req: Request, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const data = validateRequest(refreshTokenSchema, req.body);
      const tokens = await authService.refreshToken(data.refreshToken);
      sendSuccess(res, tokens);
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      if (error.message === 'INVALID_TOKEN') {
        return sendError(res, 'INVALID_TOKEN', 'Invalid or expired refresh token', 401, requestId);
      }
      sendError(res, 'REFRESH_FAILED', 'Token refresh failed', 500, requestId);
    }
  },

  logout: async (req: Request, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const data = validateRequest(logoutSchema, req.body);
      await authService.logout(data.refreshToken);
      sendSuccess(res, { message: 'Logged out successfully' });
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'LOGOUT_FAILED', 'Logout failed', 500, requestId);
    }
  },

  getMe: async (req: AuthRequest, res: Response) => {
    const requestId = (req as any).requestId;
    try {
      const accountId = req.accountId;
      if (!accountId) {
        return sendError(res, 'UNAUTHORIZED', 'Not authenticated', 401, requestId);
      }

      const account = authService.getAccountById(accountId);
      if (!account) {
        return sendError(res, 'ACCOUNT_NOT_FOUND', 'Account not found', 404, requestId);
      }

      sendSuccess(res, account);
    } catch (error: any) {
      if (error instanceof HttpError) {
        return sendError(res, error.code, error.message, error.statusCode, requestId);
      }
      sendError(res, 'FETCH_FAILED', 'Failed to fetch account', 500, requestId);
    }
  },
};

