import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

import config from "../config/env";

import AppError from "../errors/AppError";

import { verifyToken } from "../utils/jwt";

import { User } from "../modules/user/user.model";

import { USER_STATUS } from "../constants/user_status";
import { TUserRole } from "../constants/user_role";
import { ERROR_MESSAGES } from "../constants/messages";

const auth =
  (...requiredRoles: TUserRole[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new AppError(httpStatus.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
    }

    const token = authorization.split(" ")[1];

    const decoded = verifyToken(token, config.jwt_access_secret);

    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, ERROR_MESSAGES.USER_NOT_FOUND);
    }

    if (user.isDeleted) {
      throw new AppError(httpStatus.FORBIDDEN, ERROR_MESSAGES.ACCOUNT_DELETED);
    }

    if (user.status !== USER_STATUS.ACTIVE) {
      throw new AppError(httpStatus.FORBIDDEN, ERROR_MESSAGES.USER_BLOCKED);
    }

    // Authorization
    if (requiredRoles.length && !requiredRoles.includes(user.role)) {
      throw new AppError(httpStatus.FORBIDDEN, ERROR_MESSAGES.FORBIDDEN);
    }

    req.user = user.toObject();

    next();
  };

export default auth;
