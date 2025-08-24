"use client";
import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { X } from "lucide-react";

const FileTabs = () => {
  const [tabs, setTabs] = useState([
    { id: "1", name: "index.html" },
    { id: "2", name: "style.css" },
    { id: "3", name: "script.js" },
  ]);

  const [activeTab, setActiveTab] = useState("1");

  // Handle drag end
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const updatedTabs = Array.from(tabs);
    const [movedTab] = updatedTabs.splice(result.source.index, 1);
    updatedTabs.splice(result.destination.index, 0, movedTab);

    setTabs(updatedTabs);
  };

  // Handle tab close
  const handleClose = (id) => {
    const updatedTabs = tabs.filter((tab) => tab.id !== id);
    setTabs(updatedTabs);

    // If the active tab is closed, set first tab as active
    if (activeTab === id && updatedTabs.length > 0) {
      setActiveTab(updatedTabs[0].id);
    }
  };

  return (
    <div className="">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tabs" direction="horizontal">
          {(provided) => (
            <div
              className="flex items-center min-h-10 w-full bg-neutral-900 border-b border-neutral-800"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {tabs.map((tab, index) => (
                <Draggable key={tab.id} draggableId={tab.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`group flex items-center pl-2 pr-1 py-2 text-sm cursor-pointer border-x border-neutral-800 ${
                        activeTab === tab.id
                          ? "bg-neutral-800 text-orange-400 border-b-2 border-b-orange-500"
                          : "text-gray-300 hover:bg-[#1a1a1a]"
                      } ${
                        snapshot.isDragging ? "shadow-lg bg-neutral-800" : ""
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <span>{tab.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClose(tab.id);
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
    </div>
  );
};

export default FileTabs;
