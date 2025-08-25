import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import pty from "node-pty";
import os from "os";
import path from "path";
import chokidar from "chokidar";
import fs from "fs";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

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

// ---------------- File Routes ----------------
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

app.post("/save-file", (req, res) => {
  const { path: filePath, content } = req.body;

  if (!filePath || typeof content !== "string") {
    return res.status(400).json({ message: "Invalid request" });
  }

  try {
    fs.writeFileSync(filePath, content, "utf-8");
    res.json({ message: "File saved successfully", path: filePath });
  } catch (err) {
    res.status(500).json({ message: "Failed to save file", error: err.message });
  }
});

// ---------------- Proxy Route for Iframe Preview ----------------
app.get("/proxy", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send("URL is required");

  try {
    const response = await fetch(targetUrl);

    if (!response.ok) {
      res.status(response.status).send(`Proxy fetch error: ${response.statusText}`);
      return;
    }

    const contentType = response.headers.get("content-type");
    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }

    // Remove CSP & frame restrictions
    if (contentType && contentType.includes("text/html")) {
      res.setHeader("Content-Security-Policy", "");
      res.setHeader("X-Frame-Options", "ALLOWALL");
    }

    if (contentType && contentType.includes("text/html")) {
      let body = await response.text();

      const parsedUrl = new URL(targetUrl);
      const baseUrl = parsedUrl.origin;

      // Rewrite href/src URLs for HTML only
      body = body.replace(
  /((href|src)=["'])([^"']+)/gi,
  (match, prefix, attr, url) => {
    let fullUrl;
    if (url.startsWith("http")) {
      fullUrl = url;
    } else if (url.startsWith("//")) {
      fullUrl = parsedUrl.protocol + url;
    } else if (url.startsWith("/")) {
      fullUrl = baseUrl + url;
    } else {
      fullUrl = new URL(url, baseUrl).href;
    }
    return `${prefix}/proxy?url=${encodeURIComponent(fullUrl)}`;
  }
);


      // Rewrite CSS url()
      body = body.replace(
        /url\(["']?([^)"']+)["']?\)/gi,
        (match, url) => {
          if (url.startsWith("data:")) return match;
          let fullUrl = url.startsWith("http")
            ? url
            : new URL(url, baseUrl).href;
          return `url("/proxy?url=${encodeURIComponent(fullUrl)}")`;
        }
      );

      res.send(body);
    } else {
      // For CSS, JS, images → stream without modification
      response.body.pipe(res);
    }
  } catch (err) {
    res.status(500).send("Error fetching URL: " + err.message);
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
      shell = shellType === "powershell" ? "powershell.exe" : "cmd.exe";
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
