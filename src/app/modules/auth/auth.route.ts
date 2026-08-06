import { Router } from "express";

import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";

const {
  registerValidationSchema,
  loginValidationSchema,
  changePasswordValidationSchema,
} = AuthValidation;
const { registerUser, loginUser, refreshToken, logout, changePassword } =
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

export const AuthRoutes = router;
