import { User } from "@prisma/client";

export interface UserDto {
  id: string;
  name: string;
  email: string;
  lastSeenAt: Date | null;
  createdAt: Date;
}

export const userToDto = (user: User): UserDto => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    lastSeenAt: user.lastSeenAt,
    createdAt: user.createdAt,
  };
};
