/**
 * Request validation middleware using Zod
 * Validates request body and query parameters
 */
import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ValidationError } from "../utils/errors/ValidationError";

export function validateRequest(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = await schema.parseAsync(req.body);
      req.body = validated;
      next();
    } catch (error: any) {
      const details: Record<string, string> = {};
      if (error.errors) {
        error.errors.forEach((err: any) => {
          const path = err.path.join(".");
          details[path] = err.message;
        });
      }
      next(new ValidationError("Validation failed", details));
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = await schema.parseAsync(req.query);
      Object.assign(req.query, validated);
      next();
    } catch (error: any) {
      console.error(error)
      const details: Record<string, string> = {};
      if (error.issues) {
        error.issues.forEach((err: any) => {
          const path = err.path.join(".");
          details[path] = err.message;
        });
      }
      next(new ValidationError("Query validation failed", details));
    }
  };
}
