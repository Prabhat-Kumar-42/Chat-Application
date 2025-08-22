import { Server } from "socket.io";
import { prisma } from "../../db/db.js";
import { AuthSocket } from "../types/auth-socket.type.js";
import { UserDto } from "../../dtos/users.dto.js";
import { OnlineUsers } from "../online-users-singleton.socket.js";

export function handlePresence(
  socket: AuthSocket,
  io: Server,
  user: UserDto,
  onlineUsers: OnlineUsers
) {
  // On user disconnect (offline)
  socket.on("disconnect", async () => {
    await prisma.user.update({
      where: { id: user.id },
      data: { lastSeenAt: new Date() },
    });
    onlineUsers.removeUser(user.id); 
    io.emit("presence:update", { userId: user.id, status: "offline" });
  });

  onlineUsers.addUser(user.id, socket.id); 
  
  // Send list of previously connected users to this socket only
  const alreadyOnline = onlineUsers.getAllUsers().filter(id => id !== user.id);
  console.log(`server side ${alreadyOnline}`)
  socket.emit("presence:list", { onlineUsers: alreadyOnline });
  
  // On user connection (online)
  io.emit("presence:update", { userId: user.id, status: "online" });
}
