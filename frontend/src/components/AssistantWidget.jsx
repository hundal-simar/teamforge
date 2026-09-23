import { useState } from "react";
import ChatWindow from "./ChatWindow";

export default function AssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center text-xl transition-colors"
        aria-label={isOpen ? "Close assistant" : "Open assistant"}
      >
        {isOpen ? "×" : "✨"}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] h-[520px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-8rem)] bg-zinc-900/95 backdrop-blur border border-zinc-800 rounded-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-zinc-100 font-medium text-sm">TeamForge Assistant</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-zinc-500 hover:text-zinc-200 text-lg leading-none transition-colors"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="flex-1 min-h-0">
            <ChatWindow />
          </div>
        </div>
      )}
    </>
  );
}
