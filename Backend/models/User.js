const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    id: {
      type: String,
      required: true,
      index: true,
    },
    // Email notification tracking
    lastmail: {
      type: Date,
      default: null,
    },
    totalmail: {
      type: Number,
      default: 0,
    },
    // Therapeutic journey fields
    isFirstTimeUser: {
      type: Boolean,
      default: true,
    },
    therapyStage: {
      type: String,
      enum: [
        "INITIAL_ENGAGEMENT",
        "ASSESSMENT",
        "ANALYSIS",
        "INTERVENTIONS",
        "PROFESSIONAL_HELP",
      ],
      default: "INITIAL_ENGAGEMENT",
    },
    // Healthcare professional context
    profession: {
      type: String,
      enum: [
        "physician",
        "nurse",
        "therapist",
        "other_healthcare",
        "non_healthcare",
      ],
      default: "other_healthcare",
    },
    // Usage statistics
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    totalLogins: {
      type: Number,
      default: 1,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
