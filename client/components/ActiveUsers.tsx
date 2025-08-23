import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react"; // Lucide React icons

// Dummy users with mic status
const activeUsers = [
  { name: "Alice", id: 1, mic: true },
  { name: "Bob", id: 2, mic: false },
  { name: "Charlie", id: 3, mic: true },
  { name: "David", id: 4, mic: false },
  { name: "Eve", id: 5, mic: true },
  { name: "Alice", id: 1, mic: true },
  { name: "Bob", id: 2, mic: false },
  { name: "Charlie", id: 3, mic: true },
  { name: "David", id: 4, mic: false },
  { name: "Eve", id: 5, mic: true },
];

const ActiveUsers = ({
  users = activeUsers,
  maxStacked = 6,
  minHeight = 50,
}) => {
  const panelRef = useRef(null);
  const [panelHeight, setPanelHeight] = useState(minHeight);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setPanelHeight(entry.contentRect.height);
      }
    });
    if (panelRef.current) resizeObserver.observe(panelRef.current);

    return () => {
      if (panelRef.current) resizeObserver.unobserve(panelRef.current);
    };
  }, []);

  useEffect(() => {
    // Inject scrollbar styles dynamically
    const style = document.createElement("style");
    style.innerHTML = `
      .scrollable::-webkit-scrollbar {
        width: 13px;
      }
      .scrollable::-webkit-scrollbar-thumb {
        background-color: #fb923ccc;
        border-radius: 6px;
      }
      .scrollable::-webkit-scrollbar-track {
        background: transparent;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const isStacked = panelHeight < 100;
  const getAvatarUrl = (id) => `https://avatar.iran.liara.run/public/${id}`;

  return (
    <>
      {isStacked ? (
        <div
          ref={panelRef}
          className="w-full h-full bg-[#0a0a0a] border border-neutral-800 rounded-lg flex flex-col"
        >
          <div className="min-h-6 px-4 flex items-center text-gray-300 text-xs bg-[#111] border-b border-neutral-800">
            Active Users
          </div>

          <div className="flex -space-x-3 p-2">
            {users.slice(0, maxStacked).map((user, index) => (
              <div key={index} className="relative">
                <img
                  src={getAvatarUrl(user.id)}
                  alt={user.name}
                  className="w-10 h-10 rounded-full border-2 border-neutral-900"
                  title={user.name}
                />
              </div>
            ))}
            {users.length > maxStacked && (
              <div className="w-10 h-10 rounded-full border-2 border-neutral-900 bg-gray-700 flex items-center justify-center text-xs text-white">
                +{users.length - maxStacked}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          ref={panelRef}
          className="scrollable w-full h-full bg-[#0a0a0a] border border-neutral-800 rounded-lg overflow-y-auto shadow-lg"
        >
          <div className="min-h-6 px-4 flex items-center text-gray-300 text-xs bg-[#111] border-b border-neutral-800">
            Active Users
          </div>
          <div className="flex flex-col space-y-2 p-2">
            {users.map((user, index) => (
              <div
                key={index}
                className="flex items-center justify-between space-x-3"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={getAvatarUrl(user.id)}
                    alt={user.name}
                    className="w-10 h-10 rounded-full border border-neutral-700"
                  />
                  <span className="text-gray-300 text-sm">{user.name}</span>
                </div>
                {/* Mic icon to the right */}
                {user.mic ? (
                  <Mic className="w-5 h-5 text-green-400/80" />
                ) : (
                  <MicOff className="w-5 h-5 text-red-400/80" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ActiveUsers;
