"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { ChevronRight, ChevronDown, Folder, File } from "lucide-react";

type FileNode = {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileNode[];
};

export default function Explorer({
  onFileClick,
}: {
  onFileClick: (file: { name: string; path: string }) => void;
}) {
  const [tree, setTree] = useState<FileNode | null>(null);
  const [openedFolders, setOpenedFolders] = useState<Set<string>>(new Set());

  // Load tree and opened folders from localStorage
  useEffect(() => {
    const savedTree = localStorage.getItem("explorerTree");
    if (savedTree) setTree(JSON.parse(savedTree));

    const savedOpened = localStorage.getItem("openedFolders");
    if (savedOpened) setOpenedFolders(new Set(JSON.parse(savedOpened)));

    const socket = io("http://localhost:3001");

    socket.on("fs-update", (data: FileNode) => {
      setTree(data);
      localStorage.setItem("explorerTree", JSON.stringify(data));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Toggle folder open state
  const toggleFolder = (path: string) => {
    const newOpened = new Set(openedFolders);
    if (openedFolders.has(path)) {
      newOpened.delete(path);
    } else {
      newOpened.add(path);
    }
    setOpenedFolders(newOpened);
    localStorage.setItem("openedFolders", JSON.stringify(Array.from(newOpened)));
  };

  const FileItem = ({ node }: { node: FileNode }) => {
    const isOpen = openedFolders.has(node.path);

    if (node.type === "folder") {
      return (
        <div>
          <div
            className="flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-orange-500/20 rounded-md"
            onClick={() => toggleFolder(node.path)}
          >
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <Folder className="text-orange-400" size={16} />
            <span className="ml-1 text-sm">{node.name}</span>
          </div>

          {isOpen && node.children && (
            <div className="ml-5 border-l border-gray-700 pl-2">
              {node.children.map((child) => (
                <FileItem key={child.path} node={child} />
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        className="flex items-center gap-1 px-2 py-1 ml-6 cursor-pointer hover:bg-orange-500/20 rounded-md"
        onClick={() => onFileClick({ name: node.name, path: node.path })}
      >
        <File className="text-gray-400" size={16} />
        <span className="ml-1 text-sm">{node.name}</span>
      </div>
    );
  };

  return (
    <div className="h-full w-full border border-neutral-800 rounded-lg overflow-hidden bg-[#0a0a0a] shadow-lg flex flex-col">
      <div className="flex items-center h-10 bg-neutral-900 border-b border-neutral-800 px-4 text-gray-300">
        Explorer
      </div>

      <div className="flex-1 overflow-y-auto p-2 scrollable">
        {tree ? <FileItem node={tree} /> : <p className="text-gray-500 text-sm">Loading...</p>}
      </div>
    </div>
  );
}
