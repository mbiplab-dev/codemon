import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import pty from "node-pty";
import os from "os";
import path from "path";
import chokidar from "chokidar";
import fs from "fs";

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const ROOT_DIR = path.resolve("./"); // project root

// Helper to build folder tree
function buildTree(dirPath) {
  const stats = fs.statSync(dirPath);
  const info = {
    name: path.basename(dirPath),
    type: stats.isDirectory() ? "folder" : "file",
  };

  if (stats.isDirectory()) {
    info.children = fs
      .readdirSync(dirPath)
      .map((child) => buildTree(path.join(dirPath, child)));
  }

  return info;
}

io.on("connection", (socket) => {
  console.log("✅ Client connected");

  let ptyProcess;

  // ---------------- Terminal ----------------
  socket.on("createTerminal", ({ shellType }) => {
    let shell;

    if (os.platform() === "win32") {
      if (shellType === "powershell") {
        shell = "powershell.exe";
      } else if (shellType === "cmd") {
        shell = "cmd.exe";
      } else if (shellType === "gitbash") {
        // ⚠️ update this path if your Git Bash install differs
        shell = "C:\\Program Files\\Git\\bin\\bash.exe";
      } else {
        shell = "cmd.exe";
      }
    } else {
      shell = shellType === "bash" ? "bash" : "zsh";
    }

    ptyProcess = pty.spawn(shell, [], {
      name: "xterm-color",
      cols: 80,
      rows: 30,
      cwd: ROOT_DIR,
      env: process.env,
    });

    // Emit real terminal output
    ptyProcess.onData((data) => {
      socket.emit("output", data);
    });
  });

  socket.on("input", (data) => {
    ptyProcess?.write(data);
  });

  socket.on("resize", ({ cols, rows }) => {
    ptyProcess?.resize(cols, rows);
  });

  // ---------------- File Explorer ----------------
  // send initial structure
  socket.emit("fs-update", buildTree(ROOT_DIR));

  // watch for changes
  const watcher = chokidar.watch(ROOT_DIR, { ignoreInitial: true });

  watcher.on("all", () => {
    socket.emit("fs-update", buildTree(ROOT_DIR));
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected");
    ptyProcess?.kill();
    watcher.close();
  });
});

server.listen(3001, () => {
  console.log("🚀 Server running at http://localhost:3001");
});
