import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import LoginContext from "./context"; // Ensure this path matches your file structure

export const TherapeuticJourneyContext = createContext();

export const useTherapeuticJourney = () =>
  useContext(TherapeuticJourneyContext);

const TherapeuticJourneyProvider = ({ children }) => {
  const { loggedIn } = useContext(LoginContext);
  const [therapyStage, setTherapyStage] = useState("INITIAL_ENGAGEMENT");
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [healthcareRole, setHealthcareRole] = useState("other_healthcare");
  const [workSchedule, setWorkSchedule] = useState({
    shiftType: null,
    hoursPerWeek: null,
  });

  useEffect(() => {
    if (loggedIn) {
      fetchTherapyData();
    }
  }, [loggedIn]);

  const fetchTherapyData = async () => {
    if (!loggedIn) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_API_LINK}/isUser`,
        { withCredentials: true }
      );
      const data = response.data;
      setTherapyStage(data.therapyStage || "INITIAL_ENGAGEMENT");
      setIsFirstTimeUser(data.isFirstTimeUser ?? true);
      setAssessmentCompleted(data.assessmentCompleted ?? false);
      setHealthcareRole(data.healthcareRole || "other_healthcare");
      setWorkSchedule(
        data.workSchedule || { shiftType: null, hoursPerWeek: null }
      );
    } catch (error) {
      console.error("Error fetching therapy data:", error);
    } finally {
      setLoading(false);
    }
  };

  const advanceStage = async (newStage) => {
    try {
      setLoading(true);
      await axios.post(
        `${process.env.REACT_APP_API_LINK}/therapy/advance-stage`,
        { stage: newStage },
        { withCredentials: true }
      );
      setTherapyStage(newStage);
    } catch (error) {
      console.error("Error advancing therapy stage:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TherapeuticJourneyContext.Provider
      value={{
        therapyStage,
        setTherapyStage,
        isFirstTimeUser,
        setIsFirstTimeUser,
        assessmentCompleted,
        setAssessmentCompleted,
        healthcareRole,
        setHealthcareRole,
        workSchedule,
        setWorkSchedule,
        loading,
        refreshJourneyData: fetchTherapyData,
        advanceStage,
      }}
    >
      {children}
    </TherapeuticJourneyContext.Provider>
  );
};

export default TherapeuticJourneyProvider;
