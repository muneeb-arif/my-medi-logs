import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../utils/httpError';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: Error | HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = (req as any).requestId;

  if (err instanceof HttpError) {
    return sendError(res, err.code, err.message, err.statusCode, requestId);
  }

  // Never log PHI or sensitive data
  console.error('Unhandled error:', {
    message: err.message,
    requestId,
    path: req.path,
    method: req.method,
  });

  return sendError(
    res,
    'INTERNAL_ERROR',
    'An internal error occurred',
    500,
    requestId
  );
};

