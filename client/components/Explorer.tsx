"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { ChevronRight, ChevronDown, Folder, File } from "lucide-react";

type FileNode = {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
};

function FileItem({ node }: { node: FileNode }) {
  const [open, setOpen] = useState(false);

  if (node.type === "folder") {
    return (
      <div>
        {/* Folder Row */}
        <div
          className="flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-orange-500/20 rounded-md"
          onClick={() => setOpen(!open)}
        >
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <Folder className="text-orange-400" size={16} />
          <span className="ml-1 text-sm">{node.name}</span>
        </div>

        {/* Children */}
        {open && node.children && (
          <div className="ml-5 border-l border-gray-700 pl-2">
            {node.children.map((child, i) => (
              <FileItem key={i} node={child} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // File Row
  return (
    <div className="flex items-center gap-1 px-2 py-1 ml-6 cursor-pointer hover:bg-orange-500/20 rounded-md">
      <File className="text-gray-400" size={16} />
      <span className="ml-1 text-sm">{node.name}</span>
    </div>
  );
}

export default function Explorer() {
  const [tree, setTree] = useState<FileNode | null>(null);

  useEffect(() => {
    const socket = io("http://localhost:3001");

    socket.on("fs-update", (data: FileNode) => {
      setTree(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="h-full w-full border border-neutral-800 rounded-lg overflow-hidden bg-[#0a0a0a] shadow-lg flex flex-col">
      {/* Header */}
      <div className="flex items-center h-10 bg-neutral-900 border-b border-neutral-800 px-4 text-gray-300">
        Explorer
      </div>

      {/* Scrollable Tree */}
      <div className="flex-1 overflow-y-auto p-2 scrollable">
        {tree ? (
          <FileItem node={tree} />
        ) : (
          <p className="text-gray-500 text-sm">Loading...</p>
        )}
      </div>
    </div>
  );
}
