const express = require("express");
const fetch = require("node-fetch");
const ChatSession = require("../models/ChatSession");
const router = express.Router();

// Helper function to generate title from message
const generateTitle = (message) => {
  const words = message.trim().split(' ');
  return words.slice(0, 5).join(' ') + (words.length > 5 ? '...' : '');
};

// Get all chat sessions for a user
router.get("/sessions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const sessions = await ChatSession.find({ userId })
      .sort({ lastUpdated: -1 })
      .select('sessionId title lastUpdated createdAt');
    
    res.json({ sessions });
  } catch (err) {
    console.error("Error fetching chat sessions:", err);
    res.status(500).json({ error: "Failed to fetch chat sessions" });
  }
});

// Get specific chat session
router.get("/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await ChatSession.findOne({ sessionId });
    
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    res.json({ session });
  } catch (err) {
    console.error("Error fetching chat session:", err);
    res.status(500).json({ error: "Failed to fetch chat session" });
  }
});

// Create new chat session
router.post("/session", async (req, res) => {
  try {
    const { userId, sessionId, title, messages } = req.body;
    
    const newSession = new ChatSession({
      userId,
      sessionId,
      title,
      messages,
      lastUpdated: new Date()
    });
    
    await newSession.save();
    res.json({ session: newSession });
  } catch (err) {
    console.error("Error creating chat session:", err);
    res.status(500).json({ error: "Failed to create chat session" });
  }
});

// Update chat session
router.put("/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { messages } = req.body;
    
    const updatedSession = await ChatSession.findOneAndUpdate(
      { sessionId },
      { messages, lastUpdated: new Date() },
      { new: true }
    );
    
    if (!updatedSession) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    res.json({ session: updatedSession });
  } catch (err) {
    console.error("Error updating chat session:", err);
    res.status(500).json({ error: "Failed to update chat session" });
  }
});

// Delete chat session
router.delete("/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const deletedSession = await ChatSession.findOneAndDelete({ sessionId });
    
    if (!deletedSession) {
      return res.status(404).json({ error: "Session not found" });
    }
    
    res.json({ message: "Session deleted successfully" });
  } catch (err) {
    console.error("Error deleting chat session:", err);
    res.status(500).json({ error: "Failed to delete chat session" });
  }
});

// Main chat endpoint
router.post("/chat", async (req, res) => {
  try {
    const { message, userId, sessionId, isNewSession } = req.body;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `User symptoms: ${message}.
Please provide a structured, easy-to-read response with:
- Clear headings (H2/H3 style) for each section
- Bullet points for remedies, yoga, and meditation
- Short paragraphs for explanations
- A disclaimer at the top
- Proper spacing between headings and content
Format the response in Markdown so it can be displayed in React with spacing.`
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    console.log("Gemini raw response:", JSON.stringify(data, null, 2));

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      (data?.error?.message
        ? `Gemini error: ${data.error.message}`
        : "Sorry, I couldn't find a suggestion.");

    // If it's a new session, create it in database
    if (isNewSession && userId) {
      const title = generateTitle(message);
      const newSessionId = sessionId || Date.now().toString();
      
      const initialMessages = [
        { 
          sender: "bot", 
          text: "👋 Hi, I'm your AI Health Assistant! Tell me your symptoms and I'll suggest home remedies, yoga, or meditation videos.", 
          time: new Date()
        },
        { sender: "user", text: message, time: new Date() },
        { sender: "bot", text: reply, time: new Date() }
      ];

      const newSession = new ChatSession({
        userId,
        sessionId: newSessionId,
        title,
        messages: initialMessages,
        lastUpdated: new Date()
      });

      await newSession.save();
      
      res.json({ 
        reply, 
        sessionId: newSessionId,
        title,
        session: newSession 
      });
    } 
    // If existing session, update it
    else if (sessionId && userId) {
      const session = await ChatSession.findOne({ sessionId });
      if (session) {
        session.messages.push(
          { sender: "user", text: message, time: new Date() },
          { sender: "bot", text: reply, time: new Date() }
        );
        session.lastUpdated = new Date();
        await session.save();
        
        res.json({ reply, session });
      } else {
        res.json({ reply });
      }
    } else {
      res.json({ reply });
    }
  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ error: "Failed to connect to AI service" });
  }
});

// Cleanup old sessions (manual trigger - you can also set up a cron job)
router.delete("/cleanup/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const result = await ChatSession.deleteMany({
      userId,
      createdAt: { $lt: weekAgo }
    });
    
    res.json({ 
      message: `Deleted ${result.deletedCount} old sessions`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error("Error cleaning up sessions:", err);
    res.status(500).json({ error: "Failed to cleanup sessions" });
  }
});

module.exports = router;