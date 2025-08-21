import api from "./client.api";
export const fetchUsers = () => api.get("/users");
