import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { UserRole } from "../../../constants/enum";
import { AppError } from "../../../utils/errors/AppError";

const JWT_SECRET = process.env.JWT_SECRET || "jwt_secret_key";

export interface AuthenticatedRequest<
  Params = {},
  ResBody = any,
  ReqBody = any,
  ReqQuery = {}
> extends Request<Params, ResBody, ReqBody, ReqQuery> {
  user?: {
    id: string;
    role: UserRole;
  };
}

export const authenticateMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError("Authentication failed: Token missing", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      role: string;
    };
    if (!Object.values(UserRole).includes(decoded.role as UserRole)) {
      throw new AppError("Authentication failed: Invalid role in token payload.", 401);
    }
    req.user = { id: decoded.id, role: decoded.role as UserRole };
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError("Authentication failed: Invalid token.", 401);
    } else if (error instanceof jwt.TokenExpiredError) {
        throw new AppError("Authentication failed: Token expired.", 401);
    }
    throw new AppError("Authentication failed: An unexpected error occurred.", 401);
  }
};
