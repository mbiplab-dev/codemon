"use client";

import { useOthers, useSelf } from "@liveblocks/react/suspense";
import { Users, Circle, Eye } from "lucide-react";
import { useState } from "react";

type User = {
  id: string;
  name: string;
  color: string;
  avatar?: string;
};

export default function ActiveUsers() {
  const others = useOthers();
  const self = useSelf();
  const [showDetails, setShowDetails] = useState(true);

  // Group users by the file they're currently viewing
  const usersByFile: Record<string, User[]> = {};
  const allUsers: User[] = [];

  // Add self to the list
  if (self?.info) {
    const selfUser = self.info as User;
    const currentFile = self.presence?.currentFile || "No file open";
    allUsers.push(selfUser);
    
    if (!usersByFile[currentFile]) {
      usersByFile[currentFile] = [];
    }
    usersByFile[currentFile].push(selfUser);
  }

  // Add other users
  others.forEach((other) => {
    if (other.info) {
      const user = other.info as User;
      const currentFile = other.presence?.currentFile || "No file open";
      
      allUsers.push(user);
      
      if (!usersByFile[currentFile]) {
        usersByFile[currentFile] = [];
      }
      usersByFile[currentFile].push(user);
    }
  });

  const getFileDisplayName = (filePath: string) => {
    if (filePath === "No file open") return "No file open";
    return filePath.split('/').pop() || filePath;
  };

  const getLastActivity = (timestamp?: number) => {
    if (!timestamp) return "Now";
    const diff = Date.now() - timestamp;
    if (diff < 60000) return "Now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  return (
    <div className="h-full bg-neutral-950 border border-neutral-800 rounded-lg flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-medium text-neutral-200">
            Active Users ({allUsers.length})
          </h3>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="p-1 hover:bg-neutral-800 rounded text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollable">
        {showDetails ? (
          // Detailed view grouped by files
          Object.entries(usersByFile).map(([filePath, users]) => (
            <div key={filePath} className="space-y-2">
              <div className="flex items-center gap-2 px-2 py-1 bg-neutral-900 rounded text-xs">
                <Circle className="w-3 h-3 text-neutral-500" />
                <span className="text-neutral-400 font-mono truncate">
                  {getFileDisplayName(filePath)}
                </span>
                <span className="text-neutral-500">({users.length})</span>
              </div>
              
              {users.map((user) => {
                const isCurrentUser = user.id === self?.id;
                const otherUser = others.find(o => o.id === user.id);
                const lastActivity = otherUser?.presence?.timestamp;
                
                return (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-2 hover:bg-neutral-900 rounded transition-colors ml-4"
                  >
                    {/* Avatar */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium border-2"
                      style={{ 
                        backgroundColor: user.color,
                        borderColor: user.color 
                      }}
                    >
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>

                    {/* User Info */}
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
                          className="w-2 h-2 rounded-full animate-pulse"
                          style={{ backgroundColor: user.color }}
                        />
                        <span>{getLastActivity(lastActivity)}</span>
                      </div>
                    </div>

                    {/* Status indicator */}
                    <div className="flex flex-col items-end gap-1">
                      <div
                        className="w-3 h-3 rounded-full border-2 border-neutral-800"
                        style={{ backgroundColor: user.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          // Compact view - just avatars
          <div className="flex flex-wrap gap-2 p-2">
            {allUsers.map((user) => {
              const isCurrentUser = user.id === self?.id;
              
              return (
                <div
                  key={user.id}
                  className="relative group"
                  title={`${user.name}${isCurrentUser ? ' (You)' : ''}`}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium border-2 cursor-pointer hover:scale-110 transition-transform"
                    style={{ 
                      backgroundColor: user.color,
                      borderColor: user.color 
                    }}
                  >
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap border border-neutral-600 z-50">
                    {user.name}
                    {isCurrentUser && ' (You)'}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-neutral-600"></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t border-neutral-800 text-xs text-neutral-500">
        <div className="flex justify-between items-center">
          <span>Online: {allUsers.length}</span>
          <span>Files: {Object.keys(usersByFile).length}</span>
        </div>
      </div>
    </div>
  );
}