import { Mic, Plus, Send } from 'lucide-react';
import React, { useState } from 'react'

const Chat = () => {
    const [chatMessages, setChatMessages] = useState([
    { from: "AI", message: "Hello! How can I help you today?", timestamp: "2025-08-23 10:00 AM" },
    { from: "User", message: "Can you review my code?", timestamp: "2025-08-23 10:01 AM" },
    { from: "AI", message: "Sure! I see your Preview component is well structured.", timestamp: "2025-08-23 10:02 AM" },
  ]);
  const [chatInput, setChatInput] = useState("");

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    const timestamp = new Date().toLocaleString();
    setChatMessages([...chatMessages, { from: "User", message: chatInput, timestamp }]);
    setChatInput("");

    // Simulate AI response
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        { from: "AI", message: "This is a simulated AI response.", timestamp: new Date().toLocaleString() },
      ]);
    }, 1000);
  };

  return (
    <div className="flex flex-col flex-1 bg-[#111]">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.map((msg, index) => (
          <div key={index} className={`flex flex-col ${msg.from === "AI" ? "items-start" : "items-end"}`}>
            <div className={`px-3 py-2 rounded max-w-[70%] ${msg.from === "AI" ? "bg-orange-500 text-white" : "bg-gray-800 text-gray-200"}`}>
              {msg.message}
            </div>
            <span className="text-xs text-gray-400 mt-1">{msg.timestamp}</span>
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <div className="flex items-center p-2 border-t border-neutral-700 bg-neutral-800 space-x-2">
        <button className="p-2 hover:bg-neutral-700 rounded">
          <Plus className="w-5 h-5 text-gray-300" />
        </button>
        <button className="p-2 hover:bg-neutral-700 rounded">
          <Mic className="w-5 h-5 text-gray-300" />
        </button>
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 rounded bg-neutral-700 text-gray-200 outline-none"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="p-2 hover:bg-neutral-700 rounded"
        >
          <Send className="w-5 h-5 text-gray-300" />
        </button>
      </div>
    </div>
  )
}

export default Chat