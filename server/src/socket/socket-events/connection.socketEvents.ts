import { Server } from "socket.io";
import { handlePresence } from "./presence.socketEvents.js";
import { handleMessaging } from "./messaging.socketEvents.js";
import { AuthSocket } from "../types/auth-socket.type.js";
import { onlineUsers } from "../online-users-singleton.socket.js";

export function handleConnection(socket: AuthSocket, io: Server) {
  const user = socket.user;

  if(!user) throw new Error("User not authenticated");

  handlePresence(socket, io, user, onlineUsers);

  handleMessaging(socket, io, user, onlineUsers);
}