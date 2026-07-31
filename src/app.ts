import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import router from "./app/routes";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";

const app = express();

app.use(express.json());
app.use(cors())
app.use(helmet());
app.use(cookieParser());

app.use("/api", router)

app.use(globalErrorHandler);

export default app;