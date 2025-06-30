import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./authenticateMiddleware";

/**
 * Middleware to authorize users based on allowed roles
 * @param allowedRoles - list of roles allowed to access the route
 */
export const authorizeMiddleware = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: "Forbidden: You do not have permission to access this resource.",
      });
    }

    next();
  };
};
