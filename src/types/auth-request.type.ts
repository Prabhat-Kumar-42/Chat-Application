import { Request } from "express";
import { UserDto } from "../dtos/users.dto";

export type AuthRequest = Request & { user?: UserDto };