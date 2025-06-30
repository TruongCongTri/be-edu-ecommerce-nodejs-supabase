import { Response } from "express";

interface ErrorResponseOptions {
  res: Response;
  statusCode?: number;
  message: string;
  error_code?: string | number;
  errors?: any; // e.g., from class-validator
}

export const errorResponse = ({
  res,
  statusCode = 400,
  message,
  error_code,
  errors,
}: ErrorResponseOptions) => {
  const meta = {
    success: false,
    message,
    error_code,
    errors,
  };
  const response = {
    meta,
  };
  return res.status(statusCode).json(response);
};
