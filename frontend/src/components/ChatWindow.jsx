import { useState, useRef, useEffect } from "react";
import api from "../api/axios.js"

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || isLoading) return;
    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
  const res = await api.post("/chat/assistant", {
    message: userMsg.content,
    conversationId
  });

  const data = res.data;

  setConversationId(data.conversationId);

  setMessages(prev => [
    ...prev,
    {
      role: "model",
      content: data.reply,
      toolsUsed: data.toolsUsed?.filter(
        t => t.result?.success
      )
    }
  ]);
} catch (e) {
  console.error(e);
  setError("Something went wrong. Please try again.");
} finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {messages.length === 0 && !isLoading && (
          <p className="text-zinc-500 text-sm">
            Ask about your project, or try “create a task to review the PR”.
          </p>
        )}

        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
            <span
              className={`inline-block px-3 py-2 rounded-lg text-sm max-w-[85%] text-left ${
                m.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-800 text-zinc-100"
              }`}
            >
              {m.content}
            </span>

            {m.toolsUsed?.length > 0 && (
              <div className="mt-1 space-y-0.5">
                {m.toolsUsed.map((t, j) => (
                  <div key={j} className="text-xs text-emerald-400">
                    {t.name === "createTask"
                      ? `✓ Created task: ${t.result.title}`
                      : `✓ Found ${t.result.count} task(s)`}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && <div className="text-zinc-500 text-sm">Assistant is typing…</div>}
        {error && <div className="text-red-400 text-sm">{error}</div>}
        <div ref={bottomRef} />
      </div>

      <div className="flex p-2 border-t border-zinc-800">
        <input
          className="flex-1 bg-zinc-800 text-zinc-100 text-sm px-3 py-2 rounded-l-lg outline-none placeholder:text-zinc-500 focus:ring-1 focus:ring-indigo-500"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          disabled={isLoading}
          placeholder="Ask something…"
        />
        <button
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-4 rounded-r-lg disabled:opacity-50 transition-colors"
          onClick={sendMessage}
          disabled={isLoading}
        >
          Send
        </button>
      </div>
    </div>
  );
}
