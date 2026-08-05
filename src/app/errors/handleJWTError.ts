import httpStatus from "http-status";
import {JsonWebTokenError} from "jsonwebtoken"

import { TErrorSource, TGenericErrorResponse } from "../interfaces/error";
import { ERROR_MESSAGES } from "../constants/messages";

const handleJWTError = (err: JsonWebTokenError): TGenericErrorResponse => {
  return {
    statusCode: httpStatus.UNAUTHORIZED,
    message: ERROR_MESSAGES.UNAUTHORIZED,
    errorSources: [
      {
        path: "authorization",
        message: "Invalid authentication token",
      },
    ],
  };
};

export default handleJWTError;
