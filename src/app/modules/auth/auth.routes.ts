import express from "express";

import { AuthController } from "./auth.controller";

import { AuthValidation } from "./auth.validation";
import validateRequest from "../../middlewares/validateRequest";
import authMiddleware from "../../middlewares/auth.middleware";

const {
  registerValidationSchema,
  verifyEmailValidationSchema,
  resendVerificationValidationSchema,
  loginValidationSchema,
  changePasswordValidationSchema,
  forgotPasswordValidationSchema,
  resetPasswordValidationSchema,
} = AuthValidation;
const { registerUser, verifyEmail, resendVerification, loginUser } =
  AuthController;

const router = express.Router();

router.post(
  "/register",
  validateRequest(registerValidationSchema),
  registerUser,
);

router.post(
  "/verify-email",
  validateRequest(verifyEmailValidationSchema),
  verifyEmail,
);

router.post(
  "/resend-verification",
  validateRequest(resendVerificationValidationSchema),
  resendVerification,
);

router.post("/login", validateRequest(loginValidationSchema), loginUser);
router.post("/refresh-token", AuthController.refreshTokens);
router.post("/logout", AuthController.logoutUser);
router.post(
  "/logout-all",
  authMiddleware(),
  AuthController.logoutUserAllSessions,
);

router.patch(
  "/change-password",
  authMiddleware(),
  validateRequest(changePasswordValidationSchema),
  AuthController.changeUserPassword,
);

router.post(
  "/forgot-password",
  validateRequest(forgotPasswordValidationSchema),
  AuthController.forgotUserPassword,
);

// Reset password - public, token required in body
router.post(
  "/reset-password",
  validateRequest(resetPasswordValidationSchema),
  AuthController.resetUserPassword,
);

export const AuthRoutes = router;
