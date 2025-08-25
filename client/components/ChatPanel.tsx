import { Send } from "lucide-react";

export default function ChatPanel() {
  return (
    <div className="h-full w-full flex flex-col border border-neutral-800 rounded-lg overflow-hidden bg-[#0a0a0a]">
      <div className="flex items-center h-10 bg-neutral-900 border-b border-neutral-800 px-4 text-gray-300">
        Explorer
      </div>
      <div className="flex-1 bg-neutral-950 p-4 overflow-y-auto">
        <p className="text-neutral-400">No messages yet.</p>
      </div>
      <div className="mt-2 flex w-full px-1">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 rounded-lg bg-neutral-800 text-white border border-neutral-700"
        />
        <button className="ml-2 p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex justify-center items-center">
          <Send size={20}/>
        </button>
      </div>
    </div>
  );
}
