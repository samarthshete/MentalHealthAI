// Backend/index.js
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const router = require("./routers/router.js");
const connectDB = require("./db/connect.js");
const { setupGeminiChat } = require("./gemini/chat.js");

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
    exposedHeaders: ["set-cookie", "token"],
  })
);

// Parse URL-encoded data, JSON, and cookies
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

// Use API routes from the router
app.use(router);

const initServer = async () => {
  try {
    const port = process.env.SERVER_PORT || 8000;
    await connectDB();
    console.log("✅ MongoDB Connected");

    // Initialize Gemini AI model
    await setupGeminiChat();

    app.listen(port, () => {
      console.log(`Backend Server Started on port ${port}...`);
    });
  } catch (err) {
    console.error("Error initializing server:", err.message);
    process.exit(1);
  }
};

initServer();
