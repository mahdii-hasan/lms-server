import { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { SUCCESS_MESSAGES } from "../../constants/messages";

const getMe = async (req: Request, res: Response) => {
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: SUCCESS_MESSAGES.PROFILE_RETRIEVED,
    data: req.user,
  });
};

export const UserControllers = {
  getMe,
};