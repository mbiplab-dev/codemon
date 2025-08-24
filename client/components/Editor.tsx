"use client";

import Editor from "@monaco-editor/react";
import FileTabs from "./FileTabs";
import { FileType } from "@/app/page";
import { useEffect } from "react";

type CodeEditorProps = {
  openFiles: FileType[];
  activeFile: FileType | null;
  setActiveFile: (file: FileType) => void;
  setOpenFiles: (files: FileType[]) => void;
};

export default function CodeEditor({
  openFiles,
  activeFile,
  setActiveFile,
  setOpenFiles,
}: CodeEditorProps) {
  function handleEditorMount(editor: any, monaco: any) {
    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6A9955", fontStyle: "italic" },
        { token: "keyword", foreground: "C586C0", fontStyle: "bold" },
        { token: "string", foreground: "CE9178" },
        { token: "number", foreground: "B5CEA8" },
        { token: "regexp", foreground: "D16969" },
        { token: "operator", foreground: "D4D4D4" },
        { token: "namespace", foreground: "4EC9B0" },
        { token: "type", foreground: "4EC9B0", fontStyle: "bold" },
        { token: "function", foreground: "DCDCAA" },
        { token: "variable", foreground: "9CDCFE" },
        { token: "parameter", foreground: "9CDCFE" },
        { token: "property", foreground: "9CDCFE" },
        { token: "class", foreground: "4EC9B0", fontStyle: "bold" },
      ],
      colors: {
        "editor.background": "#0a0a0a",
        "editor.foreground": "#FFFFFF",
        "editor.lineHighlightBackground": "#1f1f1f",
        "editorLineNumber.foreground": "#555555",
        "editorLineNumber.activeForeground": "#c5c5c5",
        "editorCursor.foreground": "#fb923c",
        "editor.selectionBackground": "#264F78",
        "editor.inactiveSelectionBackground": "#3A3D41",
        "editorIndentGuide.background": "#333333",
        "editorIndentGuide.activeBackground": "#707070",
        "editorBracketMatch.background": "#2a2d2e",
        "editorBracketMatch.border": "#888888",
      },
    });

    monaco.editor.setTheme("custom-dark");
  }

  // ✅ Log file content when switching tabs
  useEffect(() => {
    if (activeFile) {
      console.log("Active file content:", activeFile.content);
    }
  }, [activeFile]);

  return (
    <div className="flex flex-col w-full h-full bg-[#0a0a0a] text-white border border-neutral-800 rounded-lg shadow-lg overflow-hidden">
      {/* File Tabs */}
      <FileTabs
        openFiles={openFiles}
        activeFile={activeFile}
        setActiveFile={setActiveFile}
        setOpenFiles={setOpenFiles}
      />

      {/* Path / Breadcrumb */}
      <div className="min-h-6 px-4 flex items-center text-gray-400 text-xs bg-[#111] border-b border-neutral-800">
        {activeFile ? activeFile.path : "No file open"}
      </div>

      {/* Editor Area */}
      <div className="flex-1 bg-[#0f0f0f] text-gray-200 text-sm font-mono">
        <Editor
          key={activeFile?.path}
          height="100%"
          defaultLanguage="javascript"
          value={activeFile ? activeFile.content : ""}
          theme="custom-dark"
          onMount={handleEditorMount}
          onChange={(value) => {
            // log edits while typing
            console.log("Editing file content:", value);
          }}
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            fontLigatures: true,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            scrollBeyondLastLine: false,
            padding: { top: 12 },
            lineHeight: 22,
          }}
        />
      </div>
    </div>
  );
}
