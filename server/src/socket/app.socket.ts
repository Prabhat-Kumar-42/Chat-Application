import { Server } from "socket.io";
import { authMiddleware } from "./middlewares/auth.middleware.socket.js"; 
import { handleConnection } from "./socket-events/connection.socketEvents.js"; 
import { Server as HttpServer } from "http";

export function initSocket(httpServer: HttpServer) {
  // Initialize the socket.io server with CORS options
  const io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_ORIGIN?.split(",") || "*" }
  });

  // Apply authentication middleware to handle user JWT verification
  io.use(authMiddleware);

  // Handle socket connections
  io.on("connection", (socket) => {
    handleConnection(socket, io); 
  });

  return io;
}
