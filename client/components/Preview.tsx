import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Lock,
  RefreshCw,
  Smartphone,
} from "lucide-react";
import { useState, useRef } from "react";

const Preview = ({ viewMode, setViewMode }) => {
  const [url, setUrl] = useState("https://www.biplabmohanty.com"); // Default page
  const [history, setHistory] = useState(["https://www.biplabmohanty.com"]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const iframeRef = useRef(null);

  const proxyBase = "http://localhost:3001/proxy?url=";

  const goBack = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setUrl(history[newIndex]);
    }
  };

  const goForward = () => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setUrl(history[newIndex]);
    }
  };

  const refreshPage = () => {
    if (iframeRef.current) {
      iframeRef.current.src = proxyBase + encodeURIComponent(url);
    }
  };

  const handleEnterUrl = (e) => {
    if (e.key === "Enter") {
      let newUrl = e.target.value.trim();
      if (!newUrl.startsWith("http")) {
        newUrl = `https://${newUrl}`;
      }
      const newHistory = history.slice(0, currentIndex + 1);
      newHistory.push(newUrl);
      setHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
      setUrl(newUrl);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Navigation Bar */}
      <div className="flex items-center px-2 py-2 bg-[#111] border-b border-neutral-800 space-x-2">
        <button
          onClick={goBack}
          disabled={currentIndex === 0}
          className="p-1 border border-transparent hover:border hover:border-orange-500 transition rounded disabled:opacity-50"
          title="Back"
        >
          <ChevronLeft className="w-4 h-4 text-gray-300 hover:text-orange-400" />
        </button>
        <button
          onClick={goForward}
          disabled={currentIndex >= history.length - 1}
          className="p-1 border border-transparent hover:border hover:border-orange-500 transition rounded disabled:opacity-50"
          title="Forward"
        >
          <ChevronRight className="w-4 h-4 text-gray-300 hover:text-orange-400" />
        </button>
        <button
          onClick={refreshPage}
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
          onClick={() => window.open(url, "_blank")}
          className="p-1 border border-transparent hover:border hover:border-orange-500 transition rounded"
          title="Open in New Tab"
        >
          <ExternalLink className="w-4 h-4 text-gray-300 hover:text-orange-400" />
        </button>

        <div className="flex h-6 items-center flex-1 px-3 py-1 text-sm text-gray-300">
          <Lock className="w-4 h-4 mr-2 text-green-500" />
          <input
            type="text"
            defaultValue={url}
            onKeyDown={handleEnterUrl}
            className="bg-transparent w-full outline-none"
          />
        </div>
      </div>

      {/* Live Website Preview via Proxy */}
      <iframe
        ref={iframeRef}
        key={url}
        src={proxyBase + encodeURIComponent(url)}
        title="Live Browser Preview"
        className={`bg-white rounded-b shadow flex-1 ${
          viewMode === "mobile"
            ? "w-[425px] h-[800px] mx-auto my-4"
            : "w-full h-full"
        }`}
      />
      </div>
  );
};

export default Preview;
