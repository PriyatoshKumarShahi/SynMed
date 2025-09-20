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

function isMedicalQuery(message) {
  const medicalKeywords = [
    "pain", "fever", "cough", "cold", "headache", "dizzy", "nausea", 
    "vomit", "injury", "infection", "sore", "doctor", "medicine", 
    "tablet", "capsule", "treatment", "symptom", "health problem",
    "prescription", "diagnosis", "surgery", "fracture", "allergy"
  ];
  const lowerMsg = message.toLowerCase();
  return medicalKeywords.some(word => lowerMsg.includes(word));
}

router.post("/chat", async (req, res) => {
  try {
    const { message, userId, sessionId, isNewSession } = req.body;

    // ⚠️ Disclaimer text
    const disclaimer = "\n\n⚠️ **Disclaimer:** This is only general advice and should not be considered a substitute for professional medical consultation. Please visit your nearest doctor and follow prescribed treatment.";

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
                  text: `You are a compassionate AI Health and Wellness Assistant. Respond warmly and empathetically to the user's message: "${message}"

**Your Role:**
- Be a supportive companion for health, wellness, mental health, and general life guidance
- Provide holistic support including physical, mental, and emotional wellbeing
- Offer practical solutions, remedies, lifestyle advice, and emotional support
- Be conversational, understanding, and non-judgmental

**Response Guidelines:**
- Start with acknowledgment and empathy
- Provide structured, helpful advice using clear headings and bullet points
- Include multiple approaches: physical remedies, mental health techniques, lifestyle changes
- For stress/anxiety: Include breathing exercises, mindfulness, relaxation techniques
- For physical symptoms: Suggest natural remedies, lifestyle modifications, when to see a doctor
- For emotional concerns: Offer counseling techniques, coping strategies, self-care tips
- Add disclaimer only if it’s a medical/physical health concern
- End with encouragement and offer ongoing support

**Format your response in Markdown with:**
- Clear headings (## for main sections, ### for subsections)
- Bullet points for actionable advice
- Proper spacing between sections
- Warm, conversational tone throughout`
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    console.log("Gemini raw response:", JSON.stringify(data, null, 2));

    let reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      (data?.error?.message
        ? `I apologize, but I'm experiencing some technical difficulties right now. ${data.error.message}. Please try again in a moment.`
        : "I'm here to help, but I'm having trouble processing your message right now. Could you please try again?");

    // 👉 Append disclaimer only for medical-type queries
    if (isMedicalQuery(message)) {
      reply += disclaimer;
    }

    if (isNewSession && userId) {
      const title = generateTitle(message);
      const newSessionId = sessionId || Date.now().toString();

      const initialMessages = [
        { 
          sender: "bot", 
          text: "Hello there! I'm your AI Health and Wellness Assistant. I'm here to support you with physical health, stress management, emotional wellbeing, and lifestyle guidance. How can I help you today?" + (isMedicalQuery(message) ? disclaimer : ""), 
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
    // Existing session
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

    const disclaimer = "\n\n⚠️ **Disclaimer:** This is only general advice and should not be considered a substitute for professional medical consultation. Please visit your nearest doctor and follow prescribed treatment.";

    res.status(500).json({ 
      error: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment." + disclaimer 
    });
  }
});

module.exports = router;


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