import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route";
import { AuthRoutes } from "../modules/auth/auth.route";

const router = Router();

router.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to the LMS API"
    })
})


router.use("/users", UserRoutes);
router.use("/auth", AuthRoutes);

export default router;