"use client";
import { useEffect, useState } from "react";
import { Panel, PanelGroup } from "react-resizable-panels";

import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import Explorer from "@/components/Explorer";
import CodeEditor from "@/components/Editor";
import Console from "@/components/Console";
import CustomResizeHandle from "@/components/CustomResizeHandle";
import RightPanel from "@/components/RightPanel";
import ActiveUsers from "@/components/ActiveUsers";
import SearchPanel from "@/components/SearchPanel";
import ChatPanel from "@/components/ChatPanel";

export type FileType = {
  name: string;
  path: string;
  content: string;
};

export default function Page() {
  // Persist activeTab
  const [activeTab, setActiveTab] = useState<"explorer" | "users" | "search" | "chat">(
    () => (localStorage.getItem("activeTab") as "explorer" | "users" | "search" | "chat") || "explorer"
  );

  const [openFiles, setOpenFiles] = useState<FileType[]>(() => {
    const savedFiles = localStorage.getItem("openFiles");
    return savedFiles ? JSON.parse(savedFiles) : [];
  });

  const [activeFile, setActiveFile] = useState<FileType | null>(() => {
    const savedActive = localStorage.getItem("activeFile");
    return savedActive ? JSON.parse(savedActive) : null;
  });

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem("openFiles", JSON.stringify(openFiles));
  }, [openFiles]);

  useEffect(() => {
    if (activeFile) localStorage.setItem("activeFile", JSON.stringify(activeFile));
    else localStorage.removeItem("activeFile");
  }, [activeFile]);

  const handleFileClick = async (file: FileType) => {
    try {
      const res = await fetch(`http://localhost:3001/file?path=${encodeURIComponent(file.path)}`);
      const data = await res.json();
      const fileWithContent: FileType = { ...file, content: data.content };

      if (!openFiles.find((f) => f.path === file.path)) setOpenFiles((prev) => [...prev, fileWithContent]);

      setActiveFile(fileWithContent);
    } catch (err) {
      console.error("Failed to fetch file content:", err);
    }
  };

  // Get stored sizes from localStorage or fallback
  const horizontalLayout = JSON.parse(localStorage.getItem("horizontalLayout") || "[20,55,25]");
  const verticalLayout = JSON.parse(localStorage.getItem("verticalLayout") || "[70,30]");

  const handleHorizontalLayoutChange = (sizes: number[]) => {
    localStorage.setItem("horizontalLayout", JSON.stringify(sizes));
  };

  const handleVerticalLayoutChange = (sizes: number[]) => {
    localStorage.setItem("verticalLayout", JSON.stringify(sizes));
  };

  return (
    <div className="h-screen w-screen max-h-screen max-w-screen flex flex-col bg-black text-neutral-200 p-2 overflow-hidden">
      {/* Topbar */}
      <div className="h-12 mb-1 border-neutral-800 flex items-center bg-neutral-950">
        <Topbar />
      </div>

      {/* Main layout */}
      <div className="max-w-screen h-full">
        <PanelGroup direction="horizontal" onLayout={handleHorizontalLayoutChange} className="flex-1">
          {/* Sidebar */}
          <div className="w-[50px] mr-1 border-neutral-800 bg-neutral-950">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          {/* Left Panel */}
          <Panel minSize={0} maxSize={80} defaultSize={horizontalLayout[0]}>
            {activeTab === "explorer" && <Explorer onFileClick={handleFileClick} />}
            {activeTab === "users" && <ActiveUsers />}
            {activeTab === "search" && <SearchPanel />}
            {activeTab === "chat" && <ChatPanel />}
          </Panel>

          <CustomResizeHandle direction="vertical" />

          {/* Editor + Console */}
          <Panel minSize={0} defaultSize={horizontalLayout[1]}>
            <PanelGroup direction="vertical" className="h-full" onLayout={handleVerticalLayoutChange}>
              <Panel minSize={0} defaultSize={verticalLayout[0]}>
                <CodeEditor
                  openFiles={openFiles}
                  activeFile={activeFile}
                  setActiveFile={setActiveFile}
                  setOpenFiles={setOpenFiles}
                />
              </Panel>

              <CustomResizeHandle direction="horizontal" />

              <Panel minSize={0} defaultSize={verticalLayout[1]}>
                <Console />
              </Panel>
            </PanelGroup>
          </Panel>

          <CustomResizeHandle direction="vertical" />

          {/* Preview */}
          <Panel minSize={0} defaultSize={horizontalLayout[2]}>
            <RightPanel />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
