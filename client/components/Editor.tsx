"use client";

import {
  useRoom,
  useOthers,
  useSelf,
  useUpdateMyPresence,
} from "@liveblocks/react/suspense";
import { getYjsProviderForRoom } from "@liveblocks/yjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Editor } from "@monaco-editor/react";
import type { editor as MonacoEditor } from "monaco-editor";
import { Awareness } from "y-protocols/awareness";
import { Cursors } from "./Cursors";
import FileTabs from "./FileTabs";
import type { FileType } from "@/app/page";
// @ts-ignore - y-monaco has no bundled types
import { MonacoBinding } from "y-monaco";
import toast from "react-hot-toast";

type Props = {
  openFiles: FileType[];
  activeFile: FileType | null;
  setActiveFile: (file: FileType | null) => void;
  setOpenFiles: (files: FileType[]) => void;
};

export default function CollaborativeEditor({
  openFiles,
  activeFile,
  setActiveFile,
  setOpenFiles,
}: Props) {
  const room = useRoom();
  const provider = getYjsProviderForRoom(room);
  const others = useOthers();
  const self = useSelf();
  const updateMyPresence = useUpdateMyPresence();

  const [editorRef, setEditorRef] =
    useState<MonacoEditor.IStandaloneCodeEditor>();
  const monacoRef = useRef<any>(null);

  // Keep Monaco models in a ref map to avoid stale state and to dispose properly.
  const modelMapRef = useRef<Record<string, MonacoEditor.ITextModel>>({});
  // Track current Yjs<->Monaco binding
  const bindingRef = useRef<any>(null);
  // Track cursor positions per file (so switching files restores the last position)
  const cursorPositionsRef = useRef<Record<string, MonacoEditor.IPosition>>({});
  // Track which files have been initialized with content
  const initializedFilesRef = useRef<Set<string>>(new Set());

  // Group users by file for FileTabs presence dots
  const fileUsers = useMemo(() => {
    const map: Record<
      string,
      Array<{ id: string; name: string; color: string }>
    > = {};
    others.forEach((other) => {
      if (other.info && other.presence?.currentFile) {
        const user = other.info as { id: string; name: string; color: string };
        const filePath = String(other.presence.currentFile);
        if (!map[filePath]) map[filePath] = [];
        map[filePath].push(user);
      }
    });
    return map;
  }, [others]);

  // Dispose a model by file path (and remove from map)
  const disposeModel = useCallback((path: string) => {
    const existing = modelMapRef.current[path];
    if (existing) {
      try {
        existing.dispose();
      } catch {}
      delete modelMapRef.current[path];
    }
    // Also remove from initialized files
    initializedFilesRef.current.delete(path);
  }, []);

  // Cleanup binding helper
  const destroyBinding = useCallback(() => {
    if (bindingRef.current) {
      try {
        bindingRef.current.destroy();
      } catch {}
      bindingRef.current = null;
    }
  }, []);

  // When openFiles changes, dispose models whose files were closed
  useEffect(() => {
    const openPaths = new Set(openFiles.map((f) => f.path));
    Object.keys(modelMapRef.current).forEach((path) => {
      if (!openPaths.has(path)) {
        // If we closed the active file, binding will be replaced elsewhere;
        // but safe to destroy binding here if it targeted this model.
        if (activeFile?.path === path) {
          destroyBinding();
        }
        disposeModel(path);
      }
    });
  }, [openFiles, activeFile?.path, disposeModel, destroyBinding]);

  // Update presence when active file changes
  useEffect(() => {
    if (activeFile) {
      updateMyPresence({
        currentFile: activeFile.path,
        timestamp: Date.now(),
      });
    }
  }, [activeFile, updateMyPresence]);

  // Update presence with cursor position/selection
  useEffect(() => {
    if (!editorRef) return;

    const updateCursorPresence = () => {
      const position = editorRef.getPosition();
      const selection = editorRef.getSelection();

      if (position && activeFile) {
        // Remember last cursor position for this file
        cursorPositionsRef.current[activeFile.path] = { ...position };

        updateMyPresence({
          currentFile: activeFile.path,
          cursor: {
            position: {
              lineNumber: position.lineNumber,
              column: position.column,
            },
            selection: selection
              ? {
                  startLineNumber: selection.startLineNumber,
                  startColumn: selection.startColumn,
                  endLineNumber: selection.endLineNumber,
                  endColumn: selection.endColumn,
                }
              : null,
          },
          timestamp: Date.now(),
        });
      }
    };

    const d1 = editorRef.onDidChangeCursorPosition(updateCursorPresence);
    const d2 = editorRef.onDidChangeCursorSelection(updateCursorPresence);

    return () => {
      d1.dispose();
      d2.dispose();
    };
  }, [editorRef, activeFile, updateMyPresence]);

  // Create or reuse a Monaco model for the given file
  const ensureModelForFile = useCallback(async (file: FileType) => {
    if (!monacoRef.current) return null;
    const monaco = monacoRef.current as typeof import("monaco-editor");

    // Reuse existing model
    if (modelMapRef.current[file.path]) {
      return modelMapRef.current[file.path];
    }

    // Create a fresh model with the file's content as initial value
    // This is important for new files that haven't been synced yet
    const initialContent = file.content || "";
    const model = monaco.editor.createModel(
      initialContent,
      file.language || "plaintext"
    );
    modelMapRef.current[file.path] = model;
    return model;
  }, []);

  // Initialize Yjs text with file content if needed
  const initializeYjsText = useCallback((yText: any, file: FileType) => {
    const fileKey = file.path;

    // Skip if already initialized
    if (initializedFilesRef.current.has(fileKey)) {
      return;
    }

    // Only initialize if Yjs text is empty AND we have file content
    if (yText.length === 0 && file.content && file.content.trim() !== "") {
      try {
        yText.insert(0, file.content);
        console.log(
          `Initialized Yjs text for ${file.path} with content length: ${file.content.length}`
        );
      } catch (error) {
        console.error(`Failed to initialize Yjs text for ${file.path}:`, error);
      }
    }

    // Mark as initialized regardless to avoid repeated attempts
    initializedFilesRef.current.add(fileKey);
  }, []);

  useEffect(() => {
    if (!editorRef || !activeFile) return;

    const handleSaveShortcut = async (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();

        try {
          const content = editorRef.getValue();
          const response = await fetch("http://localhost:3001/save-file", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              path: activeFile.path,
              content,
            }),
          });

          const data = await response.json();
          if (response.ok) {
            toast.success(`✅ File saved: ${data.path}`);
          } else {
            toast.error(`❌ Failed to save: ${data.message}`);
          }
        } catch (error) {
          toast.error("Error saving file:"+ error);
        }
      }
    };

    window.addEventListener("keydown", handleSaveShortcut);
    return () => window.removeEventListener("keydown", handleSaveShortcut);
  }, [editorRef, activeFile]);

  // Core: switch the editor to the active file's model and (re)bind Yjs
  useEffect(() => {
    const run = async () => {
      if (!editorRef || !activeFile || !provider) return;
      if (!monacoRef.current) return;

      const monaco = monacoRef.current as typeof import("monaco-editor");

      // Destroy any previous binding before switching
      destroyBinding();

      // Ensure we have a model
      const model = await ensureModelForFile(activeFile);
      if (!model) return;

      // Prepare Yjs text
      const yTextKey = `file:${activeFile.path}`;
      const yText = provider.getYDoc().getText(yTextKey);

      // Initialize Yjs text if needed
      initializeYjsText(yText, activeFile);

      // Switch editor to this model
      editorRef.setModel(model);

      // Wait a bit for the model to be properly set
      await new Promise((resolve) => setTimeout(resolve, 50));

      try {
        // Bind Yjs <-> Monaco
        bindingRef.current = new MonacoBinding(
          yText,
          model,
          new Set([editorRef]),
          provider.awareness as unknown as Awareness
        );

        console.log(`Created binding for file: ${activeFile.path}`);

        // Restore cursor if we have it
        const lastPos = cursorPositionsRef.current[activeFile.path];
        if (lastPos) {
          try {
            editorRef.setPosition(lastPos);
            editorRef.revealPositionInCenter(lastPos);
          } catch (error) {
            console.warn("Failed to restore cursor position:", error);
          }
        } else {
          // Otherwise place at start (avoid jumping to end for multi-user sessions)
          editorRef.setPosition({ lineNumber: 1, column: 1 });
        }

        // Force a layout update to ensure content is displayed
        editorRef.layout();
      } catch (error) {
        console.error("Failed to create Monaco binding:", error);

        // Fallback: if binding fails, at least show the content
        if (activeFile.content && model.getValue() !== activeFile.content) {
          model.setValue(activeFile.content);
        }
      }
    };

    run();

    return () => {
      // We only destroy binding on switch/unmount here.
      destroyBinding();
    };
  }, [
    editorRef,
    activeFile,
    provider,
    ensureModelForFile,
    destroyBinding,
    initializeYjsText,
  ]);

  // Handle file content updates from external sources (like file system changes)
  useEffect(() => {
    if (!activeFile || !editorRef || !provider) return;

    const model = modelMapRef.current[activeFile.path];
    if (!model) return;

    // If the file content has been updated externally and doesn't match the model
    if (activeFile.content && model.getValue() !== activeFile.content) {
      const yTextKey = `file:${activeFile.path}`;
      const yText = provider.getYDoc().getText(yTextKey);

      // Update Yjs text if it's different
      if (yText.toString() !== activeFile.content) {
        try {
          // Clear and reset the Yjs text
          if (yText.length > 0) {
            yText.delete(0, yText.length);
          }
          yText.insert(0, activeFile.content);
          console.log(`Updated Yjs text for ${activeFile.path}`);
        } catch (error) {
          console.error(
            `Failed to update Yjs text for ${activeFile.path}:`,
            error
          );
        }
      }
    }
  }, [activeFile, editorRef, provider]);

  const handleOnMount = useCallback(
    (editorInstance: MonacoEditor.IStandaloneCodeEditor, monaco: any) => {
      try {
        monacoRef.current = monaco;

        // Theme
        monaco.editor.defineTheme("collaborative-dark", {
          base: "vs-dark",
          inherit: true,
          rules: [
            { token: "comment", foreground: "6A9955", fontStyle: "italic" },
            { token: "keyword", foreground: "C586C0", fontStyle: "bold" },
            { token: "string", foreground: "CE9178" },
            { token: "number", foreground: "B5CEA8" },
          ],
          colors: {
            "editor.background": "#0a0a0a",
            "editor.foreground": "#FFFFFF",
            "editor.lineHighlightBackground": "#1f1f1f",
            "editorLineNumber.foreground": "#555555",
            "editorLineNumber.activeForeground": "#c5c5c5",
            "editorCursor.foreground": "#fb923c",
            "editor.selectionBackground": "#264F78",
          },
        });
        monaco.editor.setTheme("collaborative-dark");

        // TS/JS defaults
        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
          target: monaco.languages.typescript.ScriptTarget.ES2020,
          allowNonTsExtensions: true,
          moduleResolution:
            monaco.languages.typescript.ModuleResolutionKind.NodeJs,
          module: monaco.languages.typescript.ModuleKind.CommonJS,
          noEmit: true,
          esModuleInterop: true,
          jsx: monaco.languages.typescript.JsxEmit.React,
          reactNamespace: "React",
          allowJs: true,
          typeRoots: ["node_modules/@types"],
        });
        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
          target: monaco.languages.typescript.ScriptTarget.ES2020,
          allowNonTsExtensions: true,
          moduleResolution:
            monaco.languages.typescript.ModuleResolutionKind.NodeJs,
          module: monaco.languages.typescript.ModuleKind.CommonJS,
          noEmit: true,
          allowJs: true,
          jsx: monaco.languages.typescript.JsxEmit.React,
        });
        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false,
          onlyVisible: true,
        });

        setEditorRef(editorInstance);
      } catch (e) {
        console.error("Error setting up Monaco editor:", e);
        setEditorRef(editorInstance);
      }
    },
    []
  );

  // Dispose EVERYTHING on unmount
  useEffect(() => {
    return () => {
      destroyBinding();
      Object.keys(modelMapRef.current).forEach((p) => disposeModel(p));
      initializedFilesRef.current.clear();
      // Editor will be disposed by monaco-react internally when component unmounts
    };
  }, [destroyBinding, disposeModel]);

  return (
    <div className="h-full w-full flex flex-col bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden">
      {/* Render cursors for collaborative editing */}
      {provider && editorRef && (
        <Cursors yProvider={provider} editor={editorRef} />
      )}

      {/* File tabs with user presence indicators */}
      <FileTabs
        openFiles={openFiles}
        activeFile={activeFile}
        setActiveFile={setActiveFile}
        setOpenFiles={setOpenFiles}
        fileUsers={fileUsers}
      />

      {/* File path bar */}
      <div className="min-h-6 px-4 py-1 flex items-center justify-between text-gray-400 text-xs bg-neutral-900 border-b border-neutral-800">
        <span>{activeFile ? activeFile.path : "No file open"}</span>
        {activeFile && fileUsers[activeFile.path] && (
          <div className="flex items-center gap-1">
            <span className="text-neutral-500">
              {fileUsers[activeFile.path].length + 1} user
              {fileUsers[activeFile.path].length !== 0 ? "s" : ""} editing
            </span>
            <div className="flex -space-x-1">
              {self?.info && (
                <div
                  className="w-4 h-4 rounded-full border border-neutral-700"
                  style={{ backgroundColor: (self.info as any).color }}
                  title={`${(self.info as any).name} (You)`}
                />
              )}
              {fileUsers[activeFile.path].slice(0, 3).map((user) => (
                <div
                  key={user.id}
                  className="w-4 h-4 rounded-full border border-neutral-700"
                  style={{ backgroundColor: user.color }}
                  title={user.name}
                />
              ))}
              {fileUsers[activeFile.path].length > 3 && (
                <div className="w-4 h-4 rounded-full bg-neutral-600 border border-neutral-700 flex items-center justify-center">
                  <span className="text-[8px] text-white font-bold">
                    +{fileUsers[activeFile.path].length - 3}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        {activeFile ? (
          <Editor
            onMount={handleOnMount}
            height="100%"
            width="100%"
            theme="collaborative-dark"
            options={{
              tabSize: 2,
              padding: { top: 20 },
              automaticLayout: true,
              minimap: { enabled: true },
              fontSize: 14,
              fontLigatures: true,
              smoothScrolling: true,
              cursorBlinking: "smooth",
              scrollBeyondLastLine: false,
              lineHeight: 22,
              scrollbar: {
                vertical: "visible",
                horizontal: "visible",
              },
              wordWrap: "on",
              rulers: [80, 120],
              quickSuggestions: {
                other: true,
                comments: true,
                strings: true,
              },
              parameterHints: { enabled: true },
              suggestOnTriggerCharacters: true,
              acceptSuggestionOnEnter: "on",
              tabCompletion: "on",
              formatOnPaste: true,
              formatOnType: false,
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <div className="text-lg mb-2">Welcome to codemon</div>
              <div className="text-sm">Open a file to start coding</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
