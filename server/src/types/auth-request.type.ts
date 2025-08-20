import { Request } from "express";
import { UserDto } from "../dtos/users.dto.js";

export type AuthRequest = Request & { user?: UserDto };