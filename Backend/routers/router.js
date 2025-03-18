// Backend/routers/router.js
const { Router } = require("express");
const { connectWithChatBot } = require("../controllers/chat.js");
const {
  doAnalysis,
  getAnalysis,
  generateSleepAnalysis,
  startTherapeuticJourney,
  startSelfAssessment,
} = require("../controllers/analysis.js");
const { userMiddleware } = require("../middlewares/getUserId.js"); // Ensure the path & filename match exactly
const {
  signup,
  login,
  isUser,
  logout,
  signinwithGoogle,
} = require("../controllers/user.js");
const {
  saveSleepAssessment,
  getSleepData,
  getSleepAssessment,
  saveMoodEntry,
  getMoodData,
  getMoodStats,
  getIntegratedWellbeingAnalysis,
  generateSleepAnalysis: generateSleepAnalysisFromSleep, // alias if needed
} = require("../controllers/sleepMoodController.js");

const router = Router();

// System and health check route
router.get("/cron", (req, res) => {
  res.status(200).json({ message: "hello" });
});

// Chat and analysis routes
// router.get("/chat", userMiddleware, connectWithChatBot);
router.get("/analysis", userMiddleware, doAnalysis);
router.get("/fetchanalysis", userMiddleware, getAnalysis);

// Therapeutic journey routes
router.get("/therapy/start", userMiddleware, startTherapeuticJourney);
router.get("/therapy/assessment", userMiddleware, startSelfAssessment);

// Authentication routes
router.post("/signup", signup);
router.post("/signupWithGoogle", signinwithGoogle);
router.post("/login", login);
router.get("/isUser", isUser);
router.get("/logout", logout);

// Sleep assessment routes
router.post("/sleep", userMiddleware, saveSleepAssessment);
router.get("/sleep/data", userMiddleware, getSleepData);
router.get("/sleep/:userId", userMiddleware, getSleepAssessment);
router.get("/sleep/analysis", userMiddleware, generateSleepAnalysis);

// Mood tracking routes
router.post("/mood", userMiddleware, saveMoodEntry);
router.get("/mood/data", userMiddleware, getMoodData);
router.get("/mood/stats", userMiddleware, getMoodStats);

// Integrated wellbeing analysis
router.get(
  "/wellbeing/integrated",
  userMiddleware,
  getIntegratedWellbeingAnalysis
);

module.exports = router;
