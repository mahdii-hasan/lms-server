import mongoose from "mongoose";
import httpStatus from "http-status";

import { TErrorSource, TGenericErrorResponse } from "../interfaces/error";
import { ERROR_MESSAGES } from "../constants/messages";

const handleCastError = (err: mongoose.Error.CastError,): TGenericErrorResponse => {
  const errorSources: TErrorSource[] = [
    {
      path: err.path,
      message: `${err.value} is not a valid ${err.kind}`,
    },
  ];

  return {
    statusCode: httpStatus.BAD_REQUEST,
    message: ERROR_MESSAGES.CAST_ERROR,
    errorSources,
  };
};

export default handleCastError;
