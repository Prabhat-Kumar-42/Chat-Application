import api from "../services/api.service";

export const fetchUsers = () => api.get("/users");
