export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: any) => {
  if (error instanceof AppError) {
    return { statusCode: error.statusCode, message: error.message };
  }
  return { statusCode: 500, message: 'Internal server error' };
};
