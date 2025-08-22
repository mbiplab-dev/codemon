"use client";

import Editor from "@monaco-editor/react";
import { useState } from "react";

export default function CodeEditor() {
  function handleEditorMount(editor: any, monaco: any) {
    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6A9955", fontStyle: "italic" }, // green comments
        { token: "keyword", foreground: "C586C0", fontStyle: "bold" }, // purple keywords
        { token: "string", foreground: "CE9178" }, // brown strings
        { token: "number", foreground: "B5CEA8" }, // light green numbers
        { token: "regexp", foreground: "D16969" }, // reddish regex
        { token: "operator", foreground: "D4D4D4" }, // normal operators
        { token: "namespace", foreground: "4EC9B0" },
        { token: "type", foreground: "4EC9B0", fontStyle: "bold" },
        { token: "function", foreground: "DCDCAA" }, // yellow functions
        { token: "variable", foreground: "9CDCFE" }, // blue variables
        { token: "parameter", foreground: "9CDCFE" },
        { token: "property", foreground: "9CDCFE" },
        { token: "class", foreground: "4EC9B0", fontStyle: "bold" }, // teal classes
      ],
      colors: {
        "editor.background": "#0a0a0a", // dark neutral bg
        "editor.foreground": "#FFFFFF",
        "editor.lineHighlightBackground": "#1f1f1f", // subtle but visible
        "editorLineNumber.foreground": "#555555",
        "editorLineNumber.activeForeground": "#c5c5c5",
        "editorCursor.foreground": "#FFCC00", // golden cursor
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

  const [openFiles, setOpenFiles] = useState([
    { name: "index.js", path: "/src/index.js" },
    { name: "App.jsx", path: "/src/App.jsx" },
    { name: "styles.css", path: "/src/styles.css" },
  ]);
  const [activeFile, setActiveFile] = useState(openFiles[0]);

  return (
    <div className="flex flex-col w-full h-full bg-[#0a0a0a] text-white border border-neutral-800 rounded-lg shadow-lg">
      {/* Tabs for Open Files */}
      <div className="flex items-center h-10 bg-neutral-900 border-b border-neutral-800 overflow-x-auto">
        {openFiles.map((file) => (
          <div
            key={file.name}
            className={`px-4 py-2 text-sm cursor-pointer border-r border-neutral-800 ${
              activeFile.name === file.name
                ? "bg-[#1a1a1a] text-orange-400"
                : "text-gray-300 hover:bg-[#1a1a1a]"
            }`}
            onClick={() => setActiveFile(file)}
          >
            {file.name}
          </div>
        ))}
      </div>

      {/* Path / Breadcrumb */}
      <div className="h-6 px-4 flex items-center text-gray-400 text-xs bg-[#111] border-b border-neutral-800">
        {activeFile.path}
      </div>

      {/* Editor Area */}
      <div className="flex-1 bg-[#0f0f0f] text-gray-200 text-sm font-mono ">
        <Editor
        height="100%"
        defaultLanguage="javascript"
        defaultValue={`// Start coding...\nfunction greet(name) {\n  console.log(\`Hello, \${name}\`);\n}\n\ngreet("World");`}
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
  )};
