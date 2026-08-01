import { Request, Response } from "express";
import httpStatus from "http-status";

import { AuthService } from "./auth.service";
import sendResponse from "../../utils/sendResponse";
import { SUCCESS_MESSAGES } from "../../constants/messages";

const registerUser = async (req: Request, res: Response) => {
    const result = await AuthService.registerUser(req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: SUCCESS_MESSAGES.REGISTER_USER,
      data: result,
    });
  };

export const AuthController = {
  registerUser,
};