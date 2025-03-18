const mongoose = require("mongoose");

const moodEntrySchema = new mongoose.Schema(
  {
    // Core identification
    userId: {
      type: String,
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // Mood metrics
    moodScore: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    energyLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    stressLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // Sleep data
    sleepHours: {
      type: Number,
      min: 0,
      max: 24,
    },
    sleepQuality: {
      type: Number,
      min: 1,
      max: 5,
    },

    // Healthcare context
    workStatus: {
      type: String,
      enum: ["working", "post-shift", "day-off"],
      default: "working",
    },
    shiftType: {
      type: String,
      enum: ["day", "night", "on-call", "off"],
      default: "day",
    },

    // Specific healthcare factors
    patientLoad: {
      type: Number,
      min: 1,
      max: 10,
    },
    workHours: {
      type: Number,
      min: 0,
      max: 24,
    },

    // Categorization
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    notes: {
      type: String,
    },

    // Therapeutic journey integration
    associatedWithStage: {
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

    // Intervention tracking
    interventionsRecommended: [
      {
        type: String,
        enum: [
          "STRESS_REDUCTION",
          "SLEEP_HYGIENE",
          "BOUNDARY_SETTING",
          "ENERGY_MANAGEMENT",
          "PROFESSIONAL_REFERRAL",
        ],
      },
    ],

    // Physical symptoms (common in healthcare burnout)
    physicalSymptoms: [
      {
        type: String,
        enum: [
          "HEADACHE",
          "FATIGUE",
          "MUSCLE_TENSION",
          "GI_ISSUES",
          "SLEEP_DISRUPTION",
          "NONE",
        ],
      },
    ],

    // Burnout indicators specific to healthcare
    emotionalExhaustion: {
      type: Number,
      min: 1,
      max: 5,
    },
    depersonalization: {
      type: Number,
      min: 1,
      max: 5,
    },
    accomplishment: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Additional indexes for efficient querying
moodEntrySchema.index({ userId: 1, timestamp: -1 });
moodEntrySchema.index({ userId: 1, associatedWithStage: 1 });
moodEntrySchema.index({ userId: 1, shiftType: 1 });

// Virtual for calculating burnout score (used in analysis)
// The burnout score is calculated as the average of emotional exhaustion,
// depersonalization, and an inverted accomplishment (6 - accomplishment) for a balanced scale.
moodEntrySchema.virtual("burnoutScore").get(function () {
  if (
    this.emotionalExhaustion === undefined ||
    this.depersonalization === undefined ||
    this.accomplishment === undefined
  ) {
    return null;
  }
  return (
    (this.emotionalExhaustion +
      this.depersonalization +
      (6 - this.accomplishment)) /
    3
  ).toFixed(1);
});

module.exports = mongoose.model("MoodEntry", moodEntrySchema);
