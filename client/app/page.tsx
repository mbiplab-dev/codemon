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
  // ✅ Initialize with defaults (SSR safe)
  const [activeTab, setActiveTab] = useState<"explorer" | "users" | "search" | "chat">("explorer");
  const [openFiles, setOpenFiles] = useState<FileType[]>([]);
  const [activeFile, setActiveFile] = useState<FileType | null>(null);
  const [horizontalLayout, setHorizontalLayout] = useState<number[]>([20, 55, 25]);
  const [verticalLayout, setVerticalLayout] = useState<number[]>([70, 30]);
  const [isLoaded, setIsLoaded] = useState(false);

  // ✅ Load values from localStorage after mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTab = localStorage.getItem("activeTab");
      if (savedTab) setActiveTab(savedTab as any);

      const savedFiles = localStorage.getItem("openFiles");
      if (savedFiles) setOpenFiles(JSON.parse(savedFiles));

      const savedActive = localStorage.getItem("activeFile");
      if (savedActive) setActiveFile(JSON.parse(savedActive));

      const hLayout = localStorage.getItem("horizontalLayout");
      if (hLayout) setHorizontalLayout(JSON.parse(hLayout));

      const vLayout = localStorage.getItem("verticalLayout");
      if (vLayout) setVerticalLayout(JSON.parse(vLayout));

      setIsLoaded(true);
    }
  }, []);

  // ✅ Save changes to localStorage
  useEffect(() => {
    if (isLoaded) localStorage.setItem("activeTab", activeTab);
  }, [activeTab, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem("openFiles", JSON.stringify(openFiles));
  }, [openFiles, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      if (activeFile) localStorage.setItem("activeFile", JSON.stringify(activeFile));
      else localStorage.removeItem("activeFile");
    }
  }, [activeFile, isLoaded]);

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

  const handleHorizontalLayoutChange = (sizes: number[]) => {
    setHorizontalLayout(sizes);
    if (isLoaded) localStorage.setItem("horizontalLayout", JSON.stringify(sizes));
  };

  const handleVerticalLayoutChange = (sizes: number[]) => {
    setVerticalLayout(sizes);
    if (isLoaded) localStorage.setItem("verticalLayout", JSON.stringify(sizes));
  };

  if (!isLoaded) {
    return <div className="h-screen w-screen bg-black" />; // Prevent hydration mismatch
  }

  return (
    <div className="h-screen w-screen max-h-screen max-w-screen flex flex-col bg-black text-neutral-200 p-2 overflow-hidden">
      {/* Topbar */}
      <div className="h-12 mb-1 border-neutral-800 flex items-center bg-neutral-950">
        <Topbar />
      </div>

      {/* Main layout */}
      <div className="max-w-screen h-full">
        <PanelGroup
          direction="horizontal"
          layout={horizontalLayout}
          onLayout={handleHorizontalLayoutChange}
          className="flex-1"
        >
          {/* Sidebar */}
          <div className="w-[50px] mr-1 border-neutral-800 bg-neutral-950">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          {/* Left Panel */}
          <Panel minSize={0} maxSize={80} defaultSize={horizontalLayout[0]}>
            <PanelGroup direction="vertical" className="h-full">
              <Panel minSize={100} defaultSize={100}>
                {activeTab === "explorer" && <Explorer onFileClick={handleFileClick} />}
                {activeTab === "users" && <ActiveUsers />}
                {activeTab === "search" && <SearchPanel />}
                {activeTab === "chat" && <ChatPanel />}
              </Panel>
              <Panel maxSize={0} defaultSize={0}></Panel>
            </PanelGroup>
          </Panel>

          <CustomResizeHandle direction="vertical" />

          {/* Editor + Console */}
          <Panel minSize={20} defaultSize={horizontalLayout[1]}>
            <PanelGroup
              direction="vertical"
              layout={verticalLayout}
              onLayout={handleVerticalLayoutChange}
              className="h-full"
            >
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
            <PanelGroup direction="vertical" className="h-full">
              <Panel minSize={100} defaultSize={100}>
                <RightPanel />
              </Panel>
              <Panel maxSize={0} defaultSize={0}></Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
