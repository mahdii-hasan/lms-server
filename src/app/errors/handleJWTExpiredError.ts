import httpStatus from "http-status";
import { TokenExpiredError } from "jsonwebtoken";

import { TErrorSource, TGenericErrorResponse } from "../interfaces/error";
import { ERROR_MESSAGES } from "../constants/messages";

const handleJWTExpiredError = (_err: TokenExpiredError): TGenericErrorResponse => {
  return {
    statusCode: httpStatus.UNAUTHORIZED,
    message: ERROR_MESSAGES.UNAUTHORIZED,
    errorSources: [
      {
        path: "authorization",
        message: "Authentication token has expired",
      },
    ],
  };
};

export default handleJWTExpiredError;
