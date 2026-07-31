import { ZodError } from "zod";
import httpStatus from "http-status";

import { TErrorSource, TGenericErrorResponse } from "../interfaces/error";
import { ERROR_MESSAGES } from "../constants/messages";

const handleZodError = (err: ZodError): TGenericErrorResponse => {
  const errorSources: TErrorSource[] = err.issues.map((issue) => ({
    path: issue.path.slice(1).join("."),
    message: issue.message,
  }));

  return {
    statusCode: httpStatus.BAD_REQUEST,
    message: ERROR_MESSAGES.VALIDATION_ERROR,
    errorSources,
  };
};

export default handleZodError;
