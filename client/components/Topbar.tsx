"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Share2,
  X,
  ChevronDown,
  Copy,
} from "lucide-react";
import Image from "next/image";
import { createPortal } from "react-dom";

const Topbar = () => {
  const [openMenu, setOpenMenu] = useState(null);
  const [openShareMenu, setOpenShareMenu] = useState(false);
  const [projectName, setProjectName] = useState("MyProject");
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null);

  const username = "username"; // fixed username

  const menus = {
    File: ["New File", "Open File", "Save", "Save As", "Exit"],
    Edit: ["Undo", "Redo", "Cut", "Copy", "Paste"],
    View: ["Explorer", "Search", "Extensions", "Terminal"],
    Terminal: ["New Terminal", "Split Terminal", "Run Task"],
    Help: ["Documentation", "About", "Check for Updates"],
  };

  const handleMenuToggle = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setIsEditing(false);
    }
  };

  return (
    <div className="relative flex items-center w-full h-12 px-4 border border-neutral-800 rounded-lg bg-[#0a0a0a] shadow-lg text-white">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <Image src="/logo.png" alt="logo" width={120} height={14} />

        {/* Menu Buttons */}
        <div className="flex items-center text-sm text-gray-300 relative">
          {Object.keys(menus).map((item) => (
            <div key={item} className="relative">
              <button
                onClick={() => handleMenuToggle(item)}
                className="hover:text-orange-400 transition-colors px-2 py-1"
              >
                {item}
              </button>
              {openMenu === item && (
                <div className="absolute top-full left-0 mt-1 w-40 bg-neutral-900 border border-neutral-800 rounded-md shadow-lg z-50">
                  {menus[item].map((option, i) => (
                    <button
                      key={i}
                      className={`block w-full text-left px-4 py-2 text-gray-300 hover:bg-neutral-800 hover:text-orange-400 text-sm ${
                        i !== menus[item].length - 1
                          ? "border-b border-neutral-700"
                          : ""
                      }`}
                      onClick={() => setOpenMenu(null)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Center Section */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center space-x-4">
        <div className="flex items-center space-x-1">
          <button className="p-2 hover:bg-neutral-800 rounded-md transition">
            <ChevronLeft className="w-5 h-5 text-gray-400 hover:text-orange-400" />
          </button>
          <button className="p-2 hover:bg-neutral-800 rounded-md transition">
            <ChevronRight className="w-5 h-5 text-gray-400 hover:text-orange-400" />
          </button>
        </div>

        <div className="flex items-center space-x-1 text-gray-300 text-sm font-medium">
          <span>{username}</span>
          <span>/</span>
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              className="w-full bg-neutral-900 text-gray-200 placeholder-gray-500 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring focus:ring-orange-400"
              required
            />
          ) : (
            <span
              className="hover:text-orange-400 cursor-pointer"
              onClick={handleEditClick}
            >
              {projectName}
            </span>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setOpenShareMenu(!openShareMenu)}
            className="flex items-center space-x-2 px-3 py-1 border border-neutral-700 rounded-md text-sm hover:border-orange-400 hover:text-orange-400 transition"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>

          {/* Share Dialog */}
          {openShareMenu &&
            createPortal(
              <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/50 text-gray-300">
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl p-4 w-96 relative">
                  {/* Header */}
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold">
                      Share "{projectName}"
                    </h3>
                    <button
                      onClick={() => setOpenShareMenu(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Input */}
                  <input
                    type="text"
                    placeholder="Add people, groups, and calendar events"
                    className="w-full bg-neutral-800 text-gray-200 placeholder-gray-500 rounded-md px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-1 focus:ring-orange-400"
                  />

                  {/* People with access */}
                  <div className="mb-4">
                    <h4 className="text-xs text-gray-400 mb-2">
                      People with access
                    </h4>
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p>Biplab Mohanty (you)</p>
                        <p className="text-gray-500 text-xs">Owner</p>
                      </div>
                      <span className="text-gray-400 text-xs">Owner</span>
                    </div>
                  </div>

                  {/* General access */}
                  <div className="mb-4">
                    <h4 className="text-xs text-gray-400 mb-2">
                      General access
                    </h4>
                    <div className="flex items-center justify-between border border-neutral-700 rounded-md px-3 py-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400">Restricted</span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-xs mt-1">
                      Only people with access can open with the link
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center mt-4">
                    <button className="flex items-center space-x-1 px-3 py-2 text-sm border border-neutral-700 rounded-md hover:border-orange-400 hover:text-orange-400 transition">
                      <Copy className="w-4 h-4" />
                      <span>Copy link</span>
                    </button>
                    <button
                      onClick={() => setOpenShareMenu(false)}
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-semibold"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>,
              document.body
            )}
        </div>
      </div>

      {/* Right Section */}
      <div className="ml-auto flex items-center space-x-4 w-100">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search..."
            spellCheck={false}
            className="w-full bg-neutral-900 text-gray-200 placeholder-gray-500 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring focus:ring-orange-400"
          />
          <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-500" />
        </div>
      </div>
    </div>
  );
};

export default Topbar;
