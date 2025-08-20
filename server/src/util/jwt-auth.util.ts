import jwt from "jsonwebtoken";
import { UserDto } from "../http/dtos/users.dto.js";

const JWT_SECRET = process.env.JWT_SECRET!;

export const signJwt = (payload: UserDto) =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

export const verifyJwt = (token: string) =>
  jwt.verify(token, JWT_SECRET) as UserDto;
