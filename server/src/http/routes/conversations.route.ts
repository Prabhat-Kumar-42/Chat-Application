import { Router } from "express";
import { getMessagesHandler } from "../controllers/conversations.controller.js";

export const convRouter = Router();

// GET /conversations/:otherId/messages
convRouter.get("/:otherId/messages", getMessagesHandler);
