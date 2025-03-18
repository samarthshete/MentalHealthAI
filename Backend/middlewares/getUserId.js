const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");

async function userMiddleware(req, res, next) {
  try {
    let userId = req.cookies?.userid;

    if (userId && userId.trim() !== "") {
      // Validate if user exists in the database
      const userExists = await User.findOne({ id: userId });
      if (!userExists) {
        console.warn(
          `⚠️ User ID (${userId}) not found in DB. Generating new one.`
        );
        userId = uuidv4();
        res.cookie("userid", userId, {
          maxAge: 1209600000, // 14 days
          httpOnly: true,
          sameSite: "None",
          secure: true,
        });
        // Optionally create a new user entry
        await User.create({ id: userId, isFirstTimeUser: true });
      }
    } else {
      // No valid user ID found; generate a new one
      userId = uuidv4();
      res.cookie("userid", userId, {
        maxAge: 1209600000,
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
      // Create a new user entry (optional, based on your logic)
      await User.create({ id: userId, isFirstTimeUser: true });
      console.log(`✅ New User ID generated: ${userId}`);
    }

    // Attach userId to the request object for further use
    req.userId = userId;
    next();
  } catch (error) {
    console.error("❌ Error in userMiddleware:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { userMiddleware };
