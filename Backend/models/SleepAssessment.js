const mongoose = require("mongoose");

const sleepAssessmentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true, // Added index for faster queries
    },
    // Basic sleep metrics
    sleepHours: {
      type: Number,
      required: true,
      min: 0,
      max: 24,
    },
    sleepQuality: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    // Healthcare worker context
    shiftType: {
      type: String,
      enum: ["day", "night", "on-call", "off"],
      default: "day",
    },
    postShiftSleep: {
      type: Boolean,
      default: false,
    },
    // Mental health metrics
    mood: {
      type: String,
      required: true,
    },
    stressLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    // Sleep disturbance tracking
    wakeUps: {
      type: Number,
      min: 0,
      default: 0,
    },
    sleepLatency: {
      type: Number, // Minutes to fall asleep
      min: 0,
    },
    // Contextual factors
    factors: {
      type: [String],
      default: [],
    },
    notes: String,
    // Therapeutic journey connection
    conversationStage: {
      type: String,
      enum: [
        "INITIAL_ENGAGEMENT",
        "ASSESSMENT",
        "ANALYSIS",
        "INTERVENTIONS",
        "PROFESSIONAL_HELP",
      ],
      default: "ASSESSMENT",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

// Compound indexes for efficient queries
sleepAssessmentSchema.index({ userId: 1, createdAt: -1 });
sleepAssessmentSchema.index({ userId: 1, shiftType: 1 });

module.exports = mongoose.model("SleepAssessment", sleepAssessmentSchema);
