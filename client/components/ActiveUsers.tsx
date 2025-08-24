import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";

const activeUsers = [
  { name: "Biplab (you)", id: 14, mic: true },
  { name: "Bob", id: 24, mic: false },
  { name: "Charlie", id: 34, mic: true },
  { name: "David", id: 44, mic: false },
  { name: "Eve", id: 54, mic: true },
  { name: "Alice", id: 64, mic: true },
  { name: "Bob", id: 75, mic: false },
  { name: "Charlie", id: 86, mic: true },
  { name: "David", id: 98, mic: false },
  { name: "Eve", id: 67, mic: true },
];

const ActiveUsers = ({ users = activeUsers, minHeight = 50 }) => {
  const panelRef = useRef(null);
  const [panelHeight, setPanelHeight] = useState(minHeight);
  const [maxStacked, setMaxStacked] = useState(6);

  const AVATAR_SIZE = 50; // avatar width in px
  const AVATAR_MARGIN = 12; // negative margin in px (-space-x-3 = ~12px overlap)

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setPanelHeight(entry.contentRect.height);

        // dynamically calculate maxStacked based on width
        const width = entry.contentRect.width;
        const possibleStacked = Math.floor(
          (width + AVATAR_MARGIN) / (AVATAR_SIZE - AVATAR_MARGIN)
        );
        setMaxStacked(possibleStacked > 0 ? possibleStacked : 1);
      }
    });
    if (panelRef.current) resizeObserver.observe(panelRef.current);

    return () => {
      if (panelRef.current) resizeObserver.unobserve(panelRef.current);
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
          className="w-full h-full bg-[#0a0a0a] border border-neutral-800 rounded-lg shadow-lg flex flex-col"
        >
          <div className="min-h-6 px-4 flex items-center text-gray-300 text-xs bg-[#111] border-b border-neutral-800">
            Active Users
          </div>

          {/* First user pinned */}
          {users.length > 0 && (
            <div className="flex items-center justify-between space-x-3 p-2 border-b border-neutral-800">
              <div className="flex items-center space-x-3">
                <img
                  src={getAvatarUrl(users[0].id)}
                  alt={users[0].name}
                  className="w-10 h-10 rounded-full border border-neutral-700"
                />
                <span className="text-gray-300 text-sm">{users[0].name}</span>
              </div>
              {users[0].mic ? (
                <Mic className="w-5 h-5 text-green-400/80" />
              ) : (
                <MicOff className="w-5 h-5 text-red-400/80" />
              )}
            </div>
          )}

          {/* Scrollable list for the rest */}
          <div className="flex-1 scrollable overflow-y-auto p-2">
            {users.slice(1).map((user, index) => (
              <div
                key={index}
                className="flex items-center justify-between space-x-3 mb-2"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={getAvatarUrl(user.id)}
                    alt={user.name}
                    className="w-10 h-10 rounded-full border border-neutral-700"
                  />
                  <span className="text-gray-300 text-sm">{user.name}</span>
                </div>
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
