import { Router } from "express";

import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";
import validateRequest from "../../middlewares/validateRequest";

const { registerValidationSchema, loginValidationSchema } = AuthValidation;
const { registerUser, loginUser } = AuthController;

const router = Router();

router.post(
  "/register",
  validateRequest(registerValidationSchema),
  registerUser,
);
router.post(
  "/login",
  validateRequest(loginValidationSchema),
  loginUser,
);

export const AuthRoutes = router;
