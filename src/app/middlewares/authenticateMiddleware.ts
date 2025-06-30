import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { UserRole } from "../../../constants/enum";

const JWT_SECRET = process.env.JWT_SECRET || "jwt_secret_key";

// export interface AuthenticatedRequest extends Request {
//   user?: { id: string; role: string }; // extend as needed
// }

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
    return res.status(401).json({ message: "Unauthenticated: Token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      role: string;
    };
    if (!Object.values(UserRole).includes(decoded.role as UserRole)) {
      return res.status(403).json({ message: "Invalid role in token" });
    }
    req.user = { id: decoded.id, role: decoded.role as UserRole };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthenticated: Invalid token" });
  }
};
