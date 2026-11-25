import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { verifyAccessToken } from "../utils/jwt";
import { User } from "../modules/user/user.model.method";
import AppError from "../errors/AppError";
import { TUserRole } from "../constants/user_role";

const authMiddleware = (...requiredRoles: TUserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // 1. Get Authorization header
    const authorization = req.headers.authorization;

    if (!authorization) {
      throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized");
    }

    // 2. Extract Bearer token
    const [scheme, token] = authorization.split(" ");

    if (
      scheme !== "Bearer" ||
      !token ||
      authorization.split(" ").length !== 2
    ) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Invalid authorization format",
      );
    }

    // 3. Verify Access Token
    const decoded = verifyAccessToken(token);

    // 4. Find user from database
    const user = await User.isUserExistsById(decoded.id);

    if (!user) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User not found");
    }

    if (user.status !== "active") {
      throw new AppError(httpStatus.FORBIDDEN, "Your account is not active.");
    }
    if (user.passwordChangedAt && user.isPasswordChangedAfter(Number(decoded.iat))) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Your password has changed. Please login again.",
      );
    }

    // 6. Attach authenticated user to request
    req.user = {
      id: user._id.toString(),
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // 7. Role-based authorization
    // If no role is provided, any authenticated user is allowed.
    if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You do not have permission to access this resource",
      );
    }

    // 8. Continue
    next();
  };
};

export default authMiddleware;
