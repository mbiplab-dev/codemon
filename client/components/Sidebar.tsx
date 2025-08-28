import React, { useState, useEffect } from "react";
import { Files, Search, Users, User, Settings, MessageSquare } from "lucide-react";

interface SidebarProps {
  activeTab: "explorer" | "users" | "search" | "chat";
  setActiveTab: (tab: "explorer" | "users" | "search" | "chat") => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Load saved dropdown state on client
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDropdown = localStorage.getItem("activeDropdown");
      if (savedDropdown) setActiveDropdown(savedDropdown);
    }
  }, []);

  // Persist dropdown state
  useEffect(() => {
    if (activeDropdown) {
      localStorage.setItem("activeDropdown", activeDropdown);
    } else {
      localStorage.removeItem("activeDropdown");
    }
  }, [activeDropdown]);

  const topIcons = [
    { icon: Files, label: "Explorer", key: "explorer" },
    { icon: Search, label: "Search", key: "search" },
    { icon: Users, label: "Users", key: "users" },
    { icon: MessageSquare, label: "Chat", key: "chat" },
  ];

  const bottomIcons = [
    { icon: User, label: "Profile", key: "profile" },
    { icon: Settings, label: "Settings", key: "settings" },
  ];

  const toggleDropdown = (key: string) => {
    setActiveDropdown(activeDropdown === key ? null : key);
  };

  return (
    <div className="relative h-full w-full bg-[#0a0a0a] border border-neutral-800 rounded-lg flex flex-col justify-between shadow-lg">
      {/* Top section */}
      <div className="flex flex-col items-center py-1 space-y-1">
        {topIcons.map(({ icon: Icon, label, key }) => (
          <div key={key} className="relative w-full flex justify-center">
            <button
              onClick={() => setActiveTab(key as any)}
              className={`group p-2 m-1 w-full flex justify-center rounded-lg transition ${
                activeTab === key ? "bg-neutral-800" : ""
              }`}
              title={label}
            >
              <Icon
                className={`w-6 h-6 ${
                  activeTab === key
                    ? "text-orange-500"
                    : "text-neutral-300 group-hover:text-orange-500/80"
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {/* Bottom section with dropdowns */}
      <div className="flex flex-col items-center py-1 space-y-1">
        {bottomIcons.map(({ icon: Icon, label, key }) => (
          <div key={key} className="relative w-full flex justify-center">
            <button
              onClick={() => toggleDropdown(key)}
              className="group p-2 m-1 w-full flex justify-center rounded-lg transition"
              title={label}
            >
              <Icon
                className={`w-6 h-6 ${
                  activeDropdown === key
                    ? "text-orange-500"
                    : "text-neutral-300 group-hover:text-orange-500/80"
                }`}
              />
            </button>

            {/* Side Dropdown */}
            {activeDropdown === key && (
              <div className="absolute left-14 bottom-0 mb-2 w-48 bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg p-2 z-50">
                {key === "profile" ? (
                  <div>
                    <p className="text-sm text-white mb-2">Signed in as</p>
                    <p className="text-orange-500 text-sm font-semibold mb-4">Your Name</p>
                    <button className="w-full text-left text-neutral-300 hover:text-orange-500 py-1">
                      View Profile
                    </button>
                    <button className="w-full text-left text-neutral-300 hover:text-orange-500 py-1">
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-white mb-2">Settings</p>
                    <button className="w-full text-left text-neutral-300 hover:text-orange-500 py-1">
                      Preferences
                    </button>
                    <button className="w-full text-left text-neutral-300 hover:text-orange-500 py-1">
                      Theme
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
