import { create } from 'zustand';

type TypingState = {
  typingFrom: Record<string, boolean>;
  setTyping: (from: string, val: boolean) => void;
};

export const useTypingStore = create<TypingState>((set) => ({
  typingFrom: {},
  setTyping: (from, val) => set((s) => ({ typingFrom: { ...s.typingFrom, [from]: val } })),
}));
