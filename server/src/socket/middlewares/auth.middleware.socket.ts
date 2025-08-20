import { verifyJwt } from "../../util/jwt-auth.util.js";
import { AuthSocket } from "../types/auth-socket.type.js";

export function authMiddleware(socket: AuthSocket, next: Function) {
  try {
    const token = (socket.handshake.auth)?.token || (socket.handshake.headers.authorization)?.replace("Bearer ", "");
    if (!token) return next(new Error("No token"));
    
    const user = verifyJwt(token);
    socket.user = user; 
    next();
  } catch (e) {
    next(new Error("Auth error"));
  }
}
