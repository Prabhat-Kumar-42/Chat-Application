import { create } from 'zustand';
import { Message } from '../types/message.type';

type MessageState = {
  messages: Record<string, Message[]>;

  setMessagesFor: (otherId: string, msgs: Message[]) => void;
  mergeMessage: (otherId: string, m: Message) => void;
  replaceMessageByTempId: (otherId: string, tempId: string, m: Message) => void;
  markMessagesRead: (otherId: string) => void;
};

export const useMessageStore = create<MessageState>((set) => ({
  messages: {},

  setMessagesFor: (otherId, msgs) => set((s) => ({ messages: { ...s.messages, [otherId]: msgs } })),

  mergeMessage: (otherId, m) =>
    set((s) => {
      const msgs = [...(s.messages[otherId] || [])];
      const idx = msgs.findIndex(
        (x) => x.tempId && m.tempId && x.tempId === m.tempId
      );

      if (idx >= 0) msgs[idx] = m;
      else if (!msgs.some((x) => x.id === m.id)) msgs.push(m);

      return { messages: { ...s.messages, [otherId]: msgs } };
    }),

  replaceMessageByTempId: (otherId, tempId, m) =>
    set((s) => {
      const msgs = [...(s.messages[otherId] || [])];
      const idx = msgs.findIndex((x) => x.tempId === tempId);
      if (idx >= 0) msgs[idx] = m;
      else msgs.push(m);
      return { messages: { ...s.messages, [otherId]: msgs } };
    }),

  markMessagesRead: (otherId) =>
    set((s) => {
      const msgs = (s.messages[otherId] || []).map((m) =>
        m.fromId === otherId ? { ...m, status: 'read' as Message['status'] } : m
      );
      return { messages: { ...s.messages, [otherId]: msgs } };
    }),
}));
