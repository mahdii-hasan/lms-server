import { Response } from "express";
import { TApiResponse } from "../interfaces/apiResponse";


const sendResponse = <T>(res: Response, data: TApiResponse<T>) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    meta: data?.meta,
    data: data?.data,
  });
};

export default sendResponse;
