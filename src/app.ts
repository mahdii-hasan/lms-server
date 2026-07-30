import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import router from "./app/routes";

const app = express();

app.use(express.json());
app.use(cors())
app.use(helmet());
app.use(cookieParser());

app.use("/api", router)

export default app;