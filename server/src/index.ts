import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import { authRouter } from "./routes/auth.route.js";
import { usersRouter } from "./routes/users.route.js";
import { convRouter } from "./routes/conversations.route.js";
import { initSocket } from "../src/socket/socket.js";
import { isAuthenticated} from "./middlewares/auth.middleware.js";

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(",") || "*" }));
app.use(express.json());

app.use("/auth", authRouter);
app.use("/users", isAuthenticated, usersRouter);
app.use("/conversations", isAuthenticated, convRouter);

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`✅ Server running :${PORT}`));
