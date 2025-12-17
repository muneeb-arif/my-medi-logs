import { Response } from 'express';

export const sendSuccess = <T>(res: Response, data: T, statusCode = 200) => {
  res.status(statusCode).json(data);
};

export const sendError = (
  res: Response,
  code: string,
  message: string,
  statusCode: number,
  requestId?: string
) => {
  res.status(statusCode).json({
    error: {
      code,
      message,
      ...(requestId && { requestId }),
    },
  });
};

