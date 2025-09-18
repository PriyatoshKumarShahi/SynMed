import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import API from "../utils/api";
import Navbar from "../components/Navbar";

export default function AiChatbotPage() {
  const [chatSessions, setChatSessions] = useState(() => {
    const saved = localStorage.getItem("chatSessions");
    if (!saved) return [];
    
    const parsed = JSON.parse(saved);
    // Auto-delete chats older than 7 days
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return parsed.filter((session) => new Date(session.lastUpdated).getTime() > weekAgo);
  });

  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([
    { 
      sender: "bot", 
      text: "👋 Hi, I'm your AI Health Assistant! Tell me your symptoms and I'll suggest home remedies, yoga, or meditation videos.", 
      time: new Date().toISOString() 
    }
  ]);
  const [input, setInput] = useState("");
  const [loadingReply, setLoadingReply] = useState(false);

  // Save chat sessions to localStorage
  useEffect(() => {
    localStorage.setItem("chatSessions", JSON.stringify(chatSessions));
  }, [chatSessions]);

  // Generate a title from the first user message
  const generateTitle = (message) => {
    const words = message.trim().split(' ');
    return words.slice(0, 5).join(' ') + (words.length > 5 ? '...' : '');
  };

  // Create a new chat session
  const createNewSession = (userMessage, botResponse) => {
    const sessionId = Date.now().toString();
    const title = generateTitle(userMessage);
    const newSession = {
      id: sessionId,
      title,
      messages: [
        { sender: "bot", text: "👋 Hi, I'm your AI Health Assistant! Tell me your symptoms and I'll suggest home remedies, yoga, or meditation videos.", time: new Date().toISOString() },
        { sender: "user", text: userMessage, time: new Date().toISOString() },
        { sender: "bot", text: botResponse, time: new Date().toISOString() }
      ],
      lastUpdated: new Date().toISOString()
    };
    
    setChatSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(sessionId);
    return newSession;
  };

  // Update existing session
  const updateSession = (sessionId, newMessages) => {
    setChatSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, messages: newMessages, lastUpdated: new Date().toISOString() }
          : session
      )
    );
  };

  // Load a chat session
  const loadChatSession = (sessionId) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setMessages(session.messages);
      setCurrentSessionId(sessionId);
    }
  };

  // Delete a chat session
  const deleteSession = (sessionId) => {
    setChatSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
      setMessages([
        { 
          sender: "bot", 
          text: "👋 Hi, I'm your AI Health Assistant! Tell me your symptoms and I'll suggest home remedies, yoga, or meditation videos.", 
          time: new Date().toISOString() 
        }
      ]);
    }
  };

  // Start new chat
  const startNewChat = () => {
    setCurrentSessionId(null);
    setMessages([
      { 
        sender: "bot", 
        text: "👋 Hi, I'm your AI Health Assistant! Tell me your symptoms and I'll suggest home remedies, yoga, or meditation videos.", 
        time: new Date().toISOString() 
      }
    ]);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const timestamp = new Date().toISOString();
    const userMsg = { sender: "user", text: input, time: timestamp };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoadingReply(true);

    try {
      const res = await API.post("/chatbot/chat", { message: input });
      const botMsg = { sender: "bot", text: res.data.reply, time: new Date().toISOString() };
      const finalMessages = [...newMessages, botMsg];
      setMessages(finalMessages);

      // If this is a new chat (no current session), create a new session
      if (!currentSessionId) {
        createNewSession(input, res.data.reply);
      } else {
        // Update existing session
        updateSession(currentSessionId, finalMessages);
      }
    } catch (err) {
      console.error(err);
      const errorMsg = { sender: "bot", text: "⚠️ Error getting response", time: new Date().toISOString() };
      const finalMessages = [...newMessages, errorMsg];
      setMessages(finalMessages);
      
      if (currentSessionId) {
        updateSession(currentSessionId, finalMessages);
      }
    } finally {
      setLoadingReply(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Navbar */}
      <Navbar />

      <div className="flex flex-1">
        {/* Sidebar: Chat History */}
        <aside className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col fixed left-0 top-0 h-full pt-16 z-10">
          {/* New Chat Button */}
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={startNewChat}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + New Chat
            </button>
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Chat History</h2>
            
            {chatSessions.length === 0 ? (
              <p className="text-gray-500 text-sm">No chat history yet</p>
            ) : (
              <div className="space-y-2">
                {chatSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      currentSessionId === session.id 
                        ? 'bg-blue-100 border border-blue-300' 
                        : 'bg-white border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div 
                      onClick={() => loadChatSession(session.id)}
                      className="flex-1 min-w-0"
                    >
                      <p className="font-medium text-gray-900 truncate text-sm">
                        {session.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(session.lastUpdated).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 ml-2 p-1 text-red-500 hover:text-red-700 transition-all"
                      title="Delete chat"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Chat Container */}
        <main className="flex-1 flex flex-col mt-14 bg-white ml-80">
          {/* Chat Messages */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="w-full space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`p-4 rounded-2xl ${
                      msg.sender === "user"
                        ? "bg-gray-100 text-gray-800 w-2/5 max-w-4xl"
                        : "bg-gray-100 text-gray-900 border border-gray-200 w-4/5 max-w-4xl"
                    }`}
                  >
                    {msg.sender === "bot" ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: (props) => <h1 className="text-xl font-bold my-2" {...props} />,
                          h2: (props) => <h2 className="text-lg font-bold my-2" {...props} />,
                          h3: (props) => <h3 className="text-md font-bold my-2" {...props} />,
                          p: (props) => <p className="my-1 leading-relaxed" {...props} />,
                          ul: (props) => <ul className="list-disc list-inside my-2" {...props} />,
                          ol: (props) => <ol className="list-decimal list-inside my-2" {...props} />,
                          li: (props) => <li className="my-1" {...props} />,
                          strong: (props) => <strong className="font-semibold" {...props} />,
                          em: (props) => <em className="italic" {...props} />,
                          code: (props) => <code className="bg-gray-200 px-1 py-0.5 rounded text-sm" {...props} />,
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    )}
                    <div className={`text-xs mt-2 ${msg.sender === "user" ? "text-gray-400" : "text-gray-500"}`}>
                      {new Date(msg.time).toLocaleTimeString([], { 
                        hour: "2-digit", 
                        minute: "2-digit" 
                      })}
                    </div>
                  </div>
                </div>
              ))}
              
              {loadingReply && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 border border-gray-200 p-4 rounded-2xl w-4/5 max-w-4xl">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-gray-500 text-sm">AI is typing...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Input Section */}
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your symptoms or health questions..."
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32"
                    rows="1"
                    style={{ minHeight: '44px' }}
                  />
                </div>
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loadingReply}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center space-x-2"
                >
                  <span>Send</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}