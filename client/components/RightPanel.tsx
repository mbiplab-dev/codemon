import { useState, useEffect } from "react";
import Preview from "./Preview";
import Chat from "./AiChatPanel";

const RightPanel = ({ srcDoc }) => {
  // Load from localStorage or default to "desktop"
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem("viewMode") || "desktop";
  });
  const [activeTab, setActiveTab] = useState("preview");

  // Save to localStorage whenever viewMode changes
  useEffect(() => {
    localStorage.setItem("viewMode", viewMode);
  }, [viewMode]);

  return (
    <div className="flex flex-col w-full h-full bg-[#1a1a1a] border border-neutral-800 rounded-lg overflow-hidden">
      {/* Tab Bar */}
      <div className="flex h-10 border-b border-neutral-800 bg-neutral-900">
        <button
          className={`flex-1 text-center py-2 ${
            activeTab === "preview"
              ? "border-b-2 border-orange-500 text-white"
              : "text-gray-400"
          }`}
          onClick={() => setActiveTab("preview")}
        >
          Preview
        </button>
        <button
          className={`flex-1 text-center py-2 ${
            activeTab === "chat"
              ? "border-b-2 border-orange-500 text-white"
              : "text-gray-400"
          }`}
          onClick={() => setActiveTab("chat")}
        >
          Chat with AI
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "preview" ? (
        <Preview viewMode={viewMode} setViewMode={setViewMode} />
      ) : (
        <Chat />
      )}
    </div>
  );
};

export default RightPanel;
