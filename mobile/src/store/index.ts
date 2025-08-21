import { create } from "zustand";
import { User } from "../types/user.type";
import { Message } from "../types/message.type";

type State = {
  me?: User;
  users: User[];
  messages: Record<string, Message[]>;
  typingFrom: Record<string, boolean>;
  presence: Record<string, "online" | "offline">;
  setMe: (u?: User) => void;
  setUsers: (u: User[]) => void;
  addMessage: (otherId: string, m: Message) => void;
  replaceMessageByTempId: (otherId: string, tempId: string, m: Message) => void;
  setTyping: (from: string, val: boolean) => void;
  setPresence: (userId: string, status: "online" | "offline") => void;
  markMessagesRead: (otherId: string) => void;
};

export const useStore = create<State>((set) => ({
  users: [],
  messages: {},
  typingFrom: {},
  presence: {},
  setMe: (me) => set({ me }),
  setUsers: (users) => set({ users }),
  addMessage: (otherId, m) =>
    set((s) => ({ messages: { ...s.messages, [otherId]: [...(s.messages[otherId] || []), m] } })),
  replaceMessageByTempId: (otherId, tempId, m) =>
    set((s) => {
      const msgs = s.messages[otherId] || [];
      const idx = msgs.findIndex((x) => x.tempId === tempId);
      if (idx >= 0) msgs[idx] = m;
      else msgs.push(m);
      return { messages: { ...s.messages, [otherId]: msgs } };
    }),
  setTyping: (from, val) => set((s) => ({ typingFrom: { ...s.typingFrom, [from]: val } })),
  setPresence: (userId, status) => set((s) => ({ presence: { ...s.presence, [userId]: status } })),
  markMessagesRead: (otherId) =>
    set((s) => {
      const msgs = (s.messages[otherId] || []).map((m) =>
        m.fromId === otherId ? { ...m, status: "read" as Message["status"] } : m
      );
      return { messages: { ...s.messages, [otherId]: msgs } };
    }),
}));
