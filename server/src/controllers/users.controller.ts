import { Response } from "express";
import { prisma } from "../db/db.js";
import { AuthRequest } from "../types/auth-request.type.js";
import { userToDto } from "../dtos/users.dto.js";
import z from "zod";

export const getUsersHandler = async (req: AuthRequest, res: Response) => {
  try {
    const me = req.user?.id as string;
    if (!me) return res.status(401).json({ error: "Unauthorized" });
    const users = await prisma.user.findMany({
      where: { NOT: { id: me } },
    });
    const userList = users.map((user) => userToDto(user));
    res.json(userList);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
