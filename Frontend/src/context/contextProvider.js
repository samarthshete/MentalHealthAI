import { useState, useEffect } from "react";
import axios from "axios";
import LoginContext from "./context";

const ContextProvider = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(
    () => sessionStorage.getItem("loggedIn") === "true"
  );
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loggedIn) {
      fetchUserProfile();
    }
  }, [loggedIn]);

  async function fetchUserProfile() {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_LINK}/user/profile`,
        { withCredentials: true }
      );
      setUserProfile(response.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setLoggedIn(false);
      sessionStorage.removeItem("loggedIn");
    } finally {
      setLoading(false);
    }
  }

  function login() {
    setLoggedIn(true);
    sessionStorage.setItem("loggedIn", "true");
  }

  function logout() {
    setLoggedIn(false);
    setUserProfile(null);
    sessionStorage.removeItem("loggedIn");
  }

  return (
    <LoginContext.Provider
      value={{
        login,
        logout,
        loggedIn,
        userProfile,
        isLoading: loading,
        refreshProfile: fetchUserProfile,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};

export default ContextProvider;
