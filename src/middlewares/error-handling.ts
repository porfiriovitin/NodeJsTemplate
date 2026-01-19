import { AppError } from "../utils/AppError.js";
import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

/// :: Middleware to handle errors globally.
export function errorHandling(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  /// :: Thanks me later, frontend
  if (err instanceof ZodError) {
    const flattened = err.flatten();

    const details = err.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
      code: issue.code,
    }));

    return res.status(400).json({
      message: "validation error",
      details: details[0].message,
      fieldErrors: flattened.fieldErrors,
      formErrors: flattened.formErrors,
    });
  }

  return res.status(500).json({ message: err.message });
}