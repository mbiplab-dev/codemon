"use client";
import React, { useEffect, useRef, useState } from "react";
import { Send, Copy, Check, Trash2, Bot, User } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

interface Message {
  id: string;
  from: "AI" | "User";
  message: string;
  timestamp: number;
  isStreaming?: boolean;
}

const Chat: React.FC = () => {
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { id: "welcome", from: "AI", message: "Hello! How can I help you today?", timestamp: Date.now() }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [thinkingDots, setThinkingDots] = useState(".");

  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

  useEffect(() => {
    const lastMsg = chatMessages[chatMessages.length - 1];
    if (lastMsg?.isStreaming && lastMsg.message === "Thinking...") {
      const interval = setInterval(() => setThinkingDots(prev => prev.length < 3 ? prev + "." : "."), 500);
      return () => clearInterval(interval);
    }
  }, [chatMessages]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMsg: Message = { id: `user-${Date.now()}`, from: "User", message: chatInput.trim(), timestamp: Date.now() };
    const thinkingMsg: Message = { id: `ai-${Date.now()}`, from: "AI", message: "Thinking...", timestamp: Date.now(), isStreaming: true };

    setChatMessages(prev => [...prev, userMsg, thinkingMsg]);
    const currentInput = chatInput;
    setChatInput("");

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(currentInput);
      const text = result.response.text();

      let index = 0;
      const interval = setInterval(() => {
        index += 3;
        setChatMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.isStreaming) last.message = text.slice(0, index);
          return updated;
        });

        if (index >= text.length) {
          clearInterval(interval);
          setChatMessages(prev => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last) last.isStreaming = false;
            return updated;
          });
        }
      }, 30);
    } catch (err) {
      setChatMessages(prev => {
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

  const handleCopy = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(messageId);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const clearChat = () => {
    setChatMessages([{ id: "welcome", from: "AI", message: "Hello! How can I help you today?", timestamp: Date.now() }]);
  };

  const renderMessage = (msg: Message) => {
    const isThinking = msg.message === "Thinking..." && msg.isStreaming;
    const isUser = msg.from === "User";

    return (
      <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isUser ? 'bg-orange-500' : 'bg-blue-500'}`}>
          {isUser ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
        </div>
        <div className={`flex-1 ${isUser ? 'text-right' : 'text-left'}`}>
          <div className={`inline-block max-w-[85%] break-words ${isUser ? 'ml-auto' : 'mr-auto'}`}>
            <div className={`px-4 py-3 rounded-2xl ${isUser ? 'bg-orange-500 text-white rounded-tr-sm' : 'bg-neutral-800 text-gray-200 border border-neutral-700 rounded-tl-sm'}`}>
              {isThinking ? (
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    {[0, 0.1, 0.2].map((delay, i) => (
                      <div key={i} className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: `${delay}s` }} />
                    ))}
                  </div>
                  <span className="text-sm">Thinking{thinkingDots}</span>
                </div>
              ) : (
                <div className="prose prose-sm prose-invert max-w-none overflow-x-auto scrollable">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      p({ children }) {
                        return <div >{children}</div>;
                      },
                      code({ inline, children, className, ...props }) {
                        const match = /language-(\w+)/.exec(className || "");
                        if (!inline) {
                          return (
                            <div className="relative bg-black text-green-400 font-mono text-sm p-4 rounded-lg mt-2 overflow-x-auto scrollable">
                              <button
                                onClick={() => handleCopy(String(children), msg.id)}
                                className="absolute top-2 right-2 p-2 bg-gray-700 rounded hover:bg-gray-600 flex items-center gap-1 text-white text-xs"
                              >
                                {copiedIndex === msg.id ? (
                                  <>
                                    <Check className="w-3 h-3" /> Copied
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" /> Copy
                                  </>
                                )}
                              </button>
                              <pre>
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              </pre>
                            </div>
                          );
                        }
                        return (
                          <code {...props} className="bg-gray-700 px-1.5 py-0.5 rounded text-sm">
                            {children}
                          </code>
                        );
                      },
                    }}
                  >
                    {msg.message}
                  </ReactMarkdown>
                </div>
              )}
            </div>
            <div className={`flex items-center gap-2 mt-1 text-xs text-neutral-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
              <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              {!isUser && !msg.isStreaming && (
                <button onClick={() => handleCopy(msg.message, msg.id)} className="hover:text-neutral-300">
                  <Copy className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 rounded-lg border border-neutral-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-700 bg-neutral-900/50">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-400" />
          <h2 className="font-semibold text-neutral-200">AI Assistant</h2>
        </div>
        <button onClick={clearChat} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg" title="Clear">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollable">
        {chatMessages.map(renderMessage)}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input */}
      <div className="border-t border-neutral-700 bg-neutral-900/50 p-4">
        <div className="flex items-end gap-3">
          <input
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-orange-500"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={!chatInput.trim()}
            className="p-3 bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-700 text-white rounded-lg"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
