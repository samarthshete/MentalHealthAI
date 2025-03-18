import { createContext } from "react";

// Global context for authentication state
const LoginContext = createContext({
  loggedIn: false,
  login: () => {},
  logout: () => {},
  userProfile: null,
  isLoading: false,
  refreshProfile: () => {},
});

export default LoginContext;
