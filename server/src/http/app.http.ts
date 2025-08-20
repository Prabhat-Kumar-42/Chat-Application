import "dotenv/config";
import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth.route.js";
import { isAuthenticated } from "./middlewares/auth.middleware.js";
import { usersRouter } from "./routes/users.route.js";
import { convRouter } from "./routes/conversations.route.js";

export const express_app = express();

express_app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(",") || "*" }));
express_app.use(express.json());

express_app.use("/auth", authRouter);
express_app.use("/users", isAuthenticated, usersRouter);
express_app.use("/conversations", isAuthenticated, convRouter);

