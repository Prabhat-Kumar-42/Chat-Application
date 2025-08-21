import { createContext, useContext, useEffect, useState } from "react";
import Constants from "expo-constants";
import { io, Socket } from "socket.io-client";
import { AuthContext } from "./AuthContext";
import { useStore } from "../store/index";

const SOCKET_URL = (Constants.expoConfig?.extra as any)?.SOCKET_URL || process.env.SOCKET_URL || "http://localhost:4000";

export const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { token } = useContext(AuthContext);
  const [socket, setSocket] = useState<Socket | null>(null);
  const setPresence = useStore.getState().setPresence;
  const setTyping = useStore.getState().setTyping;
  const addMessage = useStore.getState().addMessage;
  const replaceMessageByTempId = useStore.getState().replaceMessageByTempId;
  const markMessagesRead = useStore.getState().markMessagesRead;

  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const s = io(SOCKET_URL, { auth: { token } });

    // global listeners
    s.on("presence:update", ({ userId, status }: any) => {
      setPresence(userId, status);
    });

    s.on("typing:start", ({ from }: { from: string }) => setTyping(from, true));
    s.on("typing:stop", ({ from }: { from: string }) => setTyping(from, false));

    s.on("message:new", (m: any) => {
      // if contains tempId, reconcile; else just add
      if (m.tempId) replaceMessageByTempId(m.fromId === m.toId ? m.toId : m.fromId, m.tempId, m);
      else {
        // determine otherId: msg from someone else -> add under fromId; if it's sent to someone else, add under toId
        const otherId = m.fromId === (useStore.getState().me?.id) ? m.toId : m.fromId;
        addMessage(otherId, m);
      }
    });

    s.on("message:read", ({ conversationId, by }: any) => {
      // will fire a store update: mark messages read for conversation participants
      // client store maps messages by otherId; marking will be handled per-screen
      // keep it simple here: no-op (screens emit read when view)
    });

    setSocket(s);
    return () => {
      s.disconnect();
      setSocket(null);
    };
  }, [token]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
