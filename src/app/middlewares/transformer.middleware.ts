// src/middlewares/transformer.middleware.ts
import { instanceToPlain } from "class-transformer";
import { Response, Request, NextFunction } from "express";

export const transformMiddleware = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json.bind(res);

    res.json = (data: any) => {
      const transformed = instanceToPlain(data);
      return originalJson(transformed);
    };

    next();
  };
};
