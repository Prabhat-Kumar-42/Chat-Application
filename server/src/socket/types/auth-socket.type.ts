import { Socket } from "socket.io";
import { UserDto } from "../../dtos/users.dto";

export type AuthSocket = Socket & { user?: UserDto };