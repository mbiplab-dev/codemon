import React from "react";
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

const ActiveUsers = ({ users = activeUsers }) => {
  const getAvatarUrl = (id) => `https://avatar.iran.liara.run/public/${id}`;

  return (
    <div className="w-full h-full bg-[#0a0a0a] border border-neutral-800 rounded-lg flex flex-col">
      {/* Header */}
      <div className="min-h-6 px-4 flex items-center text-gray-300 text-xs bg-[#111] border-b border-neutral-800">
        Active Users
      </div>

      {/* Full scrollable list */}
      <div className="flex-1 scrollable overflow-y-auto p-2">
        {users.map((user, index) => (
          <div
            key={index}
            className="flex items-center justify-between space-x-3 mb-2 border-b border-neutral-800 pb-2 last:border-none"
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
  );
};

export default ActiveUsers;
