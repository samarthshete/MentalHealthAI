// Backend/controllers/analysis.js
const dotenv = require("dotenv");
dotenv.config();
const axios = require("axios");
const { startGeminiChat } = require("../gemini/chat.js");
const chatHistModel = require("../models/ChatHist.js");
const {
  analysisReportPrompt,
  analysisScorePrompt,
  analysisKeywordsPrompt,
  sleepAnalysisPrompt,
} = require("../gemini/analysisPrompts.js");
const Report = require("../models/Report.js");
const User = require("../models/User.js");
const MoodEntry = require("../models/MoodEntry.js");
const SleepAssessment = require("../models/SleepAssessment.js");

/**
 * Generates an analysis of sleep data for healthcare professionals.
 */
const generateSleepAnalysis = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "UserId not found" });
    }
    const sleepData = await SleepAssessment.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(7);
    if (sleepData.length === 0) {
      return res.status(200).json({ message: "No sleep data available" });
    }
    const sleepHistoryText = sleepData
      .map(
        (entry, index) =>
          `Day ${index + 1}: Slept ${entry.sleepHours} hours, Quality: ${
            entry.sleepQuality
          }/5, Mood: ${entry.mood}, Stress Level: ${entry.stressLevel}`
      )
      .join("\n");

    const chat = startGeminiChat();
    const result = await chat.sendMessage(
      sleepAnalysisPrompt + "\n\n" + sleepHistoryText
    );
    const analysis = (await result.response).text();

    res.status(200).json({ analysis });
  } catch (error) {
    console.error("Error generating sleep analysis:", error);
    res.status(500).json({
      message: "Error generating sleep analysis",
      error: error.message,
    });
  }
};

/**
 * Creates a comprehensive mental health analysis report.
 */
const doAnalysis = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ msg: "UserId not found" });
    }
    const analysis = await genAnalysis(req.userId);
    if (analysis?.info === "nodata") {
      return res.status(200).json({ msg: "nochatdata" });
    }

    const sleepData = await SleepAssessment.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(7);

    let sleepAnalysisResult = null;
    if (sleepData.length > 0) {
      const sleepHistoryText = sleepData
        .map(
          (entry, index) =>
            `Day ${index + 1}: Slept ${entry.sleepHours} hours, Quality: ${
              entry.sleepQuality
            }/5, Mood: ${entry.mood}, Stress Level: ${entry.stressLevel}`
        )
        .join("\n");
      const chat = startGeminiChat();
      const result = await chat.sendMessage(
        sleepAnalysisPrompt + "\n\n" + sleepHistoryText
      );
      sleepAnalysisResult = (await result.response).text();
    }

    const reportDatas = await Report.create({
      userId: req.userId,
      keywords: analysis.keywords,
      analysis: analysis.report,
      score: analysis.score,
      sleepAnalysis: sleepAnalysisResult,
      conversationStage: "ANALYSIS",
    });

    await MoodEntry.create({
      userId: req.userId,
      moodScore: Math.ceil(11 - parseInt(analysis.score, 10)) / 2,
      energyLevel: Math.ceil(11 - parseInt(analysis.score, 10)) / 2,
      stressLevel: Math.ceil(parseInt(analysis.score, 10)) / 2,
      tags: analysis.keywords.slice(0, 5),
      notes: "Generated from mental health analysis",
    });

    try {
      const user = await User.findOne({ id: req.userId });
      if (user && user.email) {
        axios.post("https://mindmate-email-api.onrender.com/welcomeEmail", {
          emailId: user.email,
          score: analysis.score,
          analysis: analysis.report,
          keywords: analysis.keywords,
          sleepAnalysis: sleepAnalysisResult,
        });
      }
    } catch (error) {
      console.log("Error sending the email:", error.message);
    }

    res.status(200).json({ data: reportDatas });
  } catch (error) {
    console.error("Error in doAnalysis:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

/**
 * Generates mental health analysis based on chat history.
 */
const getAnalysis = async (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }
    const foundHist = await chatHistModel
      .find({ userId })
      .sort({ timestamp: 1 });
    if (foundHist.length === 0) {
      return { info: "nodata" };
    }
    let foundHistForGemini = [];
    for (let conv of foundHist) {
      foundHistForGemini.push({ role: "user", parts: [{ text: conv.prompt }] });
      foundHistForGemini.push({
        role: "model",
        parts: [{ text: conv.response }],
      });
    }
    let chat = startGeminiChat(foundHistForGemini);
    let result = await chat.sendMessage(analysisReportPrompt);
    let report = (await result.response).text();
    chat = startGeminiChat(foundHistForGemini);
    result = await chat.sendMessage(analysisScorePrompt);
    const score = (await result.response).text().replace(/\D/g, "");
    chat = startGeminiChat(foundHistForGemini);
    result = await chat.sendMessage(analysisKeywordsPrompt);
    const keywordsResp = (await result.response).text();
    const keywords = keywordsResp
      .replace(/[^a-zA-Z0-9 \n]/g, "")
      .trim()
      .split("\n")
      .map((kw) => kw.trim())
      .filter(
        (kw) =>
          kw.length !== 0 &&
          kw.toLowerCase() !== "keyword" &&
          kw.toLowerCase() !== "keywords"
      );
    return { report, score, keywords };
  } catch (error) {
    console.error("Error in genAnalysis:", error);
    throw error;
  }
};

/**
 * Initiates the therapeutic journey with a welcome message.
 */
const startTherapeuticJourney = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "UserId not found" });
    }
    const chatHistory = await chatHistModel.find({ userId: req.userId });
    let chat = startGeminiChat(
      [],
      "INITIAL_ENGAGEMENT",
      chatHistory.length === 0
    );
    let result = await chat.sendMessage(
      "Generate a warm, empathetic welcome message for a healthcare professional beginning their mental health journey. Acknowledge the unique stresses they face."
    );
    let welcomeMessage = (await result.response).text();
    await chatHistModel.create({
      userId: req.userId,
      prompt: "User started a new therapeutic session",
      response: welcomeMessage,
      conversationStage: "INITIAL_ENGAGEMENT",
    });
    try {
      await User.findOneAndUpdate(
        { id: req.userId },
        { therapyStage: "INITIAL_ENGAGEMENT" }
      );
    } catch (error) {
      console.log("User record update error:", error.message);
    }
    res.status(200).json({
      message: welcomeMessage,
      isFirstTimeUser: chatHistory.length === 0,
      step: "INITIAL_ENGAGEMENT",
    });
  } catch (error) {
    console.error("Error starting therapeutic journey:", error);
    res.status(500).json({
      message: "Error initializing conversation",
      error: error.message,
    });
  }
};

/**
 * Helper: Sends a Gemini message with exponential backoff on 429 errors.
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sendGeminiMessageWithRetry = async (chat, prompt, maxRetries = 3) => {
  let attempt = 0;
  let delay = 1000;
  while (attempt < maxRetries) {
    try {
      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      if (error.message.includes("429")) {
        attempt++;
        console.warn(
          `429 Too Many Requests: retrying in ${delay}ms (attempt ${attempt})`
        );
        await sleep(delay);
        delay *= 2;
      } else {
        throw error;
      }
    }
  }
  throw new Error("Exceeded maximum retry attempts due to quota limits.");
};

/**
 * Starts the self-assessment process with structured questions.
 */
const startSelfAssessment = async (req, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: "UserId not found" });
    let chat = startGeminiChat([], "ASSESSMENT");
    let assessmentQuestion;
    try {
      assessmentQuestion = await sendGeminiMessageWithRetry(
        chat,
        "Generate the first question of a structured self-assessment for a healthcare professional. Focus on their emotional state during and after work shifts."
      );
    } catch (error) {
      console.error("Error generating assessment question:", error);
      assessmentQuestion =
        "How have you been feeling emotionally during and after your recent work shifts?";
    }
    await chatHistModel.create({
      userId: req.userId,
      prompt: "Starting self-assessment",
      response: assessmentQuestion,
      conversationStage: "ASSESSMENT",
    });
    try {
      await User.findOneAndUpdate(
        { id: req.userId },
        { therapyStage: "ASSESSMENT" }
      );
    } catch (error) {
      console.log("User record update error:", error.message);
    }
    res.status(200).json({ message: assessmentQuestion, step: "ASSESSMENT" });
  } catch (error) {
    console.error("Error starting self assessment:", error);
    res
      .status(500)
      .json({ message: "Error generating assessment", error: error.message });
  }
};

module.exports = {
  getAnalysis,
  doAnalysis,
  getAnalysis,
  generateSleepAnalysis,
  startTherapeuticJourney,
  startSelfAssessment,
};
