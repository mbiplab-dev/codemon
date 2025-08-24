"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type File = {
  path: string;
  name: string;
  content: string;
};

type FileContextType = {
  openFiles: File[];
  activeFile: File | null;
  openFile: (file: File) => void;
  closeFile: (path: string) => void;
  setActiveFile: (path: string) => void;
  updateFileContent: (path: string, content: string) => void;
};

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({ children }: { children: ReactNode }) {
  const [openFiles, setOpenFiles] = useState<File[]>([]);
  const [activeFile, setActiveFileState] = useState<File | null>(null);

  const openFile = (file: File) => {
    setOpenFiles((prev) => {
      if (!prev.find((f) => f.path === file.path)) {
        return [...prev, file];
      }
      return prev;
    });
    setActiveFileState(file);
  };

  const closeFile = (path: string) => {
    setOpenFiles((prev) => {
      const filtered = prev.filter((f) => f.path !== path);
      if (activeFile?.path === path) {
        setActiveFileState(filtered.length > 0 ? filtered[0] : null);
      }
      return filtered;
    });
  };

  const setActiveFile = (path: string) => {
    const file = openFiles.find((f) => f.path === path) || null;
    setActiveFileState(file);
  };

  const updateFileContent = (path: string, content: string) => {
    setOpenFiles((prev) =>
      prev.map((f) => (f.path === path ? { ...f, content } : f))
    );
    if (activeFile?.path === path) {
      setActiveFileState({ ...activeFile, content });
    }
  };

  return (
    <FileContext.Provider
      value={{
        openFiles,
        activeFile,
        openFile,
        closeFile,
        setActiveFile,
        updateFileContent,
      }}
    >
      {children}
    </FileContext.Provider>
  );
}

export const useFileContext = () => {
  const ctx = useContext(FileContext);
  if (!ctx) throw new Error("useFileContext must be used within FileProvider");
  return ctx;
};
