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

const loginUser = async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User logged in successfully",
    data: {
      accessToken: result.accessToken,
      user: result.user,
    },
  });
};

export const AuthController = {
  registerUser,
  loginUser,
};
