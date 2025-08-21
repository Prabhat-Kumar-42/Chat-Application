import { io, Socket } from "socket.io-client";
import Constants from "expo-constants";

const SOCKET_URL =
  (Constants.expoConfig?.extra as any)?.SOCKET_URL ||
  process.env.SOCKET_URL ||
  "http://localhost:4000";

class SocketService {
  private socket: Socket | null = null;

  init(token: string) {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, { auth: { token } });
    }
    return this.socket;
  }

  get() {
    if (!this.socket) throw new Error("Socket not initialized");
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new SocketService();
