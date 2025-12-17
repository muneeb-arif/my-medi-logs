import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { HttpError } from '../utils/httpError';

export interface AuthRequest extends Request {
  accountId?: string;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HttpError(401, 'UNAUTHORIZED', 'Missing or invalid authorization header');
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { accountId: string };
    req.accountId = decoded.accountId;
    next();
  } catch (error) {
    throw new HttpError(401, 'UNAUTHORIZED', 'Invalid or expired token');
  }
};

