import { Request, Response, NextFunction } from "express";
import { validationResult, Result } from "express-validator";
import { CustomError } from "../utils/error";

export const handleValidatorErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors: Result = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors: Result<string> = errors.formatWith(
      (err) => err.msg as string
    );
    const error = new CustomError(
      422,
      "Validation failed",
      formattedErrors.array()
    );
    next(error);
    return;
  }
  next();
};
