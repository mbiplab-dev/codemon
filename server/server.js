// server.js
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import pty from "node-pty";
import os from "os";
import path from "path";
import chokidar from "chokidar";
import fs from "fs";
import cors from "cors";

const app = express();
app.use(cors()); // enable CORS for all routes

const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const ROOT_DIR = path.resolve("./");

// ---------------- File Tree Builder ----------------
function buildTree(dirPath) {
  const stats = fs.statSync(dirPath);
  const info = {
    name: path.basename(dirPath),
    path: dirPath,
    type: stats.isDirectory() ? "folder" : "file",
  };

  if (stats.isDirectory()) {
    info.children = fs
      .readdirSync(dirPath)
      .map((child) => buildTree(path.join(dirPath, child)));
  }

  return info;
}

// ---------------- HTTP ROUTE ----------------
app.get("/file", (req, res) => {
  const filePath = req.query.path;
  if (!filePath) return res.status(400).send("No file path provided");

  try {
    const content = fs.readFileSync(filePath.toString(), "utf-8");
    res.json({ path: filePath, content });
  } catch (err) {
    res.status(500).json({ error: "Failed to read file", details: err.message });
  }
});

// ---------------- Socket Connections ----------------
io.on("connection", (socket) => {
  console.log("✅ Client connected");

  let ptyProcess;

  // Terminal
  socket.on("createTerminal", ({ shellType }) => {
    let shell;
    if (os.platform() === "win32") {
      if (shellType === "powershell") shell = "powershell.exe";
      else if (shellType === "cmd") shell = "cmd.exe";
      else shell = "cmd.exe";
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

    ptyProcess.onData((data) => socket.emit("output", data));
  });

  socket.on("input", (data) => ptyProcess?.write(data));
  socket.on("resize", ({ cols, rows }) => ptyProcess?.resize(cols, rows));

  // File Explorer
  socket.emit("fs-update", buildTree(ROOT_DIR));
  const watcher = chokidar.watch(ROOT_DIR, { ignoreInitial: true });
  watcher.on("all", () => socket.emit("fs-update", buildTree(ROOT_DIR)));

  // Socket file operations (optional, for saving)
  socket.on("save-file", ({ path: filePath, content }) => {
    try {
      fs.writeFileSync(filePath, content, "utf-8");
      socket.emit("file-saved", filePath);
    } catch (err) {
      socket.emit("error", { message: "Failed to save file", error: err });
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected");
    ptyProcess?.kill();
    watcher.close();
  });
});

// Start server
server.listen(3001, () => {
  console.log("🚀 Server running at http://localhost:3001");
});
