"use client";
import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { X } from "lucide-react";
import { FileType } from "@/app/page";

type FileTabsProps = {
  openFiles: FileType[];
  activeFile: FileType | null;
  setActiveFile: (file: FileType | null) => void;
  setOpenFiles: (files: FileType[]) => void;
};

export default function FileTabs({
  openFiles,
  activeFile,
  setActiveFile,
  setOpenFiles,
}: FileTabsProps) {
  // Drag end reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const updated = Array.from(openFiles);
    const [moved] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, moved);
    setOpenFiles(updated);
  };

  // Close tab
  const handleClose = (file: FileType) => {
    const updated = openFiles.filter((f) => f.path !== file.path);
    setOpenFiles(updated);

    if (activeFile?.path === file.path) {
      setActiveFile(updated.length > 0 ? updated[updated.length - 1] : null);
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="tabs" direction="horizontal">
        {(provided) => (
          <div
            className="flex items-center min-h-10 w-full bg-neutral-900 border-b border-neutral-800"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {openFiles.map((tab, index) => (
              <Draggable key={tab.path} draggableId={tab.path} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`group flex items-center pl-2 pr-1 py-2 text-sm cursor-pointer border-x border-neutral-800 ${
                      activeFile?.path === tab.path
                        ? "bg-neutral-800 text-orange-400 border-b-2 border-b-orange-500"
                        : "text-gray-300 hover:bg-[#1a1a1a]"
                    } ${snapshot.isDragging ? "shadow-lg bg-neutral-800" : ""}`}
                    onClick={() => setActiveFile(tab)}
                  >
                    <span>{tab.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClose(tab);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pl-1 text-gray-300 hover:text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
