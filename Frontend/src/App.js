import { Routes, Route, useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import axios from "axios";
import { useTherapeuticJourney } from "./context/TherapeuticJourneyContext";
import LoginContext from "./context/context";

// Pages
import Homepage from "./pages/homepage/homepage";
import LoginPage from "./pages/login/login";
import Message from "./pages/message/message";
import Analysis from "./pages/analysis/analysis";
import MoodEntryForm from "./pages/MoodEntry/MoodEntryForm";
import SleepTracker from "./pages/SleepTracker";
import TherapeuticJourneyStart from "./components//TherapeuticJourney/TherapeuticJourneyStart";
import SelfAssessment from "./components/SelfAssessment";
import AboutPage from "./pages/AboutUs/AboutPage";
import ErrorPage from "./pages/error/error";

// Route guards (if needed)
import { PrivateRoute } from "./components/router/PrivateRouter";
import { PrivateRouteAnalysis } from "./components/router/PrivateRouterAnalysis";

function App() {
  const { login } = useContext(LoginContext);
  const { setTherapyStage, setIsFirstTimeUser } = useTherapeuticJourney();
  const navigate = useNavigate();

  useEffect(() => {
    async function checkUserStatus() {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_LINK}/isUser`,
          { withCredentials: true }
        );
        console.log("isFirstTimeUser:", response.data.isFirstTimeUser);
        if (response.data) {
          login();
          setTherapyStage(response.data.therapyStage);
          setIsFirstTimeUser(response.data.isFirstTimeUser);

          if (
            response.data.isFirstTimeUser &&
            window.location.pathname !== "/journey-start"
          ) {
            navigate("/journey-start");
          }
        }
      } catch (error) {
        console.log(error.message);
      }
    }
    checkUserStatus();
  }, [login, setTherapyStage, setIsFirstTimeUser, navigate]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Homepage />} />
      <Route path="/aboutus" element={<AboutPage />} />
      <Route path="/message" element={<Message />} />
      <Route path="/analysis" element={<Analysis />} />
      <Route path="/journey-start" element={<TherapeuticJourneyStart />} />
      <Route path="/self-assessment" element={<SelfAssessment />} />
      <Route path="/mood-entry" element={<MoodEntryForm />} />
      <Route path="/sleep-assessment" element={<SleepTracker />} />
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}

export default App;
