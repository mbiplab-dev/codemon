"use client";
import React, { useState, useEffect } from "react";
import Terminal from "./Terminal";
import { Plus, X } from "lucide-react";

interface TerminalInstance {
  id: string;
}

interface ConsoleState {
  terminals: TerminalInstance[];
  activeIndex: number | null;
}

export default function Console() {
  const [state, setState] = useState<ConsoleState>({
    terminals: [],
    activeIndex: null,
  });

  // ✅ Restore terminals from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("consoleState");
    if (savedState) {
      setState(JSON.parse(savedState));
    }
  }, []);

  // ✅ Persist terminals whenever state changes
  useEffect(() => {
    localStorage.setItem("consoleState", JSON.stringify(state));
  }, [state]);

  const addTerminal = () => {
    setState((prev) => {
      const newTerminal = { id: crypto.randomUUID() };
      const terminals = [...prev.terminals, newTerminal];
      return { terminals, activeIndex: terminals.length - 1 };
    });
  };

  const removeTerminal = (index: number) => {
    setState((prev) => {
      const terminals = prev.terminals.filter((_, i) => i !== index);
      let activeIndex = prev.activeIndex;

      if (terminals.length === 0) {
        activeIndex = null;
      } else if (activeIndex === index) {
        activeIndex = terminals.length - 1;
      } else if (activeIndex !== null && activeIndex > index) {
        activeIndex -= 1;
      }

      return { terminals, activeIndex };
    });
  };

  return (
    <div className="flex h-full w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg overflow-hidden">
      {/* Terminal Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between bg-[#111] border-b border-neutral-800 px-3 h-8 shrink-0">
          <span className="text-gray-400 text-sm">Console</span>
          <button
            onClick={addTerminal}
            className="p-1 text-gray-400 hover:text-orange-400"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Persistent Terminals */}
        <div className="flex-1 overflow-hidden relative">
          {state.terminals.map((t, i) => (
            <div
              key={t.id}
              className={`absolute inset-0 transition-opacity ${
                state.activeIndex === i
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              <Terminal key={t.id} />
            </div>
          ))}

          {state.terminals.length === 0 && (
            <div className="flex items-center justify-center h-full text-gray-500">
              No terminal open. Click + to add one.
            </div>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-56 bg-[#111] border-l border-neutral-800 flex flex-col shrink-0">
        <div className="p-2 h-8 text-xs text-gray-400 border-b border-neutral-800">
          Terminals
        </div>
        <div className="flex-1 overflow-y-auto">
          {state.terminals.map((t, i) => (
            <div
              key={t.id}
              className={`group flex items-center justify-between px-3 py-2 text-sm cursor-pointer ${
                state.activeIndex === i
                  ? "bg-[#1a1a1a] text-orange-400"
                  : "text-gray-400 hover:bg-[#1a1a1a]"
              }`}
            >
              <span
                className="flex-1"
                onClick={() =>
                  setState((prev) => ({ ...prev, activeIndex: i }))
                }
              >
                Terminal {i + 1}
              </span>
              <button
                onClick={() => removeTerminal(i)}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-300 hover:text-red-400"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
