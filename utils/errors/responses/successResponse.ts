import { Response } from "express";
import { instanceToPlain } from "class-transformer";

interface SuccessResponseOptions<T> {
  res: Response;
  statusCode?: number;
  message: string;
  data?: T;
  pagination?: {
    current_page: number;
    per_page: number;
    total: number;
    total_page: number;
  };
}

export const successResponse = <T>({
  res,
  statusCode = 200,
  message,
  data,
  pagination,
}: SuccessResponseOptions<T>) => {
  const meta = {
    success: true,
    ...(message && { message }),
    ...(pagination && { pagination }),
  };

  const response = {
    data: instanceToPlain(data) as T,
    meta,
  };
  return res.status(statusCode).json(response);
};
