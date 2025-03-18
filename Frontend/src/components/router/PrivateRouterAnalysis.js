import { useContext } from "react";
import { Navigate } from "react-router-dom";
import LoginContext from "../../context/context";

export const PrivateRouteAnalysis = ({ children }) => {
  const { loggedIn } = useContext(LoginContext);

  if (!loggedIn) {
    return <Navigate to="/message" />;
  }

  return children;
};
