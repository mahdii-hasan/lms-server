import httpStatus from "http-status";
import verificationEmailTemplate from "../../templates/template.verificationEmail";
import {
  ILoginMetadata,
  ILoginPayload,
  IRegisterPayload,
} from "./auth.interface";
import otpService from "../../services/otp.service";
import emailService from "../../services/email.service";
import {
  compareTokenHashes,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";
import { User } from "../user/user.model.method";
import mongoose from "mongoose";
import { generateUniqueId } from "../../utils/generateId";
import secretHash from "../../utils/secretHash";
import { AuthSession } from "./auth.model";
import ms, { type StringValue } from "ms";
import { generateToken } from "../../utils/generateToken";
import resetPasswordEmailTemplate from "../../templates/template.resetPassword";
import bcrypt from "bcryptjs";
import AppError from "../../errors/AppError";
import config from "../../config/env";

const registerUser = async (payload: IRegisterPayload) => {
  const { name, email, password } = payload;

  const existingUser = await User.findOne({
    email,
  }).select("+emailVerificationCode +emailVerificationExpires");

  if (existingUser) {
    if (existingUser.isVerified) {
      throw new AppError(httpStatus.CONFLICT, "User already exists");
    }

    const otpData = otpService.generate();
    existingUser.emailVerificationCode = otpData.hashedOtp;
    existingUser.emailVerificationExpires = otpData.expiresAt;
    await existingUser.save();

    await emailService.sendEmail({
      to: existingUser.email,
      subject: "Verify your email",
      html: verificationEmailTemplate(otpData.otp, existingUser.name),
    });

    return {
      message: "Verification code sent again. Please check your email",
    };
  }

  const otpData = otpService.generate();

  const user = await User.create({
    name,
    email,
    password,
    emailVerificationCode: otpData.hashedOtp,
    emailVerificationExpires: otpData.expiresAt,
  });

  await emailService.sendEmail({
    to: user.email,
    subject: "Verify your email",
    html: verificationEmailTemplate(otpData.otp, user.name),
  });

  return {
    message: "Registration successful. Please verify your email",
    email: user.email,
  };
};

const verifyEmail = async (email: string, otp: string) => {
  const user = await User.findOne({
    email,
  }).select("+emailVerificationCode +emailVerificationExpires");

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.isVerified) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email already verified");
  }

  if (
    !user.emailVerificationExpires ||
    Date.now() > user.emailVerificationExpires.getTime()
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, "Verification code expired");
  }

  const isMatched = otpService.compareOtp
    ? otpService.compareOtp(otp, user.emailVerificationCode!)
    : false;

  if (!isMatched) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid verification code");
  }

  user.isVerified = true;
  user.emailVerificationCode = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return {
    message: "Email verified successfully",
  };
};

const resendVerification = async (email: string) => {
  const user = await User.findOne({
    email,
  }).select("+emailVerificationCode +emailVerificationExpires");

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  if (user.isVerified) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email already verified");
  }
  const otpData = otpService.generate(10);
  user.emailVerificationCode = otpData.hashedOtp;
  user.emailVerificationExpires = otpData.expiresAt;
  await user.save();

  await emailService.sendEmail({
    to: user.email,
    subject: "Verify your email",
    html: verificationEmailTemplate(otpData.otp, user.name),
  });

  return {
    message: "Verification code sent",
  };
};

const loginUser = async (payload: ILoginPayload, metadata: ILoginMetadata) => {
  const { email, password } = payload;

  // 1. Find user by email
  const user = await User.isUserExistsByEmail(email);

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  // 3. Check email verification
  if (!user.isVerified) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Please verify your email before logging in",
    );
  }

  // 4. Compare password
  const isPasswordMatched = await user.isPasswordMatched(password);

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  // Generate identifiers for this session and its first refresh token
  const sessionId = new mongoose.Types.ObjectId();
  const jti = generateUniqueId();

  const refreshTokenPayload = {
    id: user._id.toString(),
    sid: sessionId.toString(),
    jti,
    typ: "refresh" as const,
  };

  const refreshToken = generateRefreshToken(refreshTokenPayload);

  const refreshTokenHash = secretHash(refreshToken);

  const now = Date.now();

  const refreshTokenExpiresIn = ms(
    config.jwt_refresh_expires_in as StringValue,
  );
  const sessionAbsoluteExpiresIn = ms(
    config.jwt_absolute_session_expires_in as StringValue,
  );

  const absoluteExpiresAt = new Date(now + sessionAbsoluteExpiresIn);

  const expiresAt = new Date(
    Math.min(now + refreshTokenExpiresIn, absoluteExpiresAt.getTime()),
  );
  // Store only the hash, never the raw refresh token
  await AuthSession.create({
    _id: sessionId,
    userId: user._id,
    refreshTokenHash,
    currentJti: jti,
    expiresAt,
    absoluteExpiresAt,
    revokedAt: null,
    userAgent: metadata.userAgent,
    ipAddress: metadata.ipAddress,
  });

  const accessToken = generateAccessToken({
    id: user._id.toString(),
    email: user.email,
    typ: "access",
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
  };
};

const refreshTokens = async (rawRefreshToken?: string) => {
  // 1. Check refresh token exists
  if (!rawRefreshToken) {
    throw new AppError(httpStatus.BAD_REQUEST, "Refresh token is required");
  }

  // 2. Verify refresh token
  let decoded;

  try {
    decoded = verifyRefreshToken(rawRefreshToken);
  } catch {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Invalid or expired refresh token",
    );
  }

  const now = new Date();

  // 3. Find the session
  const session = await AuthSession.findById(decoded.sid).select(
    "+refreshTokenHash +currentJti",
  );

  if (!session) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Session not found or expired");
  }

  // 4. Validate session state
  if (session.revokedAt) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Session has been revoked");
  }

  if (session.expiresAt <= now || session.absoluteExpiresAt <= now) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Session has expired");
  }

  // 5. Hash the presented refresh token
  const presentedTokenHash = secretHash(rawRefreshToken);

  // 6. Detect old/reused refresh token
  const isCurrentToken =
    compareTokenHashes(session.refreshTokenHash, presentedTokenHash) &&
    session.currentJti === decoded.jti;

  if (!isCurrentToken) {
    // Reuse detection: revoke this session
    await AuthSession.updateOne(
      {
        _id: session._id,
        revokedAt: null,
      },
      {
        $set: {
          revokedAt: new Date(),
        },
      },
    );

    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Refresh token reuse detected. Please login again.",
    );
  }

  // 7. Ensure user still exists and is eligible to authenticate
  const user = await User.isUserExistsById(decoded.id);

  if (!user) {
    await AuthSession.updateOne(
      { _id: session._id, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );

    throw new AppError(httpStatus.UNAUTHORIZED, "User not found");
  }

  if (!user.isVerified) {
    await AuthSession.updateOne(
      { _id: session._id, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );

    throw new AppError(httpStatus.FORBIDDEN, "Email verification required");
  }

  // Add your account status check here too.
  // Example:
  if (user.status !== "active") {
    await AuthSession.updateOne(
      { _id: session._id, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );

    throw new AppError(httpStatus.FORBIDDEN, "Account is not active");
  }

  // 8. Create a new refresh token ID
  const newJti = generateUniqueId();

  const newRefreshToken = generateRefreshToken({
    id: user._id.toString(),
    sid: session._id.toString(),
    jti: newJti,
    typ: "refresh",
  });

  const newRefreshTokenHash = secretHash(newRefreshToken);

  const refreshTokenExpiresIn = ms(
    config.jwt_refresh_expires_in as StringValue,
  );
  // 9. Calculate new expiry (sliding expiration)
  const slidingExpiry = new Date(Date.now() + refreshTokenExpiresIn);

  const newExpiresAt =
    slidingExpiry < session.absoluteExpiresAt
      ? slidingExpiry
      : session.absoluteExpiresAt;

  // 10. Atomic token rotation
  const updatedSession = await AuthSession.findOneAndUpdate(
    {
      _id: session._id,
      userId: user._id,
      refreshTokenHash: presentedTokenHash,
      currentJti: decoded.jti,
      revokedAt: null,
      expiresAt: { $gt: now },
      absoluteExpiresAt: { $gt: now },
    },
    {
      $set: {
        refreshTokenHash: newRefreshTokenHash,
        currentJti: newJti,
        expiresAt: newExpiresAt,
      },
    },
    {
      new: true,
    },
  );

  // 11. If atomic update failed, the token may have been reused
  if (!updatedSession) {
    await AuthSession.updateOne(
      {
        _id: session._id,
        revokedAt: null,
      },
      {
        $set: {
          revokedAt: new Date(),
        },
      },
    );

    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Refresh token is no longer valid. Please login again.",
    );
  }

  // 12. Generate a new access token
  const newAccessToken = generateAccessToken({
    id: user._id.toString(),
    email: user.email,
    typ: "access",
  });

  // 13. Return new tokens
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    },
  };
};

const logoutUser = async (rawRefreshToken?: string) => {
  if (!rawRefreshToken) {
    return;
  }

  let decoded;

  try {
    decoded = verifyRefreshToken(rawRefreshToken);
  } catch {
    // Invalid/expired cookie still needs to be cleared by controller.
    return;
  }

  await AuthSession.updateOne(
    {
      _id: decoded.sid,
      userId: decoded.id,
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    },
  );
};
const logoutUserAllSessions = async (userId: string) => {
  await AuthSession.updateMany(
    {
      userId,
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    },
  );
};

const changeUserPassword = async (
  userId: string,
  payload: {
    currentPassword: string;
    newPassword: string;
  },
) => {
  // 1. Find user and retrieve password field
  const user = await User.isUserExistsById(userId);

  if (!user || user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // 2. Verify current password
  const isPasswordMatched = await user.isPasswordMatched(
    payload.currentPassword,
  );

  if (!isPasswordMatched) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      "Current password is incorrect",
    );
  }

  // 3. Assign new password
  user.password = payload.newPassword;

  // 4. Update password change timestamp
  user.passwordChangedAt = new Date();

  // 5. Save user
  // Your existing pre-save hook should hash the new password.
  await user.save();

  // 6. Revoke all sessions across all devices
  await AuthSession.updateMany(
    {
      userId: user._id,
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    },
  );

  return null;
};

const forgotUserPassword = async (email: string) => {
  // 1. Find user by email
  const user = await User.isUserExistsByEmail(email);

  // Always return the same public response
  // whether the account exists or not.
  if (!user || user.isDeleted || !user.isVerified) {
    return null;
  }
  const resetToken = generateToken();
  const hashedToken = secretHash(resetToken);

  // 3. Calculate expiration
  const expiresAt = new Date(
    Date.now() + config.password_reset_expires_minutes * 60 * 1000,
  );

  // 4. Store hashed token and expiration
  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = expiresAt;

  await user.save();

  // 5. Create reset link
  const resetUrl = new URL("/reset-password", config.client_url);

  resetUrl.searchParams.set("token", resetToken);

  // 6. Send reset email
  try {
    await emailService.sendEmail({
      to: user.email,
      subject: "Reset Your Password",
      html: resetPasswordEmailTemplate(user.name, resetUrl.toString()),
    });
  } catch (error) {
    // Do not expose email delivery failure or account existence
    // to the public API response.
    // Replace with your project's logger in production.
    console.error("Password reset email delivery failed");

    // Remove the unused reset token if email was not sent.
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();
  }

  return null;
};

const resetUserPassword = async (payload: {
  token: string;
  newPassword: string;
}) => {
  // 1. Hash received token
  const hashedToken = secretHash(payload.token);
  const hashedPassword = await bcrypt.hash(
    payload.newPassword,
    config.bcrypt_salt_rounds,
  );

  const now = new Date();

  // 3. Atomically consume reset token and update password
  const updatedUser = await User.findOneAndUpdate(
    {
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: now },
      isDeleted: false,
      isVerified: true,
    },
    {
      $set: {
        password: hashedPassword,
        passwordChangedAt: now,
        passwordResetToken: undefined,
        passwordResetExpires: undefined,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  // 4. Invalid, expired, or already-used token
  if (!updatedUser) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Invalid or expired password reset token",
    );
  }

  // 5. Revoke all active sessions
  await AuthSession.updateMany(
    {
      userId: updatedUser._id,
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: now,
      },
    },
  );

  return null;
};


export const AuthService = {
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
