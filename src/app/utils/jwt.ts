import jwt, { SignOptions, JwtPayload, Secret } from "jsonwebtoken";
import {
  IAccessTokenPayload,
  IRefreshTokenPayload,
} from "../interfaces/jwtInterface";
import crypto from "crypto";
import httpStatus from "http-status";
import config from "../config/env";
import AppError from "../errors/AppError";

export const generateAccessToken = (payload: IAccessTokenPayload): string => {
  return jwt.sign(payload, config.jwt_access_secret, {
    expiresIn: config.jwt_access_expires_in as SignOptions["expiresIn"],
    issuer: config.jwt_issuer,
    audience: config.jwt_audience,
    algorithm: "HS256",
  });
};

export const generateRefreshToken = (payload: IRefreshTokenPayload): string => {
  return jwt.sign(payload, config.jwt_refresh_secret, {
    expiresIn: config.jwt_refresh_expires_in as SignOptions["expiresIn"],
    issuer: config.jwt_issuer,
    audience: config.jwt_audience,
    algorithm: "HS256",
  });
};

export const verifyAccessToken = (token: string): IAccessTokenPayload => {
  try {
    const decoded = jwt.verify(token, config.jwt_access_secret, {
      algorithms: ["HS256"],
      issuer: config.jwt_issuer,
      audience: config.jwt_audience,
    });

    if (
      typeof decoded === "string" ||
      decoded.typ !== "access" ||
      !decoded.id ||
      !decoded.email
    ) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Invalid access token");
    }

    return decoded as IAccessTokenPayload;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Invalid or expired access token",
    );
  }
};

export const verifyRefreshToken = (
  token: string,
): IRefreshTokenPayload & JwtPayload => {
  const decoded = jwt.verify(token, config.jwt_refresh_secret, {
    algorithms: ["HS256"],
    issuer: config.jwt_issuer,
    audience: config.jwt_audience,
  });

  if (
    typeof decoded === "string" ||
    decoded.typ !== "refresh" ||
    typeof decoded.id !== "string" ||
    typeof decoded.sid !== "string" ||
    typeof decoded.jti !== "string"
  ) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
  }

  return decoded as IRefreshTokenPayload & JwtPayload;
};

export const compareTokenHashes = (hashA: string, hashB: string): boolean => {
  const bufferA = Buffer.from(hashA, "hex");
  const bufferB = Buffer.from(hashB, "hex");

  if (bufferA.length !== bufferB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufferA, bufferB);
};
