import { Request, Response, NextFunction } from "express";

// export const asyncHandler =
//   (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
//   (req: Request, res: Response, next: NextFunction) => {
//     fn(req, res, next).catch(next);
//   };

import { ParamsDictionary } from 'express-serve-static-core'; // Required for default generic types
import { ParsedQs } from 'qs'; // Required for default generic types

// Define the generic type for an Express request handler.
// This allows the asyncHandler to infer the specific types
// (P: Params, ResB: Response Body, ReqB: Request Body, ReqQ: Request Query)
// from the function 'fn' that is passed to it.
export const asyncHandler = <
  P = ParamsDictionary,
  ResB = any,
  ReqB = any,
  ReqQ = ParsedQs,
  Locals extends Record<string, any> = Record<string, any>
>(
  // The function 'fn' is your actual route handler (e.g., controller method)
  fn: (
    req: Request<P, ResB, ReqB, ReqQ, Locals>,
    res: Response<ResB, Locals>,
    next: NextFunction // Even if not always used, it's part of Express handler signature
  ) => Promise<any> | void // Allow void for handlers that don't return a promise but handle async internally
) => {
  // The returned middleware function that Express will use
  return (req: Request<P, ResB, ReqB, ReqQ, Locals>, res: Response<ResB, Locals>, next: NextFunction) => {
    // Wrap the execution of 'fn' in a Promise.resolve to catch both sync and async errors
    // and pass them to 'next' (which will be caught by your error handling middleware).
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};