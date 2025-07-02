import { Response } from "express";
import { instanceToPlain } from "class-transformer";
import { PaginationMetaDto } from "../../../src/database/dtos.output/PaginationMeta.dto";

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
}: SuccessResponseOptions<T>) => {
  // const meta = {
  //   success: true,
  //   ...(message && { message }),
  //   ...(pagination && { pagination }),
  // };

  // const response = {
  //   data: instanceToPlain(data) as T,
  //   meta,
  // };
  // return res.status(statusCode).json(response);

  // Construct the base response object with required root-level properties
  
  // 1. Construct the 'meta' object
  const meta: {
    success: boolean;
    message: string;
    pagination?: PaginationMetaDto; // Optional pagination within meta
  } = {
    success: true,
    message,
  };

  // If pagination data is provided, add it to the meta object
  if (pagination) {
    // Ensure pagination DTO is converted to a plain object
    meta.pagination = instanceToPlain(pagination) as PaginationMetaDto;
  }

  // 2. Construct the 'responseBody' ensuring 'data' comes before 'meta'
  const responseBody: {
    data?: object; // Optional data at the root
    meta: typeof meta; // The meta object, typed using typeof for consistency
  } = {
    // Assign data first (if present), and ensure it's plain
    ...(data && { data: instanceToPlain(data) as object }), // Conditionally add data
    meta, // Assign the meta object second
  };

  // Send the response
  return res.status(statusCode).json(responseBody);
};
