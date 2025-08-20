import { Router } from "express";
import { getUsersHandler } from "../controllers/users.controller.js";

export const usersRouter = Router();

usersRouter.get("/", getUsersHandler);
