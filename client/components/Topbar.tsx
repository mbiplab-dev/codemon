"use client";

import {
  Folder,
  Terminal,
  Code,
  Settings,
  Wifi,
  WifiOff,
  Users,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import { useOthers, useSelf } from "@liveblocks/react/suspense";
import Image from "next/image";

type User = {
  id: string;
  name: string;
  color: string;
  avatar?: string;
};

export default function Topbar() {
  /** ✅ Connection + Time */
  const [isConnected, setIsConnected] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const connectionCheck = setInterval(() => setIsConnected(navigator.onLine), 5000);
    return () => clearInterval(connectionCheck);
  }, []);

  /** ✅ Liveblocks Users */
  const others = useOthers();
  const self = useSelf();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /** ✅ Prepare users and group by file */
  const { allUsers, usersByFile } = useMemo(() => {
    const usersByFile: Record<string, User[]> = {};
    const allUsers: User[] = [];

    // Self
    if (self?.info) {
      const selfUser = self.info as User;
      const currentFile = self.presence?.currentFile ?? "No file open";
      allUsers.push(selfUser);
      usersByFile[currentFile] = usersByFile[currentFile] || [];
      usersByFile[currentFile].push(selfUser);
    }

    // Others
    others.forEach((other) => {
      if (other.info) {
        const user = other.info as User;
        const currentFile = other.presence?.currentFile ?? "No file open";
        allUsers.push(user);
        usersByFile[currentFile] = usersByFile[currentFile] || [];
        usersByFile[currentFile].push(user);
      }
    });

    return { allUsers, usersByFile };
  }, [others, self]);

  /** ✅ Close dropdown on outside click */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /** ✅ Helpers */
  const getFileDisplayName = (filePath: string) =>
    filePath === "No file open" ? filePath : filePath.split("/").pop() || filePath;

  const getLastActivity = (timestamp?: number) => {
    if (!timestamp) return "Now";
    const diff = Date.now() - timestamp;
    if (diff < 60000) return "Now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  return (
    <div className="w-full h-12 flex items-center justify-between px-4 bg-neutral-950 border-b border-neutral-800">
      {/* ✅ Left: Project Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="logo" width={120} height={14} />
        </div>
        <div className="flex items-center gap-1 text-m text-neutral-400">
          <Folder className="w-4 h-4" />
          <span>project-id/project-name</span>
        </div>
      </div>

      {/* ✅ Center: Connection & Time */}
      <div className="flex items-center gap-4 text-sm text-neutral-400">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi className="w-4 h-4 text-green-400" />
              <span className="text-green-400">Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-400" />
              <span className="text-red-400">Offline</span>
            </>
          )}
        </div>
        <div className="hidden md:flex items-center gap-1">
          <Terminal className="w-4 h-4" />
          <span>Ready</span>
        </div>
        <div className="text-neutral-500">{formatTime(currentTime)}</div>
      </div>

      {/* ✅ Right: Users + Settings */}
      <div className="flex items-center gap-3 relative" ref={dropdownRef}>
        {/* ✅ Users Dropdown */}
        <button
          onClick={() => setShowDropdown((prev) => !prev)}
          className="flex items-center gap-2 px-3 py-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-300 hover:text-white"
        >
          <div className="flex -space-x-2">
            {allUsers.slice(0, 3).map((user) => (
              <Avatar key={user.id} user={user} size="sm" />
            ))}
            {allUsers.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-neutral-600 border-2 border-neutral-900 flex items-center justify-center">
                <span className="text-[10px] text-white font-bold">
                  +{allUsers.length - 3}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">{allUsers.length}</span>
            <ChevronDown
              className={`w-3 h-3 transition-transform ${showDropdown ? "rotate-180" : ""}`}
            />
          </div>
        </button>

        {/* ✅ Dropdown */}
        {showDropdown && (
          <div className="absolute top-14 right-0 w-80 max-h-96 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-50 overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="p-3 border-b border-neutral-700 flex justify-between">
              <h3 className="text-sm font-medium text-neutral-200">
                Active Users ({allUsers.length})
              </h3>
              <span className="text-xs text-neutral-400">
                Files: {Object.keys(usersByFile).length}
              </span>
            </div>

            {/* User List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-4">
              {Object.entries(usersByFile).map(([filePath, users]) => (
                <div key={filePath}>
                  <div className="flex items-center gap-2 px-2 py-1 bg-neutral-800 rounded text-xs mb-2">
                    <div className="w-2 h-2 rounded-full bg-neutral-500" />
                    <span className="text-neutral-300 font-mono truncate flex-1">
                      {getFileDisplayName(filePath)}
                    </span>
                    <span className="text-neutral-500">({users.length})</span>
                  </div>
                  <div className="space-y-1">
                    {users.map((user) => {
                      const isCurrentUser = user.id === self?.id;
                      const otherUser = others.find((o) => o.id === user.id);
                      const lastActivity = otherUser?.presence?.timestamp;
                      return (
                        <div
                          key={user.id}
                          className="flex items-center gap-3 p-2 hover:bg-neutral-800 rounded transition-colors"
                        >
                          <Avatar user={user} size="md" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-neutral-200 truncate">
                                {user.name}
                              </span>
                              {isCurrentUser && (
                                <span className="text-xs text-neutral-500">(You)</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                              <div
                                className="w-1.5 h-1.5 rounded-full animate-pulse"
                                style={{ backgroundColor: user.color }}
                              />
                              <span>{getLastActivity(lastActivity)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-2 border-t border-neutral-700 bg-neutral-800 text-xs text-neutral-400 flex justify-between items-center">
              <span>Real-time collaboration</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span>Connected</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** ✅ Avatar Subcomponent */
function Avatar({ user, size }: { user: User; size: "sm" | "md" }) {
  const sizeClasses = size === "sm" ? "w-6 h-6 border-2" : "w-7 h-7 border";
  return (
    <div
      className={`${sizeClasses} rounded-full flex items-center justify-center text-white text-xs font-medium border-neutral-900`}
      style={{ backgroundColor: user.color }}
      title={user.name}
    >
      {user.avatar ? (
        <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
      ) : (
        user.name.charAt(0).toUpperCase()
      )}
    </div>
  );
}
