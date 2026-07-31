import { MongoServerError } from "mongodb";
import httpStatus from "http-status";

import { TErrorSource, TGenericErrorResponse } from "../interfaces/error";

const handleDuplicateError = (err: MongoServerError): TGenericErrorResponse => {
  const field = Object.keys(err.keyValue)[0];

  const value = Object.values(err.keyValue)[0];

  const errorSources: TErrorSource[] = [
    {
      path: field,
      message: `${value} already exists`,
    },
  ];

  return {
    statusCode: httpStatus.CONFLICT,
    message: "Duplicate Data Found",
    errorSources,
  };
};

export default handleDuplicateError;
