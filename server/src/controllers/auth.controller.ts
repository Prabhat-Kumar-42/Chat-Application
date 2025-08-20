import bcrypt from "bcrypt";
import { prisma } from "../db/db.js";
import { signJwt } from "../util/jwt-auth.util.js";
import { Request, Response } from "express";
import { userToDto } from "../dtos/users.dto.js";
import { loginSchema, registerSchema } from "../validations/user.validation.js";
import z from "zod";

export const registerHandler = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists)
      return res.status(409).json({ error: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });

    const userDto = userToDto(user);
    const token = signJwt(userDto);
    res.json({
      token,
      user: userDto,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const loginHandler = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const userDto = userToDto(user);
    const token = signJwt(userDto);
    res.json({
      token,
      user: userDto,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
