export class HttpError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public requestId?: string
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

