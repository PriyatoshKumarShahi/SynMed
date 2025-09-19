const mongoose = require("mongoose");

const chatSessionSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true, 
    index: true 
  },
  sessionId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  messages: [{
    sender: { 
      type: String, 
      enum: ['user', 'bot'], 
      required: true 
    },
    text: { 
      type: String, 
      required: true 
    },
    time: { 
      type: Date, 
      default: Date.now 
    }
  }],
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    expires: 604800 // Auto-delete after 7 days (604800 seconds)
  }
});

// Index for better query performance
chatSessionSchema.index({ userId: 1, lastUpdated: -1 });
chatSessionSchema.index({ sessionId: 1 });

const ChatSession = mongoose.model("ChatSession", chatSessionSchema);

module.exports = ChatSession;