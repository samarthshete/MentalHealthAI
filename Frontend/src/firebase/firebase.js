// src/firebase/firebase.js

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import axios from "axios";

// Your web app's Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase and Analytics
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Set up Google authentication provider and get auth instance
const provider = new GoogleAuthProvider();
const auth = getAuth();

// Function to sign in with Google
async function LoginWithGoogle() {
  // Optionally set the auth language (here set to Italian)
  auth.languageCode = "it";

  try {
    const data = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(data);
    const token = credential.accessToken;
    console.log("Google Credential:", credential);
    const user = data.user;
    console.log("Firebase User:", user);

    // Prepare headers to send user data to your backend
    const headers = {
      token: "Bearer " + user.accessToken,
    };
    console.log("Request Headers:", headers);

    // Send a request to your backend for signup/login with Google
    await axios.post(
      process.env.REACT_APP_API_LINK + "/signupWithGoogle",
      {},
      { headers, withCredentials: true }
    );

    return true;
  } catch (error) {
    console.error("Google Login Error:", error.message);
    return false;
  }
}

// Function to sign in with email and password
async function LoginWithEmail(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    console.log("Email Login User:", user);
    return user;
  } catch (error) {
    console.error("Email Login Error:", error.message);
    throw error; // Re-throw error for handling in the calling function
  }
}

// Function to sign up with email and password
async function SignupWithEmail(email, password) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    const headers = {
      token: "Bearer " + user.accessToken,
    };
    console.log("Signup User Headers:", headers);

    // Send signup data to your backend
    await axios.post(
      process.env.REACT_APP_API_LINK + "/signup",
      {},
      { headers, withCredentials: true }
    );
    return user;
  } catch (error) {
    console.error("Email Signup Error:", error.message);
    throw error; // Re-throw error for handling in the calling function
  }
}

export { LoginWithGoogle, LoginWithEmail, SignupWithEmail };
