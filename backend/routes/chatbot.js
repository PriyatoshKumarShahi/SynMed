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

// Enhanced query categorization
function categorizeQuery(message) {
  const lowerMsg = message.toLowerCase();
  
  // Physical symptoms/medical
  const medicalKeywords = [
    "fever", "temperature", "pain", "cough", "cold", "headache", "dizzy", "nausea", 
    "vomit", "injury", "infection", "sore", "doctor", "medicine", "tablet", "capsule", 
    "treatment", "symptom", "health problem", "prescription", "diagnosis", "surgery", 
    "fracture", "allergy", "sick", "ill", "hurt", "ache", "swollen", "bleeding",
    "rash", "itching", "breathing", "chest pain", "stomach", "diarrhea", "constipation"
  ];
  
  // Mental health/emotional
  const mentalHealthKeywords = [
    "stress", "anxiety", "depression", "worried", "panic", "overwhelmed", "sad", 
    "lonely", "angry", "frustrated", "mood", "emotional", "mental health", "therapy",
    "counseling", "fear", "phobia", "trauma", "grief", "loss", "relationship", 
    "breakup", "family issues", "work stress", "burnout", "insomnia", "sleep"
  ];
  
  // Lifestyle/wellness
  const lifestyleKeywords = [
    "diet", "nutrition", "exercise", "fitness", "weight", "healthy lifestyle", 
    "meditation", "yoga", "mindfulness", "habits", "routine", "energy", "tired",
    "fatigue", "productivity", "motivation", "self care", "wellness"
  ];
  
  // General conversation
  const generalKeywords = [
    "hello", "hi", "how are you", "what can you do", "help", "advice", "guidance",
    "question", "curious", "wondering", "explain", "tell me", "information"
  ];
  
  if (medicalKeywords.some(word => lowerMsg.includes(word))) {
    return "medical";
  } else if (mentalHealthKeywords.some(word => lowerMsg.includes(word))) {
    return "mental_health";
  } else if (lifestyleKeywords.some(word => lowerMsg.includes(word))) {
    return "lifestyle";
  } else if (generalKeywords.some(word => lowerMsg.includes(word))) {
    return "general";
  }
  
  return "general"; // Default
}

// Generate context-specific prompt
function generatePrompt(message, category) {
  const baseInstruction = `You are a compassionate AI Health and Wellness Assistant. Respond warmly and empathetically to the user's message: "${message}"`;
  
  let specificGuidance = "";
  
  switch(category) {
    case "medical":
      specificGuidance = `
**Focus on Physical Health:**
- Address the specific symptom or health concern mentioned
- Provide practical home remedies and immediate relief measures
- Suggest when to see a healthcare professional
- Include lifestyle modifications related to the condition
- Use clear headings like "Immediate Relief", "Home Remedies", "When to See a Doctor"
- Be specific to the symptom mentioned`;
      break;
      
    case "mental_health":
      specificGuidance = `
**Focus on Mental Health & Emotional Support:**
- Address the emotional concern or stress mentioned
- Provide coping strategies and mental health techniques
- Include breathing exercises, mindfulness, or relaxation methods
- Offer counseling approaches and self-care tips
- Use headings like "Understanding Your Feelings", "Coping Strategies", "Self-Care Tips"
- Be empathetic and supportive`;
      break;
      
    case "lifestyle":
      specificGuidance = `
**Focus on Lifestyle & Wellness:**
- Address the lifestyle aspect mentioned (diet, exercise, habits, etc.)
- Provide practical lifestyle changes and wellness tips
- Include sustainable habits and routine suggestions
- Offer motivational guidance
- Use headings related to the specific lifestyle area mentioned`;
      break;
      
    case "general":
    default:
      specificGuidance = `
**Provide General Guidance:**
- Respond to the specific question or concern raised
- Be conversational and helpful
- Provide relevant information based on what they're asking
- Keep response focused on their actual query`;
      break;
  }
  
  return `${baseInstruction}

${specificGuidance}

**Response Format:**
- Use clear headings (## for main sections, ### for subsections)
- Provide bullet points for actionable advice
- Keep response focused and specific to their question
- Maintain a warm, conversational tone
- Format in Markdown with proper spacing`;
}

function isMedicalQuery(message) {
  return categorizeQuery(message) === "medical";
}

router.post("/chat", async (req, res) => {
  try {
    const { message, userId, sessionId, isNewSession } = req.body;

    // Categorize the query to provide targeted response
    const queryCategory = categorizeQuery(message);
    const prompt = generatePrompt(message, queryCategory);

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
                  text: prompt
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
          text: "Hello there! I'm your AI Health and Wellness Assistant. I'm here to support you with physical health, stress management, emotional wellbeing, and lifestyle guidance. How can I help you today?", 
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
    res.status(500).json({ 
      error: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment."
    });
  }
});

// Cleanup old sessions
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