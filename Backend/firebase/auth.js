const { auth } = require("./firebase");

/**
 * Decodes and verifies a Firebase authentication token
 * @param {string} token - The authentication token (format: "Bearer [token]")
 * @returns {Promise<string|null>} - User email or null if verification fails
 */
async function decodeAuthToken(token) {
  try {
    // Validate token format
    if (!token || typeof token !== "string") {
      throw new Error("Invalid token format");
    }

    // Extract token ID (supports "Bearer" format or direct token)
    const tokenParts = token.split(" ");
    const tokenId = tokenParts.length > 1 ? tokenParts[1] : token;

    if (!tokenId) {
      throw new Error("Token is missing");
    }

    // Verify the token
    const decodedToken = await auth.verifyIdToken(tokenId);

    // Return email to maintain compatibility with existing code
    return decodedToken.email;
  } catch (error) {
    // More specific error logging
    if (error.code) {
      // Firebase-specific errors have a code property
      console.error(`Firebase Auth Error (${error.code}):`, error.message);
    } else {
      console.error("Token Verification Error:", error.message);
    }
    return null;
  }
}

module.exports = { decodeAuthToken };
