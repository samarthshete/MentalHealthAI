const dotenv = require("dotenv");
dotenv.config();
const { startGeminiChat } = require("../gemini/chat.js");

/**
 * Fetch an article generated from provided keywords using Gemini AI.
 * Expects an array of keywords in req.body.keywords.
 */
const fetchArticleFromKeywords = async (req, res) => {
  try {
    // Ensure the user is authenticated
    if (!req.userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Validate that keywords are provided
    const { keywords } = req.body;
    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      return res.status(400).json({ error: "No keywords provided" });
    }

    // Construct a prompt using the keywords
    const prompt = `Write a detailed, informative article about the following topics: ${keywords.join(
      ", "
    )}.`;

    // Initialize Gemini chat session and send the prompt
    const chat = startGeminiChat();
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const articleText = response.text();

    // Return the generated article
    res.status(200).json({ article: articleText });
  } catch (error) {
    console.error("Error fetching article:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { fetchArticleFromKeywords };
