import { create } from 'zustand';
import { User } from '../types/user.type';

type UserState = {
  me?: User;
  users: User[];
  presence: Record<string, "online" | "offline">;

  setMe: (u?: User) => void;
  setUsers: (u: User[]) => void;
  setPresence: (userId: string, status: "online" | "offline") => void;
};

export const useUserStore = create<UserState>((set) => ({
  me: undefined,
  users: [],
  presence: {},

  setMe: (me) => set({ me }),
  setUsers: (users) => set({ users }),
  setPresence: (userId, status) => set((s) => ({ presence: { ...s.presence, [userId]: status } })),
}));
