import mongoose from "mongoose";
import httpStatus from "http-status";

import { TErrorSource, TGenericErrorResponse } from "../interfaces/error";
import { ERROR_MESSAGES } from "../constants/messages";

const handleValidationError = (err: mongoose.Error.ValidationError,): TGenericErrorResponse => {
  const errorSources: TErrorSource[] = Object.values(err.errors).map((value) => ({
      path: value.path,
      message: value.message,
    }),
  );

  return {
    statusCode: httpStatus.BAD_REQUEST,
    message: ERROR_MESSAGES.VALIDATION_ERROR,
    errorSources,
  };
};

export default handleValidationError;
