import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import API from "../utils/api";

export default function AiChatbotPage() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Hi, I’m your AI Health Assistant! Tell me your symptoms and I’ll suggest home remedies, yoga, or meditation videos." }
  ]);
  const [input, setInput] = useState("");
  const [loadingReply, setLoadingReply] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoadingReply(true);

    try {
      const res = await API.post("/chatbot/chat", { message: input });
      const botMsg = { sender: "bot", text: res.data.reply };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { sender: "bot", text: "⚠️ Error getting response" }]);
    } finally {
      setLoadingReply(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center p-6">
      {/* Header */}
      <h1 className="text-3xl font-bold text-white mb-6">
        🤖 AI Health Assistant
      </h1>

      {/* Chat Section */}
      <div className="w-full max-w-3xl bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-6 flex flex-col h-[75vh]">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-4 max-w-2xl rounded-xl ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white self-end ml-auto"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {msg.sender === "bot" ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: (props) => <h1 className="text-xl font-bold mt-2 mb-2" {...props} />,
                    h2: (props) => <h2 className="text-lg font-bold mt-2 mb-2" {...props} />,
                    p: (props) => <p className="mt-1 mb-1 leading-relaxed" {...props} />,
                    li: (props) => <li className="ml-5 list-disc" {...props} />,
                    strong: (props) => <strong className="font-semibold" {...props} />,
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              ) : (
                msg.text
              )}
            </div>
          ))}
          {loadingReply && <p className="text-gray-400">Bot is typing...</p>}
        </div>

        {/* Input */}
        <div className="mt-4 flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your symptoms..."
            className="flex-1 border border-gray-300 rounded-l-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-6 rounded-r-xl hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
