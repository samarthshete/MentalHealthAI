import React from "react";
import { useNavigate } from "react-router-dom";
import { useTherapeuticJourney } from "../../context/TherapeuticJourneyContext";
import styles from "./TherapeuticJourneyStart.module.css";

const TherapeuticJourneyStart = () => {
  const navigate = useNavigate();
  const { setTherapyStage, setIsFirstTimeUser } = useTherapeuticJourney();

  const handleStartJourney = () => {
    setTherapyStage("ASSESSMENT");
    setIsFirstTimeUser(false); // Mark as no longer a first-time user
    navigate("/self-assessment");
  };

  return (
    <div className={styles.container}>
      <div className={styles.welcomeCard}>
        <h1>Welcome to Your Mental Health Journey</h1>
        <p className={styles.introduction}>
          As a healthcare professional, you face unique challenges that can
          impact your wellbeing. This platform is designed specifically to
          support you through evidence-based assessment and personalized
          interventions.
        </p>
        <div className={styles.journeySteps}>
          <h2>Your Journey Includes:</h2>
          <ol>
            <li>
              <strong>Initial Conversation</strong>
              <p>We'll start with understanding your current situation</p>
            </li>
            <li>
              <strong>Structured Assessment</strong>
              <p>A step-by-step evaluation of key wellbeing factors</p>
            </li>
            <li>
              <strong>Personalized Analysis</strong>
              <p>AI-powered insights into your mental health patterns</p>
            </li>
            <li>
              <strong>Targeted Interventions</strong>
              <p>
                Evidence-based strategies tailored to healthcare professionals
              </p>
            </li>
            <li>
              <strong>Ongoing Support</strong>
              <p>Continued guidance and resources for your wellbeing</p>
            </li>
          </ol>
        </div>
        <button className={styles.startButton} onClick={handleStartJourney}>
          Begin Your Wellbeing Journey
        </button>
      </div>
    </div>
  );
};

export default TherapeuticJourneyStart;
