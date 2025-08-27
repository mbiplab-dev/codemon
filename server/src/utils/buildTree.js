import fs from "fs";
import path from "path";

export function buildTree(dirPath) {
  if (!fs.existsSync(dirPath)) return null;

  let stats;
  try {
    stats = fs.statSync(dirPath);
  } catch (err) {
    if (err.code === 'ENOENT') return null;
    throw err;
  }

  const info = {
    name: path.basename(dirPath),
    path: dirPath,
    type: stats.isDirectory() ? "folder" : "file",
  };

  if (stats.isDirectory()) {
    const ignoredDirs = ['.next', 'node_modules', '.git'];
    if (ignoredDirs.includes(info.name)) return null;

    try {
      const children = fs
        .readdirSync(dirPath)
        .map((child) => buildTree(path.join(dirPath, child)))
        .filter(Boolean);
      info.children = children;
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }

  return info;
}
