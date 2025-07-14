import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";

/**
 * Generic middleware to validate request data from body, params, or query.
 * @param dtoClass - DTO class to validate against
 * @param source - 'body' | 'params' | 'query'
 */
// export function validateRequest<T extends object>(
//   dtoClass: new () => T,
//   source: "body" | "params" | "query" = "body"
// ) {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     const data = plainToInstance(dtoClass, req[source]);

//     const errors = await validate(data, {
//       whitelist: true,
//       forbidNonWhitelisted: true,
//       skipMissingProperties: source !== "body", // only required fields for body
//     });

//     if (errors.length > 0) {
//       // return res.status(400).json({
//       //   message: "Validation failed",
//       //   errors: errors.map(err => ({
//       //     property: err.property,
//       //     constraints: err.constraints,
//       //   })),
//       // });
//       throw errors;
//     }

//     return next();
//   };
// }

export function validateRequest<T extends object>(
  dtoClass: new () => T,
  source: "body" | "params" | "query" = "body"
) {
  return (req: Request, res: Response, next: NextFunction) => {
    validateData(dtoClass, req[source])
      .then(() => next())
      .catch(next);
  };
}

async function validateData<T extends object>(
  dtoClass: new () => T,
  data: any
) {
  const instance = plainToInstance(dtoClass, data);
  const errors = await validate(instance, {
    whitelist: true,
    forbidNonWhitelisted: true,
    skipMissingProperties: true,
  });
  if (errors.length > 0) {
    throw errors;
  }
}
