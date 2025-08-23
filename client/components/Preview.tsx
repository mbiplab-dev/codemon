import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Lock,
  RefreshCw,
  Smartphone,
} from "lucide-react";
import { useState } from "react";

const Preview = ({ srcDoc, viewMode, setViewMode }) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [url] = useState("https://codemon.local/preview");

  return (
    <div className="flex flex-col flex-1">
      {/* Navigation Bar */}
      <div className="flex items-center px-2 py-2 bg-[#111] border-b border-neutral-800 space-x-2">
        <button
          className="p-1 border border-transparent hover:border hover:border-orange-500 transition rounded"
          title="Back"
        >
          <ChevronLeft className="w-4 h-4 text-gray-300 hover:text-orange-400" />
        </button>
        <button
          className="p-1 border border-transparent hover:border hover:border-orange-500 transition rounded"
          title="Forward"
        >
          <ChevronRight className="w-4 h-4 text-gray-300 hover:text-orange-400" />
        </button>
        <button
          onClick={() => setRefreshKey(refreshKey + 1)}
          className="p-1 border border-transparent hover:border hover:border-orange-500 transition rounded"
          title="Refresh Preview"
        >
          <RefreshCw className="w-4 h-4 text-gray-300 hover:text-orange-400" />
        </button>
        <button
          onClick={() =>
            setViewMode(viewMode === "desktop" ? "mobile" : "desktop")
          }
          className="p-1 border border-transparent hover:border hover:border-orange-500 transition rounded"
          title="Toggle Mobile View"
        >
          <Smartphone className="w-4 h-4 text-gray-300 hover:text-orange-400" />
        </button>
        <button
          onClick={() => {
            const newWindow = window.open();
            newWindow.document.write(srcDoc);
            newWindow.document.close();
          }}
          className="p-1 border border-transparent hover:border hover:border-orange-500 transition rounded"
          title="Open in New Tab"
        >
          <ExternalLink className="w-4 h-4 text-gray-300 hover:text-orange-400" />
        </button>

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
      <iframe
        key={refreshKey}
        srcDoc={srcDoc}
        title="Live Preview"
        sandbox="allow-scripts"
        className={`bg-white rounded-b shadow flex-1 ${
          viewMode === "mobile"
            ? "w-[375px] h-[667px] mx-auto my-4"
            : "w-full h-full"
        }`}
      />
    </div>
  );
};

export default Preview;
