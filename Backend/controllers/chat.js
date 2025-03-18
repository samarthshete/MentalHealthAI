// src/controllers/chat.js

const dotenv = require("dotenv");
dotenv.config();
const { initHist } = require("../gemini/initHist.js");
const {
  initialEngagementPrompt,
  selfAssessmentPrompt,
  analysisInsightsPrompt,
  interventionsPrompt,
  professionalHelpPrompt,
} = require("../gemini/analysisPrompts.js");

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const MODEL_NAME = "gemini-1.5-pro";
const API_KEY = String(process.env.GEMINI_KEY);

// Stage-specific configuration for optimized responses
const conversationModes = {
  INITIAL_ENGAGEMENT: {
    temperature: 0.9, // Higher temperature for warmth and empathy
    maxOutputTokens: 1024,
  },
  ASSESSMENT: {
    temperature: 0.5, // Lower temperature for structured questioning
    maxOutputTokens: 1024,
  },
  ANALYSIS: {
    temperature: 0.3, // Lower for precise analysis
    maxOutputTokens: 2048,
  },
  INTERVENTIONS: {
    temperature: 0.7, // Balanced for creative yet practical solutions
    maxOutputTokens: 2048,
  },
  PROFESSIONAL_HELP: {
    temperature: 0.4, // Lower for responsible referrals
    maxOutputTokens: 1536,
  },
  DEFAULT: {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  },
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

let geminiModel;

const setupGeminiChat = async () => {
  const genAI = new GoogleGenerativeAI(API_KEY);
  geminiModel = genAI.getGenerativeModel({ model: MODEL_NAME });
};

/**
 * Enhanced chat starter with therapeutic stage support
 * @param {Array} history - Previous chat messages
 * @param {String} stage - Conversation stage (optional)
 * @param {Boolean} isFirstTimeUser - Whether this is a new user
 * @returns {Object} Configured Gemini chat session
 */
const startGeminiChat = (
  history = [],
  stage = null,
  isFirstTimeUser = false
) => {
  const conversationStage = stage || detectConversationStage(history);
  const config =
    conversationModes[conversationStage] || conversationModes.DEFAULT;

  const generationConfig = {
    temperature: config.temperature,
    topK: config.topK || 1,
    topP: config.topP || 1,
    maxOutputTokens: config.maxOutputTokens,
  };

  let chatHistory = [...initHist];

  // Add stage-specific system prompt if needed
  if (isFirstTimeUser && conversationStage === "INITIAL_ENGAGEMENT") {
    chatHistory.push({
      role: "user",
      parts: [{ text: initialEngagementPrompt }],
    });
    chatHistory.push({
      role: "model",
      parts: [{ text: "I'll create a warm, empathetic first interaction." }],
    });
  } else if (conversationStage === "ASSESSMENT" && history.length === 0) {
    chatHistory.push({
      role: "user",
      parts: [{ text: selfAssessmentPrompt }],
    });
    chatHistory.push({
      role: "model",
      parts: [{ text: "I'll guide them through the assessment steps." }],
    });
  }

  // Add user history
  chatHistory = [...chatHistory, ...history];

  return geminiModel.startChat({
    generationConfig,
    safetySettings,
    history: chatHistory,
  });
};

/**
 * Detects the current conversation stage based on message history
 * @param {Array} history - Chat history
 * @returns {String} Identified conversation stage
 */
const detectConversationStage = (history = []) => {
  if (!history.length) return "INITIAL_ENGAGEMENT";

  const userMessages = history.filter((msg) => msg.role === "user");
  const messageCount = userMessages.length;

  // Stage detection based on conversation length
  if (messageCount <= 2) return "INITIAL_ENGAGEMENT";
  if (messageCount <= 5) return "ASSESSMENT";
  if (messageCount <= 7) return "ANALYSIS";
  if (messageCount <= 10) return "INTERVENTIONS";
  return "PROFESSIONAL_HELP";
};

// Specialized therapeutic stage chat starters
const startInitialEngagementChat = (history = []) => {
  return startGeminiChat(history, "INITIAL_ENGAGEMENT", true);
};

const startAssessmentChat = (history = []) => {
  return startGeminiChat(history, "ASSESSMENT");
};

const startAnalysisInsightsChat = (history = []) => {
  return startGeminiChat(history, "ANALYSIS");
};

const startInterventionsChat = (history = []) => {
  return startGeminiChat(history, "INTERVENTIONS");
};

const startProfessionalHelpChat = (history = []) => {
  return startGeminiChat(history, "PROFESSIONAL_HELP");
};

module.exports = {
  setupGeminiChat,
  geminiModel,
  startGeminiChat,
  startInitialEngagementChat,
  startAssessmentChat,
  startAnalysisInsightsChat,
  startInterventionsChat,
  startProfessionalHelpChat,
  detectConversationStage,
};
