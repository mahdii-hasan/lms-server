import sendResponse from "../../utils/sendResponse";
import { Request, Response } from "express";
import httpStatus from "http-status";
import AppError from "../../errors/AppError";

const getMe = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User profile retrieved successfully",
    data: user,
  });
};

export const UserController = {
  getMe,
};