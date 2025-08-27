"use client";
import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { X, Users } from "lucide-react";
import { FileType } from "@/app/page";

type User = {
  name: string;
  color: string;
  id: string;
};

type FileTabsProps = {
  openFiles: FileType[];
  activeFile: FileType | null;
  setActiveFile: (file: FileType | null) => void;
  setOpenFiles: (files: FileType[]) => void;
  fileUsers?: Record<string, User[]>; // Users currently in each file
};

export default function FileTabs({
  openFiles,
  activeFile,
  setActiveFile,
  setOpenFiles,
  fileUsers = {},
}: FileTabsProps) {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const updated = Array.from(openFiles);
    const [moved] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, moved);
    setOpenFiles(updated);
  };

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
            className="flex items-center min-h-10 w-full bg-neutral-900 border-b border-neutral-800 overflow-x-auto"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {openFiles.map((tab, index) => {
              const usersInFile = fileUsers[tab.path] || [];
              const hasUsers = usersInFile.length > 0;
              const isActive = activeFile?.path === tab.path;
              
              return (
                <Draggable key={tab.path} draggableId={tab.path} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`group flex items-center pl-3 pr-2 py-2 text-sm cursor-pointer border-x border-neutral-800 relative min-w-0 max-w-48 ${
                        isActive
                          ? "bg-neutral-800 text-orange-400 border-b-2 border-b-orange-500"
                          : "text-gray-300 hover:bg-[#1a1a1a]"
                      } ${snapshot.isDragging ? "shadow-lg bg-neutral-800 z-50" : ""}`}
                      onClick={() => setActiveFile(tab)}
                    >
                      {/* File name */}
                      <span className="truncate flex-1 mr-1">{tab.name}</span>

                      {/* User presence indicators */}
                      {hasUsers && (
                        <div className="flex items-center space-x-0.5 mr-2 flex-shrink-0">
                          {usersInFile.slice(0, 3).map((user, i) => (
                            <div
                              key={user.id}
                              className="relative group/dot"
                              style={{ zIndex: usersInFile.length - i + 10 }}
                            >
                              <div
                                className="w-2.5 h-2.5 rounded-full border border-neutral-700 animate-pulse flex-shrink-0"
                                style={{ 
                                  backgroundColor: user.color,
                                  boxShadow: `0 0 4px ${user.color}40`
                                }}
                              />
                              {/* User tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-800 text-white text-xs rounded opacity-0 group-hover/dot:opacity-100 transition-opacity duration-200 whitespace-nowrap border border-neutral-600 z-50 pointer-events-none">
                                {user.name}
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-neutral-600"></div>
                              </div>
                            </div>
                          ))}
                          
                          {/* Overflow indicator for more than 3 users */}
                          {usersInFile.length > 3 && (
                            <div className="relative group/overflow">
                              <div className="w-2.5 h-2.5 rounded-full bg-neutral-600 border border-neutral-700 flex items-center justify-center flex-shrink-0">
                                <span className="text-[6px] text-white font-bold leading-none">+</span>
                              </div>
                              {/* Overflow tooltip */}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-800 text-white text-xs rounded opacity-0 group-hover/overflow:opacity-100 transition-opacity duration-200 whitespace-nowrap border border-neutral-600 z-50 pointer-events-none">
                                +{usersInFile.length - 3} more users
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-neutral-600"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Close button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClose(tab);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-0.5 text-gray-300 hover:text-red-400 flex-shrink-0 ml-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      {/* Active file with users indicator */}
                      {hasUsers && isActive && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 flex-shrink-0">
                          <div className="absolute inset-0 bg-orange-400 rounded-full animate-ping opacity-75"></div>
                          <div className="relative w-2 h-2 bg-orange-500 rounded-full"></div>
                        </div>
                      )}

                      {/* Collaboration indicator */}
                      {hasUsers && (
                        <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2">
                          <Users className="w-2.5 h-2.5 text-blue-400 opacity-60" />
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}