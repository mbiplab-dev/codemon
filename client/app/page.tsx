"use client";
import { useEffect, useState } from "react";
import { Panel, PanelGroup } from "react-resizable-panels";

import Topbar from "@/components/Topbar";
import Sidebar from "@/components/Sidebar";
import Explorer from "@/components/Explorer";
import CollaborativeEditor from "@/components/Editor";
import Console from "@/components/Console";
import CustomResizeHandle from "@/components/CustomResizeHandle";
import RightPanel from "@/components/RightPanel";
import ActiveUsers from "@/components/ActiveUsers";
import SearchPanel from "@/components/SearchPanel";
import ChatPanel from "@/components/ChatPanel";

import { LiveblocksProvider, RoomProvider } from "@liveblocks/react/suspense";
import { ClientSideSuspense } from "@liveblocks/react";

export type FileType = {
  name: string;
  path: string;
  content: string;
  language?: string;
};

// Room wrapper component
function Room({ children }: { children: React.ReactNode }) {
  const roomId = `code-editor-${
    window.location.pathname.replace(/\//g, "-") || "main"
  }`;

  return (
    <RoomProvider
      id={roomId}
      initialPresence={{
        cursor: null,
        currentFile: null,
        timestamp: Date.now(),
      }}
    >
      <ClientSideSuspense
        fallback={
          <div className="h-screen w-screen max-h-screen max-w-screen bg-neutral-950 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Full-width loader at top */}
            <div className="absolute top-0 left-0 w-full h-1 bg-neutral-800">
              <div className="h-full bg-orange-500 animate-loader"></div>
            </div>

            {/* Bottom-right text */}
            <div className="absolute bottom-4 right-6 text-neutral-400 text-sm tracking-wide">
              Setting up <span className="font-semibold">CODEMON IDE...</span>
            </div>l
          </div>
        }
      >
        {children}
      </ClientSideSuspense>
    </RoomProvider>
  );
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<
    "explorer" | "users" | "search" | "chat"
  >("explorer");
  const [openFiles, setOpenFiles] = useState<FileType[]>([]);
  const [activeFile, setActiveFile] = useState<FileType | null>(null);
  const [horizontalLayout, setHorizontalLayout] = useState<number[]>([
    20, 55, 25,
  ]);
  const [verticalLayout, setVerticalLayout] = useState<number[]>([70, 30]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load values from localStorage after mount
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

  // Save changes to localStorage
  useEffect(() => {
    if (isLoaded) localStorage.setItem("activeTab", activeTab);
  }, [activeTab, isLoaded]);

  useEffect(() => {
    if (isLoaded) localStorage.setItem("openFiles", JSON.stringify(openFiles));
  }, [openFiles, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      if (activeFile)
        localStorage.setItem("activeFile", JSON.stringify(activeFile));
      else localStorage.removeItem("activeFile");
    }
  }, [activeFile, isLoaded]);

  const handleFileClick = async (file: FileType) => {
    try {
      // Show loading state
      const loadingFile: FileType = {
        ...file,
        content: "// Loading file...",
        language: "plaintext",
      };

      // Update UI immediately with loading state
      setActiveFile(loadingFile);

      if (!openFiles.find((f) => f.path === file.path)) {
        setOpenFiles((prev) => [...prev, loadingFile]);
      }

      const res = await fetch(
        `http://localhost:3001/file?path=${encodeURIComponent(file.path)}`
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      // Detect language based on file extension
      const extension = file.name.split(".").pop()?.toLowerCase();
      const languageMap: Record<string, string> = {
        js: "javascript",
        jsx: "javascript",
        ts: "typescript",
        tsx: "typescript",
        py: "python",
        html: "html",
        css: "css",
        scss: "scss",
        sass: "scss",
        less: "less",
        json: "json",
        md: "markdown",
        markdown: "markdown",
        yaml: "yaml",
        yml: "yaml",
        xml: "xml",
        php: "php",
        java: "java",
        c: "c",
        cpp: "cpp",
        cc: "cpp",
        cxx: "cpp",
        h: "c",
        hpp: "cpp",
        go: "go",
        rs: "rust",
        rb: "ruby",
        sh: "shell",
        bash: "shell",
        zsh: "shell",
        fish: "shell",
        sql: "sql",
        vue: "html",
        svelte: "html",
        dockerfile: "dockerfile",
        Dockerfile: "dockerfile",
        makefile: "makefile",
        Makefile: "makefile",
        r: "r",
        R: "r",
        swift: "swift",
        kt: "kotlin",
        scala: "scala",
        clj: "clojure",
        pl: "perl",
        lua: "lua",
        dart: "dart",
      };

      const language = extension
        ? languageMap[extension] || "plaintext"
        : "plaintext";

      // Ensure content is a string and handle various data types
      let content = "";
      if (typeof data.content === "string") {
        content = data.content;
      } else if (data.content !== null && data.content !== undefined) {
        content = String(data.content);
      } else {
        content = "// Empty file or could not load content";
      }

      const fileWithContent: FileType = {
        ...file,
        content: content,
        language: language,
      };

      // Update the files list
      setOpenFiles((prev) =>
        prev.map((f) => (f.path === file.path ? fileWithContent : f))
      );

      // Set as active file
      setActiveFile(fileWithContent);
    } catch (err) {
      console.error("Failed to fetch file content:", err);

      // Show error state
      const errorFile: FileType = {
        ...file,
        content: `// Error loading file: ${
          err instanceof Error ? err.message : "Unknown error"
        }\n// Please check if the file exists and is accessible.`,
        language: "plaintext",
      };

      setOpenFiles((prev) =>
        prev.map((f) => (f.path === file.path ? errorFile : f))
      );
      setActiveFile(errorFile);
    }
  };

  const handleHorizontalLayoutChange = (sizes: number[]) => {
    setHorizontalLayout(sizes);
    if (isLoaded)
      localStorage.setItem("horizontalLayout", JSON.stringify(sizes));
  };

  const handleVerticalLayoutChange = (sizes: number[]) => {
    setVerticalLayout(sizes);
    if (isLoaded) localStorage.setItem("verticalLayout", JSON.stringify(sizes));
  };

  if (!isLoaded) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <Room>
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
                    {activeTab === "explorer" && (
                      <Explorer onFileClick={handleFileClick} />
                    )}
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
                    <CollaborativeEditor
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
      </Room>
    </LiveblocksProvider>
  );
}
