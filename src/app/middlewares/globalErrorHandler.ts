import { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import httpStatus from "http-status";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { ZodError } from "zod";

import env from "../config/env";

import handleValidationError from "../errors/handleValidationError";
import handleDuplicateError from "../errors/handleDuplicateError";
import handleCastError from "../errors/handleCastError";
import handleZodError from "../errors/handleZodError";
import handleJWTError from "../errors/handleJWTError";
import handleJWTExpiredError from "../errors/handleJWTExpiredError";

import { TErrorSource } from "../interfaces/error";
import AppError from "../errors/AppError";

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
  let message: string = "Something went wrong!";
  let errorSources: TErrorSource[] = [];

  // App Error
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // Zod Error
  else if (err instanceof ZodError) {
    const simplifiedError = handleZodError(err);

    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  }

  // Mongoose Validation Error
  else if (err instanceof mongoose.Error.ValidationError) {
    const simplifiedError = handleValidationError(err);

    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  }

  // Duplicate Error
  else if ( err &&typeof err === "object" &&"code" in err &&err.code === 11000) {
    const simplifiedError = handleDuplicateError(err);

    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  }

  // Cast Error
  else if (err instanceof mongoose.Error.CastError) {
    const simplifiedError = handleCastError(err);

    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  }

  // // JWT Expired Error
  else if (err instanceof TokenExpiredError) {
    const simplifiedError = handleJWTExpiredError(err);

    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  }

  // // JWT Error
  else if (err instanceof JsonWebTokenError) {
    const simplifiedError = handleJWTError(err);

    statusCode = simplifiedError.statusCode;
    message = simplifiedError.message;
    errorSources = simplifiedError.errorSources;
  }

  // Normal JavaScript Error
  else if (err instanceof Error) {
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    stack: env.node_env === "development" ? err.stack : undefined,
  });
};

export default globalErrorHandler;
