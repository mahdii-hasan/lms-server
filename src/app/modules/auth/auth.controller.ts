import { Request, Response } from "express";
import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";
import { AuthService } from "./auth.service";
import AppError from "../../errors/AppError";

const registerUser = async (req: Request, res: Response) => {
  const result = await AuthService.registerUser(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: result.message,
    data: result,
  });
};

const verifyEmail = async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const result = await AuthService.verifyEmail(email, otp);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
};

const resendVerification = async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await AuthService.resendVerification(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: null,
  });
};

const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await AuthService.loginUser(
    { email, password },
    {
      userAgent: req.get("user-agent"),
      ipAddress: req.ip,
    },
  );

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/api/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.setHeader("Cache-Control", "no-store");

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Login successful",
    data: {
      accessToken: result.accessToken,
      user: result.user,
    },
  });
};

const refreshTokens = async (req: Request, res: Response) => {
  // 1. Read refresh token from HttpOnly cookie
  const refreshToken = req.cookies?.refreshToken;

  // 2. Call refresh service
  const result = await AuthService.refreshTokens(refreshToken);

  // 3. Replace old cookie with new refresh token
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/api/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  // 4. Prevent response caching
  res.setHeader("Cache-Control", "no-store");

  // 5. Return new access token
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Token refreshed successfully",
    data: {
      accessToken: result.accessToken,
      user: result.user,
    },
  });
};

const logoutUser = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  await AuthService.logoutUser(refreshToken);

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth",
  });

  res.setHeader("Cache-Control", "no-store");

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logout successful",
    data: null,
  });
};
const logoutUserAllSessions = async (req: Request, res: Response) => {
  // Assumes your authentication middleware attaches the user ID.
  if (!req.user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }

  const userId = req.user._id.toString();
  await AuthService.logoutUserAllSessions(userId);

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/v1/auth",
  });

  res.setHeader("Cache-Control", "no-store");

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged out from all sessions successfully",
    data: null,
  });
};

const changeUserPassword = async (req: Request, res: Response) => {
  // req.user is populated by auth() middleware
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "You are not authenticated");
  }

  const { currentPassword, newPassword } = req.body;

  await AuthService.changeUserPassword(userId, {
    currentPassword,
    newPassword,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password changed successfully. Please login again.",
    data: null,
  });
};

const forgotUserPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  await AuthService.forgotUserPassword(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message:
      "If an account exists with this email, a password reset link has been sent.",
    data: null,
  });
};

const resetUserPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  await AuthService.resetUserPassword({
    token,
    newPassword,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password reset successfully. Please login with your new password.",
    data: null,
  });
};

export const AuthController = {
  registerUser,
  verifyEmail,
  resendVerification,
  loginUser,
  refreshTokens,
  logoutUser,
  logoutUserAllSessions,
  changeUserPassword,
  forgotUserPassword,
  resetUserPassword,
};
