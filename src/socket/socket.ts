import { Server } from "socket.io";
import { verifyJwt } from "../util/jwt-auth.util";
import { prisma } from "../db/db";

const onlineUsers = new Map<string, string>(); // userId -> socketId

export function initSocket(httpServer: any) {
  const io = new Server(httpServer, { cors: { origin: process.env.CLIENT_ORIGIN?.split(",") || "*" } });

  io.use((socket, next) => {
    try {
      const token = (socket.handshake.auth as any)?.token || (socket.handshake.headers.authorization as string)?.replace("Bearer ", "");
      if (!token) return next(new Error("No token"));
      const user = verifyJwt(token);
      (socket as any).user = user;
      next();
    } catch (e) {
      next(new Error("Auth error"));
    }
  });

  io.on("connection", (socket) => {
    const user = (socket as any).user as { id: string; name: string };
    onlineUsers.set(user.id, socket.id);
    io.emit("presence:update", { userId: user.id, status: "online" });

    socket.on("disconnect", async () => {
      onlineUsers.delete(user.id);
      await prisma.user.update({ where: { id: user.id }, data: { lastSeenAt: new Date() } });
      io.emit("presence:update", { userId: user.id, status: "offline" });
    });

    // message:send { to, body, tempId }
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
      const toSocket = onlineUsers.get(payload.to);
      if (toSocket) io.to(toSocket).emit("message:new", full);
    });

    // typing:start|stop { to }
    socket.on("typing:start", ({ to }) => {
      const toSocket = onlineUsers.get(to);
      if (toSocket) io.to(toSocket).emit("typing:start", { from: user.id });
    });
    socket.on("typing:stop", ({ to }) => {
      const toSocket = onlineUsers.get(to);
      if (toSocket) io.to(toSocket).emit("typing:stop", { from: user.id });
    });

    // message:read { conversationId, upToMessageId? }
    socket.on("message:read", async ({ conversationId }: { conversationId: string; upToMessageId?: string }) => {
      await prisma.message.updateMany({
        where: { conversationId, toId: user.id, status: { not: "read" } },
        data: { status: "read" }
      });
      io.emit("message:read", { conversationId, by: user.id });
    });
  });

  return io;
}
