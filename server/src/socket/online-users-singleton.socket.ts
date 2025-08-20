export class OnlineUsers {
  private static instance: OnlineUsers;
  private onlineUsersMap: Map<string, string>;

  // Private constructor to prevent instantiation from outside
  private constructor() {
    this.onlineUsersMap = new Map<string, string>();
  }

  // Method to get the single instance of the class
  public static getInstance(): OnlineUsers {
    if (!OnlineUsers.instance) {
      OnlineUsers.instance = new OnlineUsers();
    }
    return OnlineUsers.instance;
  }

  // Method to add a user to the online users map
  public addUser(userId: string, socketId: string): void {
    this.onlineUsersMap.set(userId, socketId);
  }

  // Method to remove a user from the online users map
  public removeUser(userId: string): void {
    this.onlineUsersMap.delete(userId);
  }

  // Method to get a user's socket ID
  public getUserSocket(userId: string): string | undefined {
    return this.onlineUsersMap.get(userId);
  }

  // Method to get all online users
  public getAllUsers(): Map<string, string> {
    return this.onlineUsersMap;
  }
}

// Export the singleton instance
export const onlineUsers = OnlineUsers.getInstance();