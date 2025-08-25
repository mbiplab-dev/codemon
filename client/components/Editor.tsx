"use client";

import Editor from "@monaco-editor/react";
import FileTabs from "./FileTabs";
import { FileType } from "@/app/page";
import toast from "react-hot-toast";

type CodeEditorProps = {
  openFiles: FileType[];
  activeFile: FileType | null;
  setActiveFile: (file: FileType) => void;
  setOpenFiles: React.Dispatch<React.SetStateAction<FileType[]>>; // ✅ Correct type
};

export default function CodeEditor({
  openFiles,
  activeFile,
  setActiveFile,
  setOpenFiles,
}: CodeEditorProps) {
  function handleEditorMount(editor: any, monaco: any) {
    // ✅ Define custom theme
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

    // ✅ Handle Ctrl+S (Save File)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, async () => {
      if (!activeFile) return;

      try {
        const content = editor.getValue();

        const response = await fetch("http://localhost:3001/save-file", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: activeFile.path, content }),
        });

        if (response.ok) {
          // ✅ Update state to keep UI in sync
          setActiveFile({ ...activeFile, content });
          setOpenFiles((prevFiles) =>
            prevFiles.map((file) =>
              file.path === activeFile.path ? { ...file, content } : file
            )
          );

          toast.success("File saved successfully!");
        } else {
          const err = await response.json();
          toast.error(`Error saving file: ${err.message}`);
        }
      } catch (err: any) {
        toast.error(`Error saving file: ${err.message}`);
      }
    });
  }

  return (
    <div className="flex flex-col w-full h-full bg-[#0a0a0a] text-white border border-neutral-800 rounded-lg shadow-lg overflow-hidden">
      {/* File Tabs */}
      <FileTabs
        openFiles={openFiles}
        activeFile={activeFile}
        setActiveFile={setActiveFile}
        setOpenFiles={setOpenFiles}
      />

      {/* File Path Bar */}
      <div className="min-h-6 px-4 flex items-center text-gray-400 text-xs bg-[#111] border-b border-neutral-800">
        {activeFile ? activeFile.path : "No file open"}
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 bg-[#0f0f0f] text-gray-200 text-sm font-mono">
        <Editor
          key={activeFile?.path} // Forces re-mount when file changes
          height="100%"
          defaultLanguage="javascript"
          value={activeFile ? activeFile.content : ""}
          theme="custom-dark"
          onMount={handleEditorMount}
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
