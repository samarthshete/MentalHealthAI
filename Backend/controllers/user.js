const User = require("../models/User");
const { genAnalysis } = require("./analysis");
const Report = require("../models/Report");
const { v4: uuid } = require("uuid");
const { decodeAuthToken } = require("../firebase/auth");
const chatHistModel = require("../models/ChatHist");

/**
 * Sign in with Google OAuth and integrate with therapeutic journey
 */
async function signinwithGoogle(req, res) {
  try {
    // Decode Firebase token from headers
    const token = req.headers.token;
    const email = await decodeAuthToken(token);

    if (!email) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }

    // Check if the user already exists in the database
    const existingUser = await User.findOne({ email });
    let userId;
    let isFirstTimeUser = false;

    // Handle existing cookie (user has used the app before)
    if (req.cookies?.userid) {
      userId = req.cookies.userid;

      if (!existingUser) {
        // Create account for existing anonymous user
        await User.create({
          id: userId,
          email,
          isFirstTimeUser: false, // They've used the app before registration
          lastLogin: new Date(),
          totalLogins: 1,
        });
        isFirstTimeUser = false;
      } else {
        // Update existing user's cookie and login statistics
        res.cookie("userid", existingUser.id, {
          maxAge: 1209600000, // 14 days
          httpOnly: true,
          sameSite: "None",
          secure: true,
        });
        await User.findOneAndUpdate(
          { email },
          { lastLogin: new Date(), $inc: { totalLogins: 1 } }
        );
        userId = existingUser.id;
        isFirstTimeUser = existingUser.isFirstTimeUser;
      }
    } else {
      // No cookie – either new user or returning on a new device
      if (!existingUser) {
        // Brand new user
        userId = uuid();
        await User.create({
          id: userId,
          email,
          isFirstTimeUser: true,
          lastLogin: new Date(),
          totalLogins: 1,
          therapyStage: "INITIAL_ENGAGEMENT",
        });
        isFirstTimeUser = true;
      } else {
        // Returning user on a new device
        userId = existingUser.id;
        isFirstTimeUser = existingUser.isFirstTimeUser;
        await User.findOneAndUpdate(
          { email },
          { lastLogin: new Date(), $inc: { totalLogins: 1 } }
        );
      }
      // Set session cookie for new session
      res.cookie("userid", userId, {
        maxAge: 1209600000, // 14 days
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
    }

    // Retrieve user data with therapeutic journey info
    const userData = await User.findOne({ id: userId });

    // Determine whether to show a welcome experience
    const chatHistory = await chatHistModel.find({ userId }).countDocuments();
    const showWelcomeExperience = isFirstTimeUser || chatHistory === 0;

    res.status(200).json({
      data: userData,
      isFirstTimeUser,
      showWelcomeExperience,
      therapyStage: userData.therapyStage || "INITIAL_ENGAGEMENT",
    });
  } catch (error) {
    console.error("Google sign-in error:", error);
    res.status(500).json({
      message: "Authentication failed",
      error: error.message,
    });
  }
}

/**
 * Standard email/password signup with therapeutic journey integration
 */
async function signup(req, res) {
  try {
    const token = req.headers.token;
    const email = await decodeAuthToken(token);

    if (!email) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }

    let userId;
    let isFirstTimeUser = true;

    // Handle user who has used chat before registering
    if (req.cookies?.userid) {
      userId = req.cookies.userid;
      isFirstTimeUser = false; // They've used the app before

      // Create account linking existing chat history
      await User.create({
        id: userId,
        email,
        isFirstTimeUser,
        lastLogin: new Date(),
        totalLogins: 1,
        therapyStage: "ASSESSMENT", // Skip initial engagement if they've already chatted
      });
    } else {
      // Brand new user
      userId = uuid();
      // Set session cookie
      res.cookie("userid", userId, {
        maxAge: 1209600000, // 14 days
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
      // Create new user with initial therapy stage
      await User.create({
        id: userId,
        email,
        isFirstTimeUser: true,
        lastLogin: new Date(),
        totalLogins: 1,
        therapyStage: "INITIAL_ENGAGEMENT",
      });
    }

    res.status(201).json({
      message: "Account created successfully",
      isFirstTimeUser,
      therapyStage: isFirstTimeUser ? "INITIAL_ENGAGEMENT" : "ASSESSMENT",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      message: "Account creation failed",
      error: error.message,
    });
  }
}

/**
 * Login with email/password and continue therapeutic journey
 */
async function login(req, res) {
  try {
    const email = await decodeAuthToken(req.headers.token);

    if (!email) {
      return res.status(401).json({ message: "Invalid authentication token" });
    }

    // Retrieve user from database
    const userData = await User.findOne({ email });

    if (!userData) {
      return res
        .status(404)
        .json({ message: "User not found", needsSignup: true });
    }

    // Set session cookie
    res.cookie("userid", userData.id, {
      maxAge: 1209600000, // 14 days
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });

    // Update login statistics and therapy progress
    await User.findOneAndUpdate(
      { email },
      { lastLogin: new Date(), $inc: { totalLogins: 1 } }
    );

    // Determine if a welcome experience is needed
    const chatHistory = await chatHistModel
      .find({ userId: userData.id })
      .countDocuments();
    const showWelcomeExperience = userData.isFirstTimeUser || chatHistory === 0;

    res.status(200).json({
      data: userData,
      isFirstTimeUser: userData.isFirstTimeUser,
      showWelcomeExperience,
      therapyStage: userData.therapyStage || "INITIAL_ENGAGEMENT",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Authentication failed",
      error: error.message,
    });
  }
}

/**
 * Validate user session and therapeutic journey status
 */
async function isUser(req, res) {
  try {
    if (!req.cookies?.userid) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const userId = req.cookies.userid;
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    // Retrieve latest therapy stage from reports if available
    const reports = await Report.find({ userId })
      .sort({ timestamp: -1 })
      .limit(1);
    const latestTherapyStage =
      reports.length > 0 ? reports[0].conversationStage : user.therapyStage;
    // Update if necessary
    if (latestTherapyStage && latestTherapyStage !== user.therapyStage) {
      await User.findOneAndUpdate(
        { id: userId },
        { therapyStage: latestTherapyStage }
      );
    }
    res.status(200).json({
      message: "User validated",
      isFirstTimeUser: user.isFirstTimeUser,
      therapyStage: latestTherapyStage || "INITIAL_ENGAGEMENT",
    });
  } catch (error) {
    console.error("Session validation error:", error);
    res
      .status(500)
      .json({ error: "Session validation failed", details: error.message });
  }
}

/**
 * End user session by clearing the session cookie
 */
async function logout(req, res) {
  try {
    if (!req.cookies?.userid) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Clear cookie
    res.cookie("userid", "", {
      maxAge: 0,
      httpOnly: true,
      sameSite: "None",
      secure: true,
    });

    res.status(200).json({ msg: "loggedout" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      error: "Logout failed",
      details: error.message,
    });
  }
}

module.exports = { signup, login, isUser, logout, signinwithGoogle };
