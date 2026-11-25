import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { UserRoutes } from "../modules/user/user.routes";

const routes = Router();

routes.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

routes.use("/auth", AuthRoutes);
routes.use("/user", UserRoutes);

export default routes;
