import api from "../services/api.service";

export const fetchConversationMessages = (otherId: string) =>
  api.get(`/conversations/${otherId}/messages`);
