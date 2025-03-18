import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTherapeuticJourney } from "../context/TherapeuticJourneyContext";
import styles from "./SelfAssessment.module.css";

const SelfAssessment = () => {
  const { setTherapyStage } = useTherapeuticJourney();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [conversation, setConversation] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [assessmentStage, setAssessmentStage] = useState(0);
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load initial assessment question
  useEffect(() => {
    const startAssessment = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.REACT_APP_API_LINK}/therapy/assessment`,
          { withCredentials: true }
        );

        if (response.data && response.data.message) {
          setConversation([
            {
              sender: "assistant",
              message: response.data.message,
              timestamp: new Date(),
            },
          ]);
          setCurrentQuestion(response.data.message);
        }
      } catch (err) {
        console.error("Error starting assessment:", err);
        setError("Failed to start assessment. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    startAssessment();
  }, []);

  // Scroll to bottom when conversation updates
  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  // Submit user response and get next question
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Avoid submitting empty responses
    if (!currentMessage.trim()) return;

    // Store the current message locally
    const userMsgText = currentMessage;

    // Add user message to conversation
    const userMessage = {
      sender: "user",
      message: userMsgText,
      timestamp: new Date(),
    };
    setConversation((prev) => [...prev, userMessage]);
    // Clear input field
    setCurrentMessage("");

    try {
      setLoading(true);
      // Send user message to the backend
      const response = await axios.post(
        `${process.env.REACT_APP_API_LINK}/chat`,
        { message: userMsgText },
        { withCredentials: true }
      );

      if (response.data) {
        // Append AI response to conversation
        const aiResponse = {
          sender: "assistant",
          message: response.data.response,
          timestamp: new Date(),
        };
        setConversation((prev) => [...prev, aiResponse]);

        // Calculate next assessment stage
        const nextStage = assessmentStage + 1;
        setAssessmentStage(nextStage);

        // Check if assessment is complete after 6 questions
        if (nextStage >= 6) {
          setAssessmentComplete(true);
          setTherapyStage("ANALYSIS");
          // Wait 3 seconds before redirecting to analysis page
          setTimeout(() => {
            navigate("/analysis");
          }, 3000);
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Progress indicators for assessment stages
  const stages = [
    "Emotional State",
    "Sleep Patterns",
    "Energy Levels",
    "Workplace Stressors",
    "Physical Symptoms",
    "Coping Strategies",
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Healthcare Professional Self-Assessment</h1>
        <p>
          This step-by-step assessment will help us understand your current
          wellbeing.
        </p>
      </div>

      <div className={styles.progressContainer}>
        {stages.map((stage, index) => (
          <div
            key={index}
            className={`${styles.progressStage} ${
              index <= assessmentStage ? styles.activeStage : ""
            }`}
          >
            <div className={styles.stageNumber}>{index + 1}</div>
            <span className={styles.stageLabel}>{stage}</span>
          </div>
        ))}
      </div>

      <div className={styles.conversationContainer}>
        {conversation.map((msg, index) => (
          <div
            key={index}
            className={`${styles.message} ${
              msg.sender === "assistant"
                ? styles.assistantMessage
                : styles.userMessage
            }`}
          >
            {msg.message}
          </div>
        ))}
        <div ref={messagesEndRef} />
        {assessmentComplete && (
          <div className={styles.completionMessage}>
            <h3>Assessment Complete</h3>
            <p>
              Thank you for completing the assessment. We're now analyzing your
              responses to provide personalized insights.
            </p>
            <p>Redirecting to your analysis page...</p>
          </div>
        )}
        {error && <div className={styles.errorMessage}>{error}</div>}
      </div>

      {!assessmentComplete && (
        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Type your response here..."
            disabled={loading}
            className={styles.inputField}
          />
          <button
            type="submit"
            disabled={loading || !currentMessage.trim()}
            className={styles.submitButton}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </form>
      )}
    </div>
  );
};

export default SelfAssessment;
