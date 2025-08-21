// src/contexts/SocketContext.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { AuthContext } from "./AuthContext";
import { useStore } from "../store/index";
import socketSingletonService from "~/services/socket-singleton.service";

export const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { token } = useContext(AuthContext);
  const [socket, setSocket] = useState<Socket | null>(null);

  // store actions
  const setPresence = useStore.getState().setPresence;
  const setTyping = useStore.getState().setTyping;
  const addMessage = useStore.getState().addMessage;
  const replaceMessageByTempId = useStore.getState().replaceMessageByTempId;
  const markMessagesRead = useStore.getState().markMessagesRead;

  useEffect(() => {
    if (!token) {
      if (socket) {
        socketSingletonService.disconnect();
        setSocket(null);
      }
      return;
    }
    if (socket) return;

    const s = socketSingletonService.init(token);

    // presence
    s.on("presence:update", ({ userId, status }: any) => {
      setPresence(userId, status);
    });

    // typing
    s.on("typing:start", ({ from }: { from: string }) => setTyping(from, true));
    s.on("typing:stop", ({ from }: { from: string }) => setTyping(from, false));

    // messages
    s.on("message:new", (m: any) => {
      const meId = useStore.getState().me?.id;
      const otherId = m.fromId === meId ? m.toId : m.fromId;
      if (m.tempId) {
        replaceMessageByTempId(otherId, m.tempId, m);
      } else {
        addMessage(otherId, m);
      }
    });

    // read receipts (map by conversationId → otherId)
    s.on("message:read", ({ conversationId }: any) => {
      const state = useStore.getState();
      const entry = Object.entries(state.messages).find(([_, list]) =>
        list.some((msg) => msg.conversationId === conversationId)
      );
      if (entry) {
        const [otherId] = entry;
        markMessagesRead(otherId);
      }
    });

    setSocket(s);

    return () => {
      s.off("presence:update");
      s.off("typing:start");
      s.off("typing:stop");
      s.off("message:new");
      s.off("message:read");
      // do not disconnect here — keep singleton alive across screens
    };
  }, [token, socket]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => useContext(SocketContext);
