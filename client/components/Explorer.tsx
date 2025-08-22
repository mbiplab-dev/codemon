"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Folder, File } from "lucide-react";

type FileNode = {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
};

const sampleStructure: FileNode[] = [
  {
    name: "src",
    type: "folder",
    children: [
      { name: "app", type: "folder", children: [{ name: "page.tsx", type: "file" }] },
      { name: "components", type: "folder", children: [{ name: "Console.tsx", type: "file" }] },
    ],
  },
  { name: "package.json", type: "file" },
  { name: "tsconfig.json", type: "file" },
];

function FileItem({ node }: { node: FileNode }) {
  const [open, setOpen] = useState(false);

  if (node.type === "folder") {
    return (
      <div>
        <div
          className="flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-orange-500/20 rounded-md"
          onClick={() => setOpen(!open)}
        >
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <Folder className="text-orange-400" size={16} />
          <span className="ml-1 text-sm">{node.name}</span>
        </div>
        {open && node.children && (
          <div className="ml-5 border-l border-gray-700">
            {node.children.map((child, i) => (
              <FileItem key={i} node={child} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 px-2 py-1 ml-6 cursor-pointer hover:bg-orange-500/20 rounded-md">
      <File className="text-gray-400" size={16} />
      <span className="ml-1 text-sm">{node.name}</span>
    </div>
  );
}

export default function Explorer() {
  return (
    <div className="h-full w-full border border-neutral-800 rounded-lg overflow-hidden bg-[#0a0a0a] shadow-lg">
      <div className="flex items-center h-10 bg-neutral-900 border-b border-neutral-800 p-4 text-gray-300">
        Explorer
      </div>
      {sampleStructure.map((node, i) => (
        <FileItem key={i} node={node} />
      ))}
    </div>
  );
}
