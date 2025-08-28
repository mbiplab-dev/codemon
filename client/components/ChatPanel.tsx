"use client";

import { useOthers, useSelf, useBroadcastEvent, useEventListener } from "@liveblocks/react/suspense";
import { Mic, Plus, Send, MessageCircle, X, Users } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

type User = {
  id: string;
  name: string;
  color: string;
  avatar?: string;
};

type ChatMessage = {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  userAvatar?: string;
  message: string;
  timestamp: number;
  type: "message" | "system" | "file_shared";
  fileInfo?: {
    name: string;
    path: string;
  };
};

export default function CollaborativeChat() {
  const others = useOthers();
  const self = useSelf();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);
  
  // Broadcast events
  const broadcast = useBroadcastEvent();

  // Listen for chat messages
  useEventListener(({ event, user }) => {
    if (event.type === "chat_message") {
      const message: ChatMessage = {
        id: `${event.data.timestamp}-${user.id}`,
        userId: user.id,
        userName: user.info?.name || "Anonymous",
        userColor: user.info?.color || "#888888",
        userAvatar: user.info?.avatar,
        message: event.data.message,
        timestamp: event.data.timestamp,
        type: "message",
      };
      
      setChatMessages((prev) => [...prev, message]);
    }
    
    if (event.type === "typing_start") {
      setIsTyping((prev) => ({ ...prev, [user.id]: true }));
      
      // Auto-clear typing after 3 seconds
      setTimeout(() => {
        setIsTyping((prev) => {
          const updated = { ...prev };
          delete updated[user.id];
          return updated;
        });
      }, 3000);
    }
    
    if (event.type === "typing_stop") {
      setIsTyping((prev) => {
        const updated = { ...prev };
        delete updated[user.id];
        return updated;
      });
    }

    if (event.type === "file_shared") {
      const message: ChatMessage = {
        id: `${event.data.timestamp}-${user.id}-file`,
        userId: user.id,
        userName: user.info?.name || "Anonymous",
        userColor: user.info?.color || "#888888",
        userAvatar: user.info?.avatar,
        message: `shared a file`,
        timestamp: event.data.timestamp,
        type: "file_shared",
        fileInfo: event.data.fileInfo,
      };
      
      setChatMessages((prev) => [...prev, message]);
    }
  });

  // Listen for user join/leave
  useEffect(() => {
    const currentUserIds = new Set([
      ...(self?.id ? [self.id] : []),
      ...others.map(user => user.id)
    ]);

    // Add system messages for user activity (simplified)
    // In a real app, you'd want to track this more carefully
  }, [others.length, self]);

  // Send message
  const sendMessage = () => {
    if (!chatInput.trim() || !self?.info) return;
    
    broadcast({
      type: "chat_message",
      data: {
        message: chatInput.trim(),
        timestamp: Date.now(),
      },
    });
    
    setChatInput("");
    
    // Stop typing indicator
    broadcast({
      type: "typing_stop",
      data: {},
    });
  };

  // Handle typing indicators
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatInput(e.target.value);
    
    // Send typing indicator
    broadcast({
      type: "typing_start",
      data: {},
    });
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout to stop typing indicator
    const timeout = setTimeout(() => {
      broadcast({
        type: "typing_stop",
        data: {},
      });
    }, 1000);
    
    setTypingTimeout(timeout);
  };

  // Share current file
  const shareCurrentFile = () => {
    const currentFile = self?.presence?.currentFile;
    if (currentFile && self?.info) {
      broadcast({
        type: "file_shared",
        data: {
          timestamp: Date.now(),
          fileInfo: {
            name: currentFile.split('/').pop() || currentFile,
            path: currentFile,
          },
        },
      });
    }
  };

  // Auto-scroll to latest message
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Get typing users
  const typingUsers = Object.keys(isTyping).map(userId => {
    const user = others.find(u => u.id === userId);
    return user?.info?.name || "Someone";
  });

  return (
    <div className="flex flex-col h-full bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-neutral-700 bg-neutral-900">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-medium text-neutral-200">Team Chat</h3>
          <div className="flex items-center gap-1 text-xs text-neutral-400">
            <Users className="w-3 h-3" />
            <span>{others.length + 1}</span>
          </div>
        </div>
        
        {/* Active users in chat */}
        <div className="flex -space-x-1">
          {self?.info && (
            <div
              className="w-5 h-5 rounded-full border border-neutral-600 flex items-center justify-center text-[10px] font-medium text-white"
              style={{ backgroundColor: (self.info as User).color }}
              title={`${(self.info as User).name} (You)`}
            >
              {(self.info as User).avatar ? (
                <img 
                  src={(self.info as User).avatar} 
                  alt={(self.info as User).name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                (self.info as User).name.charAt(0).toUpperCase()
              )}
            </div>
          )}
          {others.slice(0, 4).map((other) => {
            const user = other.info as User;
            return (
              <div
                key={other.id}
                className="w-5 h-5 rounded-full border border-neutral-600 flex items-center justify-center text-[10px] font-medium text-white"
                style={{ backgroundColor: user?.color }}
                title={user?.name}
              >
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  user?.name.charAt(0).toUpperCase()
                )}
              </div>
            );
          })}
          {others.length > 4 && (
            <div className="w-5 h-5 rounded-full bg-neutral-600 border border-neutral-600 flex items-center justify-center text-[8px] text-white">
              +{others.length - 4}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
        {chatMessages.length === 0 && (
          <div className="text-center text-neutral-500 text-sm py-8">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
        
        {chatMessages.map((msg) => {
          const isOwnMessage = msg.userId === self?.id;
          
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}
            >
              {/* Message */}
              <div
                className={`flex items-start gap-2 max-w-[85%] ${
                  isOwnMessage ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white flex-shrink-0"
                  style={{ backgroundColor: msg.userColor }}
                >
                  {msg.userAvatar ? (
                    <img 
                      src={msg.userAvatar} 
                      alt={msg.userName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    msg.userName.charAt(0).toUpperCase()
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={`px-3 py-2 rounded-lg break-words ${
                    msg.type === "file_shared"
                      ? "bg-blue-500/20 border border-blue-500/30 text-blue-300"
                      : isOwnMessage
                      ? "bg-orange-500 text-white"
                      : "bg-neutral-800 text-neutral-200"
                  }`}
                >
                  {msg.type === "file_shared" && msg.fileInfo ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">📁 {msg.fileInfo.name}</span>
                    </div>
                  ) : (
                    <span className="text-sm">{msg.message}</span>
                  )}
                </div>
              </div>

              {/* Message info */}
              <div
                className={`flex items-center gap-1 mt-1 text-xs text-neutral-500 ${
                  isOwnMessage ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <span>{isOwnMessage ? "You" : msg.userName}</span>
                <span>•</span>
                <span>{formatTime(msg.timestamp)}</span>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-neutral-500 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-1 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span>
              {typingUsers.length === 1 
                ? `${typingUsers[0]} is typing...`
                : `${typingUsers.join(", ")} are typing...`
              }
            </span>
          </div>
        )}

        <div ref={endOfMessagesRef} />
      </div>

      {/* Chat Input */}
      <div className="flex items-center p-3 border-t border-neutral-700 bg-neutral-900 gap-2">
        <button 
          onClick={shareCurrentFile}
          className="p-1.5 hover:bg-neutral-700 rounded-lg transition-colors text-neutral-400 hover:text-neutral-200"
          title="Share current file"
          disabled={!self?.presence?.currentFile}
        >
          <Plus className="w-4 h-4" />
        </button>
        
        <button 
          className="p-1.5 hover:bg-neutral-700 rounded-lg transition-colors text-neutral-400 hover:text-neutral-200"
          title="Voice message (coming soon)"
        >
          <Mic className="w-4 h-4" />
        </button>

        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-200 placeholder-neutral-500 border border-neutral-700 focus:border-neutral-600 focus:outline-none text-sm"
          value={chatInput}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />

        <button
          onClick={sendMessage}
          disabled={!chatInput.trim()}
          className="p-1.5 hover:bg-neutral-700 rounded-lg transition-colors text-neutral-400 hover:text-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}