const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const chatHistSchema = new Schema(
  {
    // User information
    userId: {
      type: String,
      required: true,
      index: true,
    },
    // Chat details
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    response: {
      type: String,
      required: true,
    },
    // Therapeutic journey tracking
    conversationStage: {
      type: String,
      enum: [
        "INITIAL_ENGAGEMENT",
        "ASSESSMENT",
        "ANALYSIS",
        "INTERVENTIONS",
        "PROFESSIONAL_HELP",
        "FOLLOW_UP",
      ],
      default: "INITIAL_ENGAGEMENT",
      index: true,
    },
    // Assessment progress tracking
    assessmentCompleted: {
      type: Boolean,
      default: false,
    },
    // Therapeutic content categorization
    contentCategory: {
      type: String,
      enum: [
        "EMOTIONAL_STATE",
        "SLEEP_PATTERN",
        "ENERGY_LEVEL",
        "WORKPLACE_STRESSOR",
        "PHYSICAL_SYMPTOM",
        "COPING_MECHANISM",
        "GENERAL",
      ],
      default: "GENERAL",
    },
    // Mood/emotional indicators extracted from content
    emotionalTone: {
      type: Number, // 1-5 scale where 1 is negative, 5 is positive
      min: 1,
      max: 5,
      default: 3,
    },
    // Healthcare-specific context
    workRelated: {
      type: Boolean,
      default: false,
    },
    shiftContext: {
      type: String,
      enum: ["DAY_SHIFT", "NIGHT_SHIFT", "POST_SHIFT", "OFF_DUTY", "NONE"],
      default: "NONE",
    },
    // Intervention tracking
    interventionRecommended: {
      type: Boolean,
      default: false,
    },
    interventionType: {
      type: String,
      enum: [
        "STRESS_REDUCTION",
        "SLEEP_HYGIENE",
        "BOUNDARY_SETTING",
        "ENERGY_MANAGEMENT",
        "PROFESSIONAL_REFERRAL",
        "NONE",
      ],
      default: "NONE",
    },
    // For tracking conversation flow and quality
    responseHelpfulness: {
      type: Number, // User feedback on helpfulness (if implemented)
      min: 1,
      max: 5,
      default: null,
    },
    // AI configuration details used during the chat session
    aiConfiguration: {
      temperature: Number,
      maxTokens: Number,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Compound index for efficient querying of therapeutic journey data
chatHistSchema.index({ userId: 1, conversationStage: 1, timestamp: -1 });

module.exports = mongoose.model("ChatHist", chatHistSchema);
