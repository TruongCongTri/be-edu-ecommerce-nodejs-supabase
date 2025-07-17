import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";

/**
 * Generic middleware to validate request data from body, params, or query.
 * @param dtoClass - DTO class to validate against
 * @param source - 'body' | 'params' | 'query'
 */

// Extend the Request type to include your custom property
declare module "express" {
  interface Request {
    validatedDto?: any; // Or specify FilterProductQueryParamsDto if you only use one DTO
  }
}

// export function validateRequest<T extends object>(
//   dtoClass: new () => T,
//   source: "body" | "params" | "query" = "body"
// ) {
//   return (req: Request, res: Response, next: NextFunction) => {
//     validateData(dtoClass, req[source])
//       .then(() => next())
//       .catch(next);
//   };
// }

export function validateFilterRequest<T extends object>(
  dtoClass: new () => T,
  source: "body" | "params" | "query" = "body"
) {
  return (req: Request, res: Response, next: NextFunction) => {
    validateData(dtoClass, req[source])
      .then((transformedDto) => {
        // Catch the transformed DTO here
        req.validatedDto = transformedDto; // Attach it to the request object
        next();
      })
      .catch(next);
  };
}

async function validateData<T extends object>(
  dtoClass: new () => T,
  data: any
): Promise<T> {
  // Specify the return type is T (the DTO instance)
  const instance = plainToInstance(dtoClass, data, {
    enableImplicitConversion: true,
  });
  const errors = await validate(instance, {
    whitelist: true,
    forbidNonWhitelisted: true,
    skipMissingProperties: true,
  });
  if (errors.length > 0) {
    throw errors;
  }
  return instance; // Return the transformed instance
}
