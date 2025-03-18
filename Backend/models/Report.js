const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    keywords: {
      type: [String],
      default: [],
    },
    analysis: {
      type: String,
    },
    score: {
      type: String, // Consider using Number if you plan to perform numeric operations
    },
    sleepAnalysis: {
      type: String,
    },
    conversationStage: {
      type: String,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Report", reportSchema);
