import api from "./client.api";
export const fetchConversationMessages = (otherId: string) =>
  api.get(`/conversations/${otherId}/messages`);
