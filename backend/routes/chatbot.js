const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

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
        : "Sorry, I couldn’t find a suggestion.");

    res.json({ reply });
  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ error: "Failed to connect to AI service" });
  }
});

module.exports = router;
