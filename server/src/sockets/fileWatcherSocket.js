import chokidar from "chokidar";
import { buildTree } from "../utils/buildTree.js";

export default function fileWatcherSocket(socket, ROOT_DIR) {
  socket.emit("fs-update", buildTree(ROOT_DIR));

  const watcher = chokidar.watch(ROOT_DIR, { ignoreInitial: true });
  watcher.on("all", () => socket.emit("fs-update", buildTree(ROOT_DIR)));

  console.log(`✅ File watcher started for client ${socket.id}`);

  socket.on("disconnect", () => {
    watcher.close();
    console.log(`❌ File watcher stopped for client ${socket.id}`);
  });
}
