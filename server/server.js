import express from "express";
import http from "http";
import { Server } from "socket.io";
import pty from "node-pty";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }, // adjust in production
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  const shell = process.env.SHELL || "bash";
  const ptyProcess = pty.spawn(shell, [], {
    name: "xterm-color",
    cols: 80,
    rows: 30,
    cwd: process.cwd(),
    env: process.env,
  });

  // Send terminal output to client
  ptyProcess.onData((data) => {
    socket.emit("output", data);
  });

  // Receive input from client
  socket.on("input", (data) => {
    ptyProcess.write(data);
  });

  socket.on("resize", ({ cols, rows }) => {
    ptyProcess.resize(cols, rows);
  });

  socket.on("disconnect", () => {
    ptyProcess.kill();
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(3001, () => {
  console.log("Socket.IO bash server running on port 3001");
});
