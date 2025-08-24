"use client";
import { useState } from "react";
import { Panel, PanelGroup } from "react-resizable-panels";

import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import Explorer from "@/components/Explorer";
import CodeEditor from "@/components/Editor";
import Console from "@/components/Console";
import CustomResizeHandle from "@/components/CustomResizeHandle";
import RightPanel from "@/components/RightPanel";
import ActiveUsers from "@/components/ActiveUsers";

export type FileType = {
  name: string;
  path: string;
  content: string;
};

export default function Page() {
  const [openFiles, setOpenFiles] = useState<FileType[]>([]);
  const [activeFile, setActiveFile] = useState<FileType | null>(null);

  // ✅ Fetch file content from backend when clicking a file
  const handleFileClick = async (file: FileType) => {
    try {
      const res = await fetch(`http://localhost:3001/file?path=${encodeURIComponent(file.path)}`);
      const data = await res.json();

      const fileWithContent: FileType = {
        ...file,
        content: data.content, // assume backend returns { content: "..." }
      };

      if (!openFiles.find(f => f.path === file.path)) {
        setOpenFiles(prev => [...prev, fileWithContent]);
      }

      setActiveFile(fileWithContent);
    } catch (err) {
      console.error("Failed to fetch file content:", err);
    }
  };

  return (
    <div className="h-screen w-screen max-h-screen max-w-screen flex flex-col bg-black text-neutral-200 p-2 overflow-hidden">
      {/* Topbar */}
      <div className="h-12 mb-1 border-neutral-800 flex items-center bg-neutral-950">
        <Topbar />
      </div>

      {/* Main layout */}
      <div className="max-w-screen h-full">
        <PanelGroup direction="horizontal" className="flex-1">
          {/* Sidebar */}
          <div className="w-[50px] mr-1 border-neutral-800 bg-neutral-950">
            <Sidebar />
          </div>

          {/* Explorer + Active Users Panel */}
          <Panel
            defaultSize={15}
            minSize={0}
            maxSize={80}
            className="bg-neutral-950 border-neutral-800"
          >
            <PanelGroup direction="vertical" className="h-full">
              <Panel defaultSize={90} minSize={50} className="bg-neutral-950">
                <Explorer onFileClick={handleFileClick} />
              </Panel>

              <CustomResizeHandle direction="horizontal" />

              <Panel defaultSize={10} minSize={10} maxSize={50}>
                <ActiveUsers />
              </Panel>
            </PanelGroup>
          </Panel>

          <CustomResizeHandle direction="vertical" />

          {/* Editor + Console */}
          <Panel
            defaultSize={60}
            minSize={15}
            className="bg-neutral-950 border-neutral-800"
          >
            <PanelGroup direction="vertical" className="h-full">
              <Panel defaultSize={70} minSize={20} className="bg-neutral-950">
                <CodeEditor
                  openFiles={openFiles}
                  activeFile={activeFile}
                  setActiveFile={setActiveFile}
                  setOpenFiles={setOpenFiles}
                />
              </Panel>

              <CustomResizeHandle direction="horizontal" />

              <Panel
                defaultSize={30}
                minSize={15}
                maxSize={80}
                className="bg-neutral-950 border-neutral-800"
              >
                <Console />
              </Panel>
            </PanelGroup>
          </Panel>

          <CustomResizeHandle direction="vertical" />

          {/* Preview */}
          <Panel
            defaultSize={25}
            minSize={0}
            maxSize={80}
            className="bg-neutral-950 h-full"
          >
            <RightPanel />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
