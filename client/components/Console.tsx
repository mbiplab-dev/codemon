"use client";
import React, { useState, useRef } from "react";
import Terminal from "./Terminal";
import { Plus, X } from "lucide-react";

interface TerminalInstance {
  id: number;
}

export default function Console() {
  const [terminals, setTerminals] = useState<TerminalInstance[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const idCounterRef = useRef(0);

  const addTerminal = () => {
    setTerminals((prev) => {
      const newTerminal = { id: idCounterRef.current++ };
      const updated = [...prev, newTerminal];
      setActiveIndex(updated.length - 1); // ✅ Always set to last terminal
      return updated;
    });
  };

  const removeTerminal = (index: number) => {
    setTerminals((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length === 0) {
        setActiveIndex(null);
      } else if (activeIndex === index) {
        setActiveIndex(updated.length - 1); // ✅ Switch to last available terminal
      } else if (activeIndex !== null && activeIndex > index) {
        setActiveIndex((prevIndex) => (prevIndex ? prevIndex - 1 : null));
      }
      return updated;
    });
  };

  return (
    <div className="flex h-full w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg">
      {/* Terminal Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center justify-between bg-[#111] border-b border-neutral-800 px-2 h-8 shrink-0">
          <div className="flex space-x-2">
            {terminals.map((t, i) => (
              <div
                key={t.id}
                onClick={() => setActiveIndex(i)}
                className={`flex items-center px-3 py-2 text-sm rounded-t-lg cursor-pointer ${
                  activeIndex === i
                    ? "bg-[#1a1a1a] text-orange-400 border-b-2 border-orange-400"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <span>Terminal {t.id + 1}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTerminal(i);
                  }}
                  className="ml-2 hover:text-red-400"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addTerminal}
            className="p-2 text-gray-400 hover:text-orange-400"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Active Terminal (Scroll only here) */}
        <div className="flex-1 overflow-hidden">
          {activeIndex !== null && terminals[activeIndex] ? (
            <Terminal />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No terminal open. Click + to add one.
            </div>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-48 bg-[#111] border-l border-neutral-800 flex flex-col shrink-0">
        <div className="p-2 h-8 text-xs text-gray-400 border-b border-neutral-800">
          Terminals
        </div>
        <div className="flex-1 overflow-y-auto">
          {terminals.map((t, i) => (
            <div
              key={t.id}
              onClick={() => setActiveIndex(i)}
              className={`px-3 py-2 text-sm cursor-pointer ${
                activeIndex === i
                  ? "bg-[#1a1a1a] text-orange-400"
                  : "text-gray-400 hover:bg-[#1a1a1a]"
              }`}
            >
              Terminal {t.id + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
