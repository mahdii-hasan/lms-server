import { Router } from "express";
import { UserControllers } from "./user.controller";
import auth from "../../middlewares/auth";


const {getMe} = UserControllers;

const router = Router();

router.get("/me",auth(), getMe);

export const UserRoutes = router;