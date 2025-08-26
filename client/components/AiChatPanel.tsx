"use client";
import React, { useEffect, useRef, useState } from "react";
import { Mic, Plus, Send, Copy, Check, Trash2 } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

interface Message {
  from: "AI" | "User";
  message: string;
  isStreaming?: boolean;
}

const Chat: React.FC = () => {
  const [chatMessages, setChatMessages] = useState<Message[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("chatMessages");
      return stored
        ? JSON.parse(stored)
        : [{ from: "AI", message: "Hello! Ask me anything." }];
    }
    return [{ from: "AI", message: "Hello! Ask me anything." }];
  });

  const [chatInput, setChatInput] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [thinkingDots, setThinkingDots] = useState(".");
  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

  // Animate "Thinking..." dots
  useEffect(() => {
    const lastMsg = chatMessages[chatMessages.length - 1];
    if (lastMsg?.isStreaming && lastMsg.message === "Thinking...") {
      const interval = setInterval(() => {
        setThinkingDots((prev) => (prev.length < 3 ? prev + "." : "."));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [chatMessages]);

  // Auto-scroll & save to localStorage
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    localStorage.setItem("chatMessages", JSON.stringify(chatMessages));
  }, [chatMessages]);

  const sendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg: Message = { from: "User", message: chatInput };
    setChatMessages((prev) => [
      ...prev,
      userMsg,
      { from: "AI", message: "Thinking...", isStreaming: true },
    ]);

    const currentInput = chatInput;
    setChatInput("");

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(currentInput);
      const text = result.response.text();

      // Simulate streaming effect
      let index = 0;
      const interval = setInterval(() => {
        index += 3;
        setChatMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.isStreaming) {
            last.message = text.slice(0, index);
          }
          return updated;
        });

        if (index >= text.length) {
          clearInterval(interval);
          setChatMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last) last.isStreaming = false;
            return updated;
          });
        }
      }, 30);
    } catch (err) {
      console.error("Chat error:", err);
      setChatMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last) {
          last.message = "❌ Error fetching response. Try again.";
          last.isStreaming = false;
        }
        return updated;
      });
    }
  };

  const handleCopy = (text: string, blockIndex: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(blockIndex);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const clearChat = () => {
    localStorage.removeItem("chatMessages");
    setChatMessages([{ from: "AI", message: "Hello! Ask me anything." }]);
  };

  const renderMessage = (msg: Message, index: number) => {
    const isThinking = msg.message === "Thinking..." && msg.isStreaming;

    return (
      <div
        key={index}
        className={`flex flex-col text-sm ${
          msg.from === "AI" ? "items-start" : "items-end"
        }`}
      >
        <div
          className={`px-3 py-2 rounded-lg max-w-[80%] whitespace-pre-wrap break-words ${
            msg.from === "AI"
              ? "bg-neutral-800 text-gray-200 border border-orange-500"
              : "bg-gray-900 text-gray-200 border border-gray-600"
          }`}
        >
          {isThinking ? (
            <span className="min-w-4">Thinking{thinkingDots}</span>
          ) : (
            <ReactMarkdown
              children={msg.message}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                code({ inline, children, ...props }) {
                  if (!inline) {
                    const blockIndex = index;
                    return (
                      <div className="relative bg-black text-green-400 font-mono text-xs p-3 rounded-lg max-w-[90%] overflow-x-auto scrollable">
                        <button
                          onClick={() =>
                            handleCopy(String(children), blockIndex)
                          }
                          className="absolute top-1 right-1 p-1 bg-gray-700 rounded hover:bg-gray-600 flex items-center gap-1 text-white text-xs"
                        >
                          {copiedIndex === blockIndex ? (
                            <>
                              <Check className="w-4 h-4" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" /> Copy
                            </>
                          )}
                        </button>
                        <pre {...props}>{children}</pre>
                      </div>
                    );
                  } else {
                    return (
                      <code
                        {...props}
                        className="bg-gray-700 px-1 rounded text-white"
                      >
                        {children}
                      </code>
                    );
                  }
                },
              }}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#111]">
      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 text-[13px] leading-relaxed scrollable p-4">
        {chatMessages.map((msg, index) => renderMessage(msg, index))}
        <div ref={endOfMessagesRef} />
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
          className="flex-1 px-3 py-2 rounded bg-neutral-700 text-gray-200 text-sm outline-none"
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
        <button
          onClick={clearChat}
          className="p-2 hover:bg-red-600 rounded bg-red-500 flex items-center"
          title="Clear Chat"
        >
          <Trash2 className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
};

export default Chat;
