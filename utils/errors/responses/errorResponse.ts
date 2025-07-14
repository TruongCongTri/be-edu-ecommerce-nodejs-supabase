import { Response } from "express";

interface ErrorResponseOptions {
  res: Response;
  statusCode?: number;
  message: string;
  error_code?: string | number;
  errors?: any; // e.g., from class-validator
}

interface ErrorResponseBody {
  meta: ErrorResponseMeta;
}

interface ErrorResponseMeta {
  success: false;
  message: string;
  error_code?: string | number;
  errors?: any;
}

export const errorResponse = ({
  res,
  statusCode = 400,
  message,
  error_code,
  errors,
}: ErrorResponseOptions): Response<ErrorResponseBody> => {
  const meta: ErrorResponseMeta = {
    success: false,
    message,
    ...(error_code !== undefined && { error_code }),
    ...(errors !== undefined && { errors }),
  };

  const responseBody: ErrorResponseBody = { meta };

  return res.status(statusCode).json(responseBody);
};
