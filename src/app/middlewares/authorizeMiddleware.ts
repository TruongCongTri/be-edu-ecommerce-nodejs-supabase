import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authenticateMiddleware";
import { AppError } from "../../../utils/errors/AppError";

/**
 * Middleware to authorize users based on allowed roles
 * @param allowedRoles - list of roles allowed to access the route
 */
export const authorizeMiddleware = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      throw new AppError("Forbidden: You do not have permission to access this resource.", 403);
    }

    next();
  };
};
