import { AuthSocket } from "../types/auth-socket.type.js";
import { UserDto } from "../../dtos/users.dto.js";
import { OnlineUsers } from "../online-users-singleton.socket.js";  
import { prisma } from "../../db/db.js";
import { Server } from "socket.io";

export function handleMessaging(socket: AuthSocket, io: Server, user: UserDto, onlineUsers: OnlineUsers) {
  // Send a message
  socket.on("message:send", async (payload: { to: string; body: string; tempId?: string }) => {
    const me = user.id;

    let conv = await prisma.conversation.findFirst({
      where: {
        participants: { some: { userId: me } },
        AND: { participants: { some: { userId: payload.to } } }
      }
    });
    if (!conv) {
      conv = await prisma.conversation.create({
        data: { participants: { create: [{ userId: me }, { userId: payload.to }] } }
      });
    }

    const msg = await prisma.message.create({
      data: {
        conversationId: conv.id,
        fromId: me,
        toId: payload.to,
        body: payload.body,
        status: "delivered"
      }
    });

    await prisma.conversation.update({ where: { id: conv.id }, data: { lastMessageId: msg.id } });

    const full = msg;

    socket.emit("message:new", { ...full, tempId: payload.tempId });
    const toSocket = onlineUsers.getUserSocket(payload.to); 
    if (toSocket) io.to(toSocket).emit("message:new", full);
  });

  // Message read event
  socket.on("message:read", async ({ conversationId }: { conversationId: string }) => {
    await prisma.message.updateMany({
      where: { conversationId, toId: user.id, status: { not: "read" } },
      data: { status: "read" }
    });
    io.emit("message:read", { conversationId, by: user.id });
  });

  // Typing start/stop events
  socket.on("typing:start", ({ to }: { to: string }) => {
    const toSocket = onlineUsers.getUserSocket(to); 
    if (toSocket) io.to(toSocket).emit("typing:start", { from: user.id });
  });

  socket.on("typing:stop", ({ to }: { to: string }) => {
    const toSocket = onlineUsers.getUserSocket(to); 
    if (toSocket) io.to(toSocket).emit("typing:stop", { from: user.id });
  });
}
