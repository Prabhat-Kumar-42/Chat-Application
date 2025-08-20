import { Router } from "express";
import { prisma } from "../db/db";
import { getUsersHandler } from "../controllers/users.controller";

export const usersRouter = Router();

usersRouter.get("/", getUsersHandler);
