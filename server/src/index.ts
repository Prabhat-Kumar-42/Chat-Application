import { express_app } from "./http/app.http.js";
import { initSocket } from "./socket/app.socket.js";
import http from "http";

async function startServer() {
  const server = http.createServer(express_app);

  initSocket(server);

  const PORT = process.env.PORT || 4000;
  server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
}

// Call the async bootstrap function and handle errors
startServer().catch((err) => {
  console.error("Error starting server:", err);
});