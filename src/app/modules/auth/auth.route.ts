import { Router } from "express";

import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";

const {
  registerValidationSchema,
  loginValidationSchema,
  changePasswordValidationSchema,
  forgotPasswordValidationSchema,
  resetPasswordValidationSchema
} = AuthValidation;
const { registerUser, loginUser, refreshToken, logout, changePassword, forgotPassword, resetPassword } =
  AuthController;

const router = Router();

router.post(
  "/register",
  validateRequest(registerValidationSchema),
  registerUser,
);
router.post("/login", validateRequest(loginValidationSchema), loginUser);
router.post("/logout", logout);

router.post("/refresh-token", refreshToken);

router.post(
  "/change-password",
  auth(),
  validateRequest(changePasswordValidationSchema),
  changePassword,
);

router.post(
  "/forgot-password",
  validateRequest(forgotPasswordValidationSchema),
  forgotPassword,
);
router.put("/reset-password/:token", validateRequest(resetPasswordValidationSchema), resetPassword);

export const AuthRoutes = router;
