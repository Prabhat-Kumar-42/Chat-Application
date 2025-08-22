// src/contexts/SocketContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { useUserStore } from '../stores/user.store';
import { useTypingStore } from '../stores/typing.store';
import { useMessageStore } from '../stores/message.store';
import { AuthContext } from './AuthContext';
import socketSingletonService from '../services/socket-singleton.service';

export const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { token } = useContext(AuthContext);
  const [socket, setSocket] = useState<Socket | null>(null);

  // get store setters once (stable refs)
  const setPresence = useUserStore.getState().setPresence;
  const setTyping = useTypingStore.getState().setTyping;
  const replaceMessageByTempId = useMessageStore.getState().replaceMessageByTempId;
  const markMessagesRead = useMessageStore.getState().markMessagesRead;
  const setMessagesFor = useMessageStore.getState().setMessagesFor;
  
  useEffect(() => {
    if (!token) {
      // ensure socket is fully disconnected and cleared
      socketSingletonService.disconnect();
      setSocket(null);
      return;
    }

    const s = socketSingletonService.init(token);
    setSocket(s);

    // named handlers so we can remove exactly the same fn on cleanup
    const handlePresenceList = ({ onlineUsers }: { onlineUsers: string[] }) => {
      console.log('client side presence:list', onlineUsers);
      onlineUsers.forEach((userId) => setPresence(userId, 'online'));
    };

    const handlePresenceUpdate = ({
      userId,
      status,
    }: {
      userId: string;
      status: 'online' | 'offline';
    }) => {
      setPresence(userId, status);
    };

    const handleTypingStart = ({ from }: { from: string }) => setTyping(from, true);
    const handleTypingStop = ({ from }: { from: string }) => setTyping(from, false);

    const handleMessageNew = (m: any) => {
      try {
        console.log('socket message:new received:', m);

        // Try to resolve otherId in order of reliability:
        const meId = useUserStore.getState().me?.id;
        let otherId: string | undefined;

        if (meId) {
          // usual case: pick the opposite party
          otherId = m.fromId === meId ? m.toId : m.fromId;
        }

        // If still not found, try to infer from conversationId in the message store
        if (!otherId) {
          const messagesState = useMessageStore.getState().messages;
          const entry = Object.entries(messagesState).find(([key, list]) =>
            list.some((msg) => msg.conversationId === m.conversationId)
          );
          if (entry) otherId = entry[0];
        }

        // Final fallback: pick fromId or toId
        if (!otherId) otherId = m.fromId ?? m.toId;

        if (!otherId) {
          console.warn("socket message:new — couldn't resolve otherId, skipping", m);
          return;
        }

        console.log('socket message:new -> resolved otherId:', otherId, 'meId:', meId);

        // If this message is a confirmation of an optimistic message (tempId present)
        console.log('Checking for tempId match:', { tempId: m.tempId, fromId: m.fromId, meId });
        if (m.tempId && m.fromId === meId) {
          // match your existing behavior for replacing temp messages
          replaceMessageByTempId(otherId, m.tempId, m);
          console.log('Replaced temp message with server message:', {
            otherId,
            tempId: m.tempId,
            id: m.id,
          });
          return;
        }

        // Normal inbound message: append to the conversation's array via setMessagesFor (safe replacement)
        const current = useMessageStore.getState().messages[otherId] || [];
        // avoid duplicates: check if same id already present
        if (!current.some((x) => x.id === m.id)) {
          setMessagesFor(otherId, [...current, m]); // are we not using mergeMessage now ? 
          console.log('Appended incoming message to store:', {
            otherId,
            newCount: current.length + 1,
          });
        } else {
          console.log('Incoming message already present, skipping append:', m.id);
        }
      } catch (err) {
        console.error('handleMessageNew error', err);
      }
    };

    const handleMessageRead = ({ conversationId }: any) => {
      const messages = useMessageStore.getState().messages;
      const entry = Object.entries(messages).find(([_, list]) =>
        list.some((msg) => msg.conversationId === conversationId)
      );
      if (entry) {
        const [otherId] = entry;
        markMessagesRead(otherId);
      }
    };

    // attach
    s.on('presence:list', handlePresenceList);
    s.on('presence:update', handlePresenceUpdate);
    s.on('typing:start', handleTypingStart);
    s.on('typing:stop', handleTypingStop);
    s.on('message:new', handleMessageNew);
    s.on('message:read', handleMessageRead);

    // cleanup
    return () => {
      s.off('presence:list', handlePresenceList);
      s.off('presence:update', handlePresenceUpdate);
      s.off('typing:start', handleTypingStart);
      s.off('typing:stop', handleTypingStop);
      s.off('message:new', handleMessageNew);
      s.off('message:read', handleMessageRead);
      // DO NOT disconnect singleton here — keep it across screens (your previous intention)
    };
  }, [token]); // <-- only depend on token

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

// Hook to access the socket anywhere
export const useSocket = () => useContext(SocketContext);
