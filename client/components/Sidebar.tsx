import React from "react";
import { Files, Search, User, Settings } from "lucide-react";

const Sidebar = () => {
  const topIcons = [
    { icon: Files, label: "Explorer" },
    { icon: Search, label: "Search" },
  ];

  const bottomIcons = [
    { icon: User, label: "Profile" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <div className="h-full w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg flex flex-col justify-between shadow-lg">
      {/* Top section */}
      <div className="flex flex-col items-center py-1 space-y-1">
        {topIcons.map(({ icon: Icon, label }, i) => (
          <div key={i} className="group relative w-full flex justify-center">
            <button className="p-2 m-1 w-full flex justify-center rounded-lg transition">
              <Icon className="text-neutral-300 group-hover:text-orange-500/80 w-6 h-6" />
            </button>
            {/* Tooltip */}
            <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-neutral-900 text-white text-l border border-orange-500/80 rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition whitespace-nowrap shadow-lg">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom section */}
      <div className="flex flex-col items-center py-1 space-y-1">
        {bottomIcons.map(({ icon: Icon, label }, i) => (
          <div key={i} className="group relative w-full flex justify-center">
            <button className="p-2 m-1 w-full flex justify-center rounded-lg transition">
              <Icon className="text-neutral-300 group-hover:text-orange-500/80 w-6 h-6" />
            </button>
            {/* Tooltip */}
            <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-neutral-900 text-white text-l border border-orange-500/80 rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition whitespace-nowrap shadow-lg">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
