import { Request, Response, NextFunction } from "express";
import { ValidationError } from "class-validator";
import { errorResponse } from "../../../utils/errors/responses/errorResponse";
import { AppError } from "../../../utils/errors/AppError";
import { QueryFailedError } from "typeorm";// <--- Add this import
// import { EntityNotFoundError } from "typeorm"; // You might also need this later
// import { PostgresError } from "pg-error-enum"; // If using PostgreSQL, for more specific error codes

// export const errorHandler = (
//   err: any,
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   // 1. Handle class-validator errors
//   if (Array.isArray(err) && err[0] instanceof ValidationError) {
//     const formattedErrors = err.map((e) => ({
//       property: e.property,
//       constraints: e.constraints,
//     }));

//     return errorResponse({
//       res,
//       statusCode: 400,
//       message: "Validation failed",
//       errors: formattedErrors,
//     });
//   }

//   // 2. Handle custom AppError
//   if (err instanceof AppError) {
//     return errorResponse({
//       res,
//       statusCode: err.statusCode,
//       message: err.message,
//     });
//   }

//   // 3. Handle unknown/unexpected errors
//   return errorResponse({
//     res,
//     statusCode: 500,
//     message: "Internal server error",
//   });
// };

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // 1. Handle class-validator errors
  if (Array.isArray(err) && err[0] instanceof ValidationError) {
    const formattedErrors = err.map((e) => ({
      property: e.property,
      constraints: e.constraints,
    }));

    return errorResponse({
      res,
      statusCode: 400,
      message: "Validation failed",
      errors: formattedErrors,
    });
  }

  // 2. Handle custom AppError
  if (err instanceof AppError) {
    return errorResponse({
      res,
      statusCode: err.statusCode,
      message: err.message,
    });
  }

  // 3. Handle TypeORM QueryFailedError (e.g., unique constraint violation)
  if (err instanceof QueryFailedError) {

    const driverError = err.driverError;
    let message = "Database error";
    let statusCode = 500;

    if (driverError && driverError.code === "23505") {
      // PostgreSQL unique_violation error code
      message = "A record with this unique identifier already exists.";
      statusCode = 409; // Conflict
      // You can parse driverError.detail or driverError.constraint for more specific info
      // e.g., "Key (email)=(test@example.com) already exists."
      if (driverError.detail) {
        message += ` ${driverError.detail}`;
      }
    } else {
      // For other QueryFailedError types, you might keep it generic or log them
      console.error("QueryFailedError (unhandled specific code):", err);
      // For production, avoid sending raw database error messages
      message = "An unexpected database operation failed.";
      statusCode = 500;
    }

    return errorResponse({
      res,
      statusCode: statusCode,
      message: message,
    });
  }

  // 4. Handle TypeORM EntityNotFoundError (if not handled in service)
  // While you *can* handle EntityNotFoundError here, it's often better
  // to catch it in the service layer and throw an AppError (e.g., "Resource not found").
  // This keeps the error semantics consistent with your AppError flow.
  // Example if you *were* to handle it here:
  // if (err instanceof EntityNotFoundError) {
  //   return errorResponse({
  //     res,
  //     statusCode: 404,
  //     message: "Requested resource not found.",
  //   });
  // }

  // 5. Handle unknown/unexpected errors
  console.error("Unhandled error:", err); // Log the actual error for debugging!
  return errorResponse({
    res,
    statusCode: 500,
    message: "Internal server error",
  });
};
