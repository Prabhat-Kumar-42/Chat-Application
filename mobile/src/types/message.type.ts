export enum MessageStatus {
  Sent = "sent",
  Delivered = "delivered",
  Read = "read",
  Sending = "sending",
}

export type Message = {
  id: string;
  conversationId: string;
  fromId: string;
  toId: string;
  body: string;
  status: MessageStatus;
  createdAt: string;
  tempId?: string;
};
