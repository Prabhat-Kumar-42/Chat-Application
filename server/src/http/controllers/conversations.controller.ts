import { Response } from "express";
import { prisma } from "../../db/db.js";
import { AuthRequest } from "../types/auth-request.type.js";

export const getOrCreate1to1Conversation = async (userA: string, userB: string) => {
  const conv = await prisma.conversation.findFirst({
    where: {
      participants: { some: { userId: userA } },
      AND: { participants: { some: { userId: userB } } }
    },
    include: { participants: true }
  });
  if (conv) return conv;

  const created = await prisma.conversation.create({
    data: { participants: { create: [{ userId: userA }, { userId: userB }] } }
  });
  return created;
}

export const getMessagesHandler = async (req: AuthRequest, res: Response) => {
  const me = req.user?.id as string;
  if (!me) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const otherId = req.params.otherId;
  if (!otherId) {
    return res.status(400).json({ error: "Invalid otherId" });
  }

  try {
    const userAExists = await prisma.user.findUnique({ where: { id: me } });
    const userBExists = await prisma.user.findUnique({ where: { id: otherId } });

    if (!userAExists || !userBExists) {
      return res.status(404).json({ error: "User(s) not found" });
    }

    const conv = await getOrCreate1to1Conversation(me, otherId);

    const messages = await prisma.message.findMany({
      where: { conversationId: conv.id },
      orderBy: { createdAt: "asc" }
    });

    res.json({ conversationId: conv.id, messages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};