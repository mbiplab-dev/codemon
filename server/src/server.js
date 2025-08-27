import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";

import fileRoutes from "./routes/fileRoutes.js";
import proxyRoutes from "./routes/proxyRoutes.js";
import terminalSocket from "./sockets/terminalSocket.js";
import fileWatcherSocket from "./sockets/fileWatcherSocket.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use(fileRoutes);
app.use(proxyRoutes);

const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const ROOT_DIR = path.resolve("../../");

io.on("connection", (socket) => {
  console.log("✅ Client connected");
  terminalSocket(socket, ROOT_DIR);
  fileWatcherSocket(socket, ROOT_DIR);
});

server.listen(3001, () => {
  console.log("🚀 Server running at http://localhost:3001");
});
