import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import API from "../utils/api";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";

export default function AiChatbotPage() {
  // Get user ID (you might get this from auth context/localStorage)
  const userId = localStorage.getItem("userId") || `user-${Date.now()}`;
  
  const [chatSessions, setChatSessions] = useState([]);
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
  
  // Speech recognition states
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const speechSynthesisRef = useRef(null);

  // Save userId to localStorage if it's new
  useEffect(() => {
    if (!localStorage.getItem("userId")) {
      localStorage.setItem("userId", userId);
    }
  }, [userId]);

  // Load chat sessions from database
  useEffect(() => {
    loadChatSessions();
    initializeSpeechRecognition();
  }, []);

  // Load chat sessions from database
  const loadChatSessions = async () => {
    try {
      const response = await API.get(`/chatbot/sessions/${userId}`);
      setChatSessions(response.data.sessions || []);
    } catch (error) {
      console.error("Error loading chat sessions:", error);
    }
  };

  // Initialize Speech Recognition
  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  };

  // Start listening
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  // Text to Speech
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Load a chat session from database
  const loadChatSession = async (sessionId) => {
    try {
      const response = await API.get(`/chatbot/session/${sessionId}`);
      if (response.data.session) {
        setMessages(response.data.session.messages);
        setCurrentSessionId(sessionId);
      }
    } catch (error) {
      console.error("Error loading chat session:", error);
    }
  };

  // Delete a chat session from database
  const deleteSession = async (sessionId) => {
    try {
      await API.delete(`/chatbot/session/${sessionId}`);
      setChatSessions(prev => prev.filter(s => s.sessionId !== sessionId));
      
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
      toast.success("Chat deleted successfully!")
    } catch (error) {
      toast.error("Failed to delete chat!")
      console.error("Error deleting session:", error);
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
      const isNewSession = !currentSessionId;
      const sessionId = currentSessionId || Date.now().toString();
      
      const response = await API.post("/chatbot/chat", { 
        message: input,
        userId,
        sessionId,
        isNewSession
      });

      const botMsg = { sender: "bot", text: response.data.reply, time: new Date().toISOString() };
      const finalMessages = [...newMessages, botMsg];
      setMessages(finalMessages);

      // If new session was created, update the UI
      if (isNewSession && response.data.sessionId) {
        setCurrentSessionId(response.data.sessionId);
        // Reload sessions to show the new one
        loadChatSessions();
      }

      // Auto-speak the bot response (optional)
      // speakText(response.data.reply);
      
    } catch (err) {
      console.error(err);
      const errorMsg = { sender: "bot", text: "⚠️ Error getting response", time: new Date().toISOString() };
      const finalMessages = [...newMessages, errorMsg];
      setMessages(finalMessages);
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
                    key={session.sessionId}
                    className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      currentSessionId === session.sessionId 
                        ? 'bg-blue-100 border border-blue-300' 
                        : 'bg-white border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div 
                      onClick={() => loadChatSession(session.sessionId)}
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
                        deleteSession(session.sessionId);
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
        <main className="flex-1 flex flex-col mt-12 bg-white ml-80">
          {/* Chat Messages */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="w-full space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex   ${msg.sender === "user" ? "justify-end " : "justify-start"}`}
                >
                  <div className="flex  items-start space-x-2 max-w-[80%]">
                    <div
                      className={`p-1  rounded-2xl ${
                        msg.sender === "user"
                          ? "bg-gray-100 text-gray "
                          : "bg-gray-100 text-gray-900 border border-gray-200"
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
  <div 
    className="whitespace-pre-wrap  text-gray px-2 py- rounded-1xl max-w-[100%] "
  >
    {msg.text}
  </div>
)}

                      <div className={`text-xs mt-1 ${msg.sender === "user" ? "text-gray-500 text-right" : "text-gray-500"}`}>
  {new Date(msg.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
</div>

                    </div>
                    
                    {/* Speaker button for bot messages */}
                    {msg.sender === "bot" && (
                      <button
                        onClick={() => isSpeaking ? stopSpeaking() : speakText(msg.text)}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                        title={isSpeaking ? "Stop speaking" : "Read aloud"}
                      >
                        {isSpeaking ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-6.219-8.56" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M9 9v6l4-3-4-3z" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {loadingReply && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 border border-gray-200 p-4 rounded-2xl max-w-[80%]">
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
                {/* Microphone Button */}
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`p-3 rounded-full transition-colors ${
                    isListening 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={isListening ? "Stop listening" : "Start voice input"}
                >
                  {isListening ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-6.219-8.56" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  )}
                </button>

                <div className="flex-1">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isListening ? "Listening..." : "Enter your symptoms or health questions..."}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32"
                    rows="1"
                    style={{ minHeight: '44px' }}
                    disabled={isListening}
                  />
                </div>
                
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loadingReply || isListening}
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