import { Response } from "express";
import { instanceToPlain } from "class-transformer";
import { PaginationMetaDto } from "../../../src/database/dtos.output/PaginationMeta.dto";

interface SuccessResponseMeta {
  success: true;
  message: string;
  pagination?: PaginationMetaDto;
}

interface SuccessResponseBody<T> {
  data?: T;
  meta: SuccessResponseMeta;
}

interface SuccessResponseOptions<T> {
  res: Response;
  statusCode?: number;
  message: string;
  data?: T;
  pagination?: PaginationMetaDto;
}

export const successResponse = <T>({
  res,
  statusCode = 200,
  message,
  data,
  pagination,
}: SuccessResponseOptions<T>): Response<SuccessResponseBody<T>> => {
  // 1. Construct the 'meta' object
  const meta: SuccessResponseMeta = {
    success: true,
    message,
  };

  // If pagination data is provided, add it to the meta object
  if (pagination) {
    // Ensure pagination DTO is converted to a plain object
    meta.pagination = instanceToPlain(pagination) as PaginationMetaDto;
  }

  // 2. Construct the 'responseBody' ensuring 'data' comes before 'meta'
  const responseBody: SuccessResponseBody<T> = {
    ...(data && { data: instanceToPlain(data) as T }), // Conditionally add data
    meta,
  };

  // Send the response
  return res.status(statusCode).json(responseBody);
};
