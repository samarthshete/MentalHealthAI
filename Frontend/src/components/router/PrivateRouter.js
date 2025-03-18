import { useContext } from "react";
import { Navigate } from "react-router-dom";
import LoginContext from "../../context/context";

export const PrivateRoute = ({ children }) => {
  const { loggedIn } = useContext(LoginContext);

  // If the user is logged in, redirect them to the home page
  if (loggedIn) {
    return <Navigate to="/" />;
  }

  // Otherwise, render the child components (e.g., the login form)
  return children;
};
