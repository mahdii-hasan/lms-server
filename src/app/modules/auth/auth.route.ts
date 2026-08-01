import { Router } from "express";

import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";
import validateRequest from "../../middlewares/validateRequest";

const { registerValidationSchema } = AuthValidation;
const {registerUser} = AuthController;

const router = Router();

router.post("/register", validateRequest(registerValidationSchema), registerUser);

export const AuthRoutes = router;
