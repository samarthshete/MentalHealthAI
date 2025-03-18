import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./SleepAssessmentForm.module.css";

// Factors that may affect sleep quality
const sleepFactors = [
  "Work Stress",
  "Caffeine",
  "Screen Time",
  "Exercise",
  "Alcohol",
  "Late Meal",
  "Noise",
  "Temperature",
  "Shift Change",
  "Anxiety",
  "Pain",
  "Medication",
];

const SleepAssessmentForm = () => {
  const navigate = useNavigate();

  // Form state with default values
  const [formData, setFormData] = useState({
    sleepHours: "",
    sleepQuality: 3,
    mood: "",
    stressLevel: 3,
    factors: [],
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Handle text and select input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle slider (range) changes and convert value to integer
  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseInt(value, 10) }));
  };

  // Toggle sleep factor selection
  const toggleFactor = (factor) => {
    setFormData((prev) => {
      const newFactors = prev.factors.includes(factor)
        ? prev.factors.filter((f) => f !== factor)
        : [...prev.factors, factor];
      return { ...prev, factors: newFactors };
    });
  };

  // Submit the sleep assessment data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Ensure required fields are provided
    if (!formData.sleepHours || !formData.mood) {
      setError("Sleep hours and mood are required");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${process.env.REACT_APP_API_LINK}/sleep`, formData, {
        withCredentials: true,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/analysis");
      }, 2000);
    } catch (error) {
      console.error("Error submitting sleep assessment:", error);
      setError("Failed to save your sleep assessment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Display success message if submission was successful
  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.successMessage}>
          <h2>Sleep Assessment Saved!</h2>
          <p>Redirecting to your analysis page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>Sleep Assessment</h1>
      {error && <div className={styles.errorMessage}>{error}</div>}
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Sleep Hours Input */}
        <div className={styles.formGroup}>
          <label>How many hours did you sleep last night?*</label>
          <input
            type="number"
            name="sleepHours"
            value={formData.sleepHours}
            onChange={handleChange}
            min="0"
            max="24"
            step="0.5"
            required
            className={styles.input}
          />
        </div>

        {/* Sleep Quality Slider */}
        <div className={styles.formGroup}>
          <label>Sleep Quality: {formData.sleepQuality}/5</label>
          <input
            type="range"
            name="sleepQuality"
            min="1"
            max="5"
            value={formData.sleepQuality}
            onChange={handleSliderChange}
            className={styles.slider}
          />
          <div className={styles.sliderLabels}>
            <span>Very Poor</span>
            <span>Excellent</span>
          </div>
        </div>

        {/* Mood Input */}
        <div className={styles.formGroup}>
          <label>How would you describe your mood today?*</label>
          <input
            type="text"
            name="mood"
            value={formData.mood}
            onChange={handleChange}
            className={styles.input}
            placeholder="e.g., Rested, Tired, Anxious, Energetic"
            required
          />
        </div>

        {/* Stress Level Slider */}
        <div className={styles.formGroup}>
          <label>Stress Level: {formData.stressLevel}/5</label>
          <input
            type="range"
            name="stressLevel"
            min="1"
            max="5"
            value={formData.stressLevel}
            onChange={handleSliderChange}
            className={styles.slider}
          />
          <div className={styles.sliderLabels}>
            <span>Very Low</span>
            <span>Very High</span>
          </div>
        </div>

        {/* Sleep Factors */}
        <div className={styles.formGroup}>
          <label>
            What factors affected your sleep? (Select all that apply)
          </label>
          <div className={styles.factorsContainer}>
            {sleepFactors.map((factor) => (
              <button
                key={factor}
                type="button"
                onClick={() => toggleFactor(factor)}
                className={`${styles.factorButton} ${
                  formData.factors.includes(factor) ? styles.factorSelected : ""
                }`}
              >
                {factor}
              </button>
            ))}
          </div>
        </div>

        {/* Additional Notes */}
        <div className={styles.formGroup}>
          <label>Additional Notes (Optional)</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className={styles.textarea}
            placeholder="Any other thoughts about your sleep..."
          ></textarea>
        </div>

        {/* Cancel and Submit Buttons */}
        <div className={styles.buttonContainer}>
          <button
            type="button"
            onClick={() => navigate("/analysis")}
            className={styles.cancelButton}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? "Saving..." : "Save Sleep Assessment"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SleepAssessmentForm;
