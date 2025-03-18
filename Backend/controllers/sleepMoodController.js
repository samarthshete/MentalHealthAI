const {
  startGeminiChat,
  startInterventionsChat,
} = require("../gemini/chat.js");
const {
  sleepAnalysisPrompt,
  interventionsPrompt,
} = require("../gemini/analysisPrompts.js");
const SleepAssessment = require("../models/SleepAssessment");
const MoodEntry = require("../models/MoodEntry");
const User = require("../models/User.js");

/**
 * Enhanced sleep assessment with AI insights.
 * Saves a new sleep assessment and auto-creates a mood entry if applicable.
 */
const saveSleepAssessment = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "UserId not found" });
    }

    const { sleepHours, sleepQuality, mood, stressLevel, factors, notes } =
      req.body;

    // Validate sleep hours
    if (sleepHours < 0 || sleepHours > 24) {
      return res
        .status(400)
        .json({ error: "Sleep hours must be between 0-24" });
    }

    const newAssessment = await SleepAssessment.create({
      userId: req.userId,
      sleepHours,
      sleepQuality,
      mood,
      stressLevel,
      factors: factors || [],
      notes,
    });

    // Generate immediate personalized advice for healthcare workers
    let sleepRecommendation = null;
    try {
      const recentSleep = await SleepAssessment.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .limit(3);

      if (recentSleep.length > 0) {
        const sleepContext = recentSleep
          .map(
            (entry, i) =>
              `Day ${i + 1}: ${entry.sleepHours}h, Quality: ${
                entry.sleepQuality
              }/5, Mood: ${entry.mood || "Not reported"}`
          )
          .join("\n");

        const chat = startGeminiChat();
        const result = await chat.sendMessage(
          `Based on this healthcare professional's recent sleep data, provide ONE specific, actionable recommendation they could implement before their next shift. Focus on sleep quality improvement. Max 75 words.\n\n${sleepContext}`
        );
        sleepRecommendation = (await result.response).text();
      }
    } catch (aiError) {
      console.error("Sleep recommendation generation failed:", aiError);
      // Non-critical error; continue without recommendation
    }

    // Auto-create a mood entry if mood and stressLevel information is provided
    if (mood && typeof stressLevel !== "undefined") {
      try {
        // Convert mood text to an approximate score using common terms
        const moodMapping = {
          great: 5,
          good: 4,
          okay: 3,
          bad: 2,
          terrible: 1,
          rested: 5,
          refreshed: 5,
          calm: 4,
          tired: 2,
          exhausted: 1,
        };

        let moodScore = 3; // Default score
        const moodLower = mood.toLowerCase();
        for (const [term, score] of Object.entries(moodMapping)) {
          if (moodLower.includes(term)) {
            moodScore = score;
            break;
          }
        }

        await MoodEntry.create({
          userId: req.userId,
          moodScore,
          energyLevel: sleepQuality > 3 ? 4 : 3,
          stressLevel,
          sleepHours,
          sleepQuality,
          tags: factors || [],
          notes: "Generated from sleep assessment",
          workStatus: "working", // Default value
        });
      } catch (error) {
        console.error("Auto mood entry creation failed:", error);
        // Non-critical error; proceed without halting assessment saving
      }
    }

    res.status(201).json({
      message: "Sleep assessment saved successfully",
      data: newAssessment,
      recommendation: sleepRecommendation,
    });
  } catch (error) {
    console.error("Error saving sleep assessment:", error);
    res.status(500).json({
      message: "Failed to create sleep assessment",
      error: error.message,
    });
  }
};

/**
 * Get a specific sleep assessment by ID.
 * This is the missing function referenced in your router.
 */
const getSleepAssessment = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "UserId not found" });
    }

    const { userId } = req.params;

    // Verify the user is requesting their own data
    if (userId !== req.userId) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const assessments = await SleepAssessment.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    if (assessments.length === 0) {
      return res.status(404).json({ message: "No sleep assessments found" });
    }

    res.status(200).json(assessments);
  } catch (error) {
    console.error("Error retrieving sleep assessment:", error);
    res.status(500).json({
      message: "Failed to retrieve sleep assessment",
      error: error.message,
    });
  }
};

/**
 * Enhanced sleep data retrieval with AI analysis for healthcare professionals.
 * Calculates statistics and trends, and generates AI-powered insights.
 */
const getSleepData = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "UserId not found" });
    }
    const { days = 14 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const sleepData = await SleepAssessment.find({
      userId: req.userId,
      createdAt: { $gte: startDate },
    }).sort({ createdAt: 1 });

    if (sleepData.length === 0) {
      return res.status(200).json({ message: "No sleep data available" });
    }

    // Calculate statistics
    const sleepHoursAvg =
      sleepData.reduce((sum, entry) => sum + entry.sleepHours, 0) /
      sleepData.length;
    const sleepQualityAvg =
      sleepData.reduce((sum, entry) => sum + entry.sleepQuality, 0) /
      sleepData.length;
    const stressLevelAvg =
      sleepData.reduce((sum, entry) => sum + entry.stressLevel, 0) /
      sleepData.length;

    // Calculate trends using a helper function
    const sleepHoursTrend = calculateTrend(
      sleepData.map((entry) => entry.sleepHours)
    );
    const sleepQualityTrend = calculateTrend(
      sleepData.map((entry) => entry.sleepQuality)
    );

    // Process common factors from sleep data
    const factorCounts = {};
    sleepData.forEach((entry) => {
      if (entry.factors && entry.factors.length > 0) {
        entry.factors.forEach((factor) => {
          factorCounts[factor] = (factorCounts[factor] || 0) + 1;
        });
      }
    });
    const topFactors = Object.entries(factorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([factor, count]) => ({ factor, count }));

    // Generate AI analysis if sufficient data is available
    let aiAnalysis = null;
    if (sleepData.length >= 3) {
      try {
        const sleepHistoryText = sleepData
          .map(
            (entry, i) =>
              `Day ${i + 1}: Slept ${entry.sleepHours}h, Quality: ${
                entry.sleepQuality
              }/5, Mood: ${entry.mood || "Not reported"}, Stress: ${
                entry.stressLevel
              }/5`
          )
          .join("\n");
        const chat = startGeminiChat();
        const result = await chat.sendMessage(
          sleepAnalysisPrompt + "\n\n" + sleepHistoryText
        );
        aiAnalysis = (await result.response).text();
      } catch (error) {
        console.error("Sleep analysis generation failed:", error);
        aiAnalysis = "Analysis temporarily unavailable";
      }
    }

    res.status(200).json({
      entries: sleepData,
      stats: {
        averageSleepHours: sleepHoursAvg.toFixed(1),
        averageSleepQuality: sleepQualityAvg.toFixed(1),
        averageStressLevel: stressLevelAvg.toFixed(1),
        sleepHoursTrend,
        sleepQualityTrend,
        topFactors,
        entriesCount: sleepData.length,
      },
      analysis: aiAnalysis,
    });
  } catch (error) {
    console.error("Error fetching sleep data:", error);
    res.status(500).json({
      message: "Failed to fetch sleep data",
      error: error.message,
    });
  }
};

/**
 * Retrieves mood entries for the specified period.
 */
const getMoodData = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "UserId not found" });
    }
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    const entries = await MoodEntry.find({
      userId: req.userId,
      timestamp: { $gte: startDate },
    }).sort({ timestamp: 1 });
    res.status(200).json(entries);
  } catch (error) {
    console.error("Error fetching mood entries:", error);
    res.status(500).json({
      message: "Failed to fetch mood entries",
      error: error.message,
    });
  }
};

/**
 * Enhanced mood entry with real-time coping strategies.
 */
const saveMoodEntry = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "UserId not found" });
    }
    const {
      moodScore,
      energyLevel,
      stressLevel,
      sleepHours,
      sleepQuality,
      tags,
      notes,
      workStatus,
      shiftType,
    } = req.body;

    const moodEntry = new MoodEntry({
      userId: req.userId,
      moodScore,
      energyLevel,
      stressLevel,
      sleepHours,
      sleepQuality,
      tags: tags || [],
      notes,
      workStatus,
      shiftType,
    });

    const savedEntry = await moodEntry.save();

    // Generate coping strategy if distress is indicated
    let copingStrategy = null;
    if (moodScore <= 2 || stressLevel >= 4) {
      try {
        const chat = startInterventionsChat();
        const result = await chat.sendMessage(
          `This healthcare professional reports mood: ${moodScore}/5, energy: ${energyLevel}/5, stress: ${stressLevel}/5, during ${
            workStatus || "work"
          } (${shiftType || "shift"}). Tags: ${
            tags?.join(", ") || "none"
          }. Provide ONE immediately implementable coping strategy specific to their healthcare setting. Max 75 words.`
        );
        copingStrategy = (await result.response).text();
      } catch (error) {
        console.error("Coping strategy generation failed:", error);
      }
    }

    // Auto-create sleep entry if sleep data is provided
    if (sleepHours && sleepQuality) {
      try {
        await SleepAssessment.create({
          userId: req.userId,
          sleepHours,
          sleepQuality,
          mood: getMoodText(moodScore),
          stressLevel,
          factors: tags,
          notes: "Created from mood entry",
        });
      } catch (error) {
        console.error("Auto sleep entry creation failed:", error);
      }
    }

    res.status(201).json({
      data: savedEntry,
      copingStrategy,
    });
  } catch (error) {
    console.error("Error creating mood entry:", error);
    res.status(500).json({
      message: "Failed to create mood entry",
      error: error.message,
    });
  }
};

/**
 * Helper: Converts a mood score to a text description.
 */
function getMoodText(score) {
  const moodMap = {
    1: "Very Low",
    2: "Low",
    3: "Neutral",
    4: "Good",
    5: "Excellent",
  };
  return moodMap[score] || "Neutral";
}

/**
 * Calculate trend using linear regression.
 */
function calculateTrend(values) {
  if (values.length < 3) return 0;
  const n = values.length;
  const indices = Array.from({ length: n }, (_, i) => i);
  const sumX = indices.reduce((sum, x) => sum + x, 0);
  const sumY = values.reduce((sum, y) => sum + y, 0);
  const sumXY = indices.reduce((sum, x, i) => sum + x * values[i], 0);
  const sumXX = indices.reduce((sum, x) => sum + x * x, 0);
  return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
}

/**
 * Enhanced mood statistics with comprehensive analysis.
 */
const getMoodStats = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "UserId not found" });
    }
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    const entries = await MoodEntry.find({
      userId: req.userId,
      timestamp: { $gte: startDate },
    });
    if (entries.length === 0) {
      return res.status(200).json({ message: "No mood data available" });
    }
    // Calculate averages
    const moodSum = entries.reduce((sum, entry) => sum + entry.moodScore, 0);
    const energySum = entries.reduce(
      (sum, entry) => sum + entry.energyLevel,
      0
    );
    const stressSum = entries.reduce(
      (sum, entry) => sum + entry.stressLevel,
      0
    );
    // Calculate sleep stats if available
    const sleepEntries = entries.filter(
      (entry) => entry.sleepHours !== undefined
    );
    const sleepSum = sleepEntries.reduce(
      (sum, entry) => sum + entry.sleepHours,
      0
    );
    // Work status analysis
    const workStatusCounts = {};
    entries.forEach((entry) => {
      if (entry.workStatus) {
        workStatusCounts[entry.workStatus] =
          (workStatusCounts[entry.workStatus] || 0) + 1;
      }
    });
    // Shift type impact analysis
    const shiftTypeMood = {};
    entries.forEach((entry) => {
      if (entry.shiftType) {
        if (!shiftTypeMood[entry.shiftType]) {
          shiftTypeMood[entry.shiftType] = {
            moodSum: 0,
            stressSum: 0,
            count: 0,
          };
        }
        shiftTypeMood[entry.shiftType].moodSum += entry.moodScore;
        shiftTypeMood[entry.shiftType].stressSum += entry.stressLevel;
        shiftTypeMood[entry.shiftType].count++;
      }
    });
    Object.keys(shiftTypeMood).forEach((shift) => {
      const data = shiftTypeMood[shift];
      data.avgMood = data.moodSum / data.count;
      data.avgStress = data.stressSum / data.count;
      delete data.moodSum;
      delete data.stressSum;
    });
    // Tag frequency analysis
    const tagCounts = {};
    entries.forEach((entry) => {
      if (entry.tags && entry.tags.length) {
        entry.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));
    // Calculate trends
    const moodTrend = calculateTrend(entries.map((e) => e.moodScore));
    const energyTrend = calculateTrend(entries.map((e) => e.energyLevel));
    const stressTrend = calculateTrend(entries.map((e) => e.stressLevel));
    // Get AI insights for healthcare professional wellbeing
    let wellbeingInsights = null;
    try {
      const recentEntries = entries.slice(0, 10);
      const moodDataText = recentEntries
        .map(
          (entry, i) =>
            `Entry ${i + 1}: Mood ${entry.moodScore}/5, Energy ${
              entry.energyLevel
            }/5, Stress ${entry.stressLevel}/5, Work: ${
              entry.workStatus || "Unknown"
            }, Shift: ${entry.shiftType || "Unknown"}, Tags: ${
              entry.tags?.join(", ") || "None"
            }`
        )
        .join("\n");
      const chat = startGeminiChat();
      const result = await chat.sendMessage(
        `Analyze this healthcare professional's wellbeing data to identify patterns between work schedules and mental health. Focus on shift impacts, stress triggers, and protective factors. Provide 3 specific workplace wellbeing suggestions. Keep response under 200 words and healthcare-specific.\n\n${moodDataText}`
      );
      wellbeingInsights = (await result.response).text();
    } catch (error) {
      console.error("Wellbeing insights generation failed:", error);
      wellbeingInsights = null;
    }
    res.status(200).json({
      averageMood: moodSum / entries.length,
      averageEnergy: energySum / entries.length,
      averageStress: stressSum / entries.length,
      averageSleep: sleepEntries.length ? sleepSum / sleepEntries.length : null,
      entryCount: entries.length,
      topTags,
      moodTrend,
      energyTrend,
      stressTrend,
      workStatusDistribution: workStatusCounts,
      shiftTypeImpact: shiftTypeMood,
      firstEntry: entries[0],
      lastEntry: entries[entries.length - 1],
      wellbeingInsights,
    });
  } catch (error) {
    console.error("Error calculating mood stats:", error);
    res.status(500).json({
      message: "Failed to calculate mood statistics",
      error: error.message,
    });
  }
};

/**
 * New endpoint for integrated sleep-mood analysis for healthcare workers.
 */
const getIntegratedWellbeingAnalysis = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "UserId not found" });
    }
    const { days = 14 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    // Get both sleep and mood datasets
    const sleepData = await SleepAssessment.find({
      userId: req.userId,
      createdAt: { $gte: startDate },
    })
      .sort({ createdAt: -1 })
      .limit(10);
    const moodData = await MoodEntry.find({
      userId: req.userId,
      timestamp: { $gte: startDate },
    })
      .sort({ timestamp: -1 })
      .limit(10);
    if (sleepData.length === 0 && moodData.length === 0) {
      return res
        .status(200)
        .json({ message: "Insufficient data for integrated analysis" });
    }
    // Generate comprehensive analysis using the interventions prompt
    let analysis = null;
    if (sleepData.length > 0 || moodData.length > 0) {
      try {
        const chat = startInterventionsChat();
        let prompt =
          "Analyze this healthcare professional's sleep and mood data to identify patterns and generate evidence-based interventions. ";
        if (sleepData.length > 0) {
          prompt +=
            "Sleep data: " +
            sleepData
              .map(
                (d, i) =>
                  `Entry ${i + 1}: ${d.sleepHours}h, Quality: ${
                    d.sleepQuality
                  }/5, Mood: ${d.mood || "Unknown"}`
              )
              .join("; ");
        }
        if (moodData.length > 0) {
          prompt +=
            " Mood data: " +
            moodData
              .map(
                (d, i) =>
                  `Entry ${i + 1}: Mood: ${d.moodScore}/5, Energy: ${
                    d.energyLevel
                  }/5, Stress: ${d.stressLevel}/5, Work: ${
                    d.workStatus || "Unknown"
                  }`
              )
              .join("; ");
        }
        const result = await chat.sendMessage(
          interventionsPrompt + "\n\n" + prompt
        );
        analysis = (await result.response).text();
      } catch (error) {
        console.error("Integrated analysis generation failed:", error);
        analysis = "Analysis temporarily unavailable";
      }
    }
    res.status(200).json({
      sleepEntries: sleepData.length,
      moodEntries: moodData.length,
      analysis,
    });
  } catch (error) {
    console.error("Error generating integrated analysis:", error);
    res.status(500).json({
      message: "Failed to generate integrated wellbeing analysis",
      error: error.message,
    });
  }
};

/**
 * Function to generate AI-powered sleep analysis.
 * This is a standalone function that can be used for the /sleep/analysis endpoint.
 */
const generateSleepAnalysis = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "UserId not found" });
    }

    const { days = 14 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const sleepData = await SleepAssessment.find({
      userId: req.userId,
      createdAt: { $gte: startDate },
    })
      .sort({ createdAt: -1 })
      .limit(10);

    if (sleepData.length === 0) {
      return res
        .status(200)
        .json({ message: "No sleep data available for analysis" });
    }

    // Generate comprehensive analysis
    let analysis = null;
    try {
      const sleepHistoryText = sleepData
        .map(
          (entry, i) =>
            `Day ${i + 1}: Slept ${entry.sleepHours}h, Quality: ${
              entry.sleepQuality
            }/5, Mood: ${entry.mood || "Not reported"}, Stress: ${
              entry.stressLevel
            }/5`
        )
        .join("\n");

      const chat = startGeminiChat();
      const result = await chat.sendMessage(
        sleepAnalysisPrompt + "\n\n" + sleepHistoryText
      );
      analysis = (await result.response).text();
    } catch (error) {
      console.error("Sleep analysis generation failed:", error);
      analysis = "Analysis temporarily unavailable";
    }

    res.status(200).json({
      entries: sleepData.length,
      analysis,
    });
  } catch (error) {
    console.error("Error generating sleep analysis:", error);
    res.status(500).json({
      message: "Failed to generate sleep analysis",
      error: error.message,
    });
  }
};

module.exports = {
  saveSleepAssessment,
  getSleepData,
  getSleepAssessment,
  saveMoodEntry,
  getMoodData,
  getMoodStats,
  getIntegratedWellbeingAnalysis,
  generateSleepAnalysis,
};
