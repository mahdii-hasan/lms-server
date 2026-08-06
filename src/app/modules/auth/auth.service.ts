import { SignOptions } from "jsonwebtoken";
import config from "../../config/env";
import { ERROR_MESSAGES } from "../../constants/messages";
import { USER_STATUS } from "../../constants/user_status";
import AppError from "../../errors/AppError";
import { createToken, verifyToken } from "../../utils/jwt";
import { User } from "../user/user.model";
import { TLoginUser, TCreateUser, TJwtPayload } from "./auth.interface";
import httpStatus from "http-status";

const registerUser = async (payload: TCreateUser) => {
  // Check duplicate email
  const isUserExists = await User.isUserExistsByEmail(payload.email);
  if (isUserExists) {
    throw new AppError(httpStatus.CONFLICT, ERROR_MESSAGES.DUPLICATE_ERROR);
  }

  // Create user
  const result = await User.create(payload);
  const { password, ...user } = result.toObject();

  return user;
};

const loginUser = async (payload: TLoginUser) => {
  // Check if user exists
  const user = await User.isUserExistsByEmail(payload.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND);
  }

  // Check if user is deleted
  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, ERROR_MESSAGES.ACCOUNT_DELETED);
  }

  // Check user status
  if (user.status !== USER_STATUS.ACTIVE) {
    throw new AppError(httpStatus.FORBIDDEN, ERROR_MESSAGES.USER_BLOCKED);
  }

  // Verify password
  const isPasswordMatched = await user.isPasswordMatched(payload.password);

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
  }

  // JWT Payload
  const jwtPayload: TJwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };

  // Generate Access Token
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret!,
    config.jwt_access_expires_in as SignOptions["expiresIn"],
  );

  // Generate Refresh Token
  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret!,
    config.jwt_refresh_expires_in as SignOptions["expiresIn"],
  );
  const { password, ...userData } = user.toObject();

  return {
    accessToken,
    refreshToken,
    user: userData,
  };
};

const refreshToken = async (refreshToken: string) => {
  // 1. Check token exists
  if (!refreshToken) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      ERROR_MESSAGES.REFRESH_TOKEN_REQUIRED,
    );
  }

  // 2. Verify Refresh Token
  const decoded = verifyToken(refreshToken, config.jwt_refresh_secret);

  // 3. Find user
  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND);
  }

  // 4. Deleted?
  if (user.isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, ERROR_MESSAGES.ACCOUNT_DELETED);
  }

  // 5. Blocked?
  if (user.status !== USER_STATUS.ACTIVE) {
    throw new AppError(httpStatus.FORBIDDEN, ERROR_MESSAGES.USER_BLOCKED);
  }

  // 6. Create new payload
  const jwtPayload: TJwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };

  // 7. Generate new Access Token
  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret,
    config.jwt_access_expires_in as SignOptions["expiresIn"],
  );

  // 8. Return
  return {
    accessToken,
  };
};

const changePassword = async (
  userId: string,
  payload: {
    oldPassword: string;
    newPassword: string;
  },
) => {
  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const isMatched = await user.isPasswordMatched(payload.oldPassword);

  if (!isMatched) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      ERROR_MESSAGES.PASSWORD_INCORRECT,
    );
  }

  user.password = payload.newPassword;

  user.passwordChangedAt = new Date();

  await user.save();
};

export const AuthService = {
  registerUser,
  loginUser,
  refreshToken,
  changePassword,
};
