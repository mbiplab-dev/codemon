import React, { useState } from "react";
import {
  RefreshCw,
  ExternalLink,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Lock,
} from "lucide-react";

const Preview = ({ srcDoc }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewMode, setViewMode] = useState("desktop");
  const [url] = useState("https://codemon.local/preview"); // Fake URL for display

  return (
    <div className="flex flex-col w-full h-full bg-[#1a1a1a] border border-neutral-800 rounded-lg overflow-hidden">
      {/* Preview Header */}
      <div className="h-10 flex items-center justify-between px-4 py-2 bg-neutral-900 border-b border-neutral-800 text-gray-300 text-m">
        <span className="tracking-wide text-gray-300">Preview</span>
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <button
            onClick={() =>
              setViewMode(viewMode === "desktop" ? "mobile" : "desktop")
            }
            className="p-1 hover:bg-neutral-800 rounded transition"
            title="Toggle Mobile View"
          >
            <Smartphone className="w-4 h-4 text-gray-300 hover:text-orange-400" />
          </button>
          {/* Open in New Tab */}
          <button
            onClick={() => {
              const newWindow = window.open();
              newWindow.document.write(srcDoc);
              newWindow.document.close();
            }}
            className="p-1 hover:bg-neutral-800 rounded transition"
            title="Open in New Tab"
          >
            <ExternalLink className="w-4 h-4 text-gray-300 hover:text-orange-400" />
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="flex items-center px-2 py-2 bg-[#111] border-b border-neutral-800 space-x-3">
        {/* Back Button */}
        <button
          className="p-1 border border-transparent hover:border hover:border-orange-500 transition rounded"
          title="Back"
        >
          <ChevronLeft className="w-4 h-4 text-gray-300 hover:text-orange-400" />
        </button>

        {/* Forward Button */}
        <button
          className="p-1 border border-transparent hover:border hover:border-orange-500 transition rounded"
          title="Forward"
        >
          <ChevronRight className="w-4 h-4 text-gray-300 hover:text-orange-400" />
        </button>
        {/* Refresh */}
        <button
          onClick={() => setRefreshKey(refreshKey + 1)}
          className="p-1 border border-transparent hover:border hover:border-orange-500 transition rounded"
          title="Refresh Preview"
        >
          <RefreshCw className="w-4 h-4 text-gray-300 hover:text-orange-400" />
        </button>

        {/* URL Bar */}
        <div className="flex h-6 items-center flex-1 px-3 py-1 text-sm text-gray-300">
          <Lock className="w-4 h-4 mr-2 text-green-500" />
          <input
            type="text"
            value={url}
            className="bg-transparent w-full outline-none"
          />
        </div>
      </div>

      {/* Preview Iframe */}
      <div className="flex-1 flex items-center justify-center bg-neutral-900">
        <iframe
          key={refreshKey}
          srcDoc={srcDoc}
          title="Live Preview"
          sandbox="allow-scripts"
          className={`bg-white rounded-b shadow ${
            viewMode === "mobile" ? "w-[375px] h-[667px]" : "w-full h-full"
          }`}
        />
      </div>
    </div>
  );
};

export default Preview;
