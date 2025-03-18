import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./MoodEntryForm.module.css";

// List of mood tags for the user to select
const moodTags = [
  "Stressed",
  "Overwhelmed",
  "Tired",
  "Anxious",
  "Calm",
  "Focused",
  "Satisfied",
  "Frustrated",
  "Motivated",
  "Disconnected",
  "Balanced",
  "Post-call",
  "Patient Interaction",
  "Administrative",
  "Team Conflict",
];

// Available shift types
const shiftTypes = [
  { value: "day", label: "Day Shift" },
  { value: "night", label: "Night Shift" },
  { value: "on-call", label: "On Call" },
  { value: "off", label: "Off Duty" },
];

const MoodEntryForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    moodScore: 3,
    energyLevel: 3,
    stressLevel: 3,
    sleepHours: "",
    sleepQuality: 3,
    tags: [],
    notes: "",
    workStatus: "working",
    shiftType: "day",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Handles text and select input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handles slider (range) input changes and parses the value to an integer
  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseInt(value, 10) }));
  };

  // Toggles mood tags in the form data
  const toggleTag = (tag) => {
    setFormData((prev) => {
      const newTags = prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag];
      return { ...prev, tags: newTags };
    });
  };

  // Submits the mood entry data to the backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post(`${process.env.REACT_APP_API_LINK}/mood`, formData, {
        withCredentials: true,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/analysis");
      }, 2000);
    } catch (error) {
      console.error("Error submitting mood entry:", error);
      setError("Failed to save your mood entry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={styles.container}>
        <div className={styles.successMessage}>
          <h2>Mood Entry Saved!</h2>
          <p>Redirecting to your analysis page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1>How are you feeling?</h1>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Mood Score Slider */}
        <div className={styles.formGroup}>
          <label>Mood: {formData.moodScore}/5</label>
          <input
            type="range"
            name="moodScore"
            min="1"
            max="5"
            value={formData.moodScore}
            onChange={handleSliderChange}
            className={styles.slider}
          />
          <div className={styles.sliderLabels}>
            <span>Very Poor</span>
            <span>Excellent</span>
          </div>
        </div>

        {/* Energy Level Slider */}
        <div className={styles.formGroup}>
          <label>Energy: {formData.energyLevel}/5</label>
          <input
            type="range"
            name="energyLevel"
            min="1"
            max="5"
            value={formData.energyLevel}
            onChange={handleSliderChange}
            className={styles.slider}
          />
          <div className={styles.sliderLabels}>
            <span>Exhausted</span>
            <span>Energetic</span>
          </div>
        </div>

        {/* Stress Level Slider */}
        <div className={styles.formGroup}>
          <label>Stress: {formData.stressLevel}/5</label>
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
            <span>Calm</span>
            <span>Very Stressed</span>
          </div>
        </div>

        {/* Sleep Hours Input */}
        <div className={styles.formGroup}>
          <label>Hours of Sleep Last Night</label>
          <input
            type="number"
            name="sleepHours"
            value={formData.sleepHours}
            onChange={handleChange}
            min="0"
            max="24"
            step="0.5"
            className={styles.input}
          />
        </div>

        {/* Sleep Quality Slider (conditionally rendered) */}
        {formData.sleepHours && (
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
        )}

        {/* Work Status Selection */}
        <div className={styles.formGroup}>
          <label>Work Status</label>
          <select
            name="workStatus"
            value={formData.workStatus}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="working">Currently Working</option>
            <option value="post-shift">Post-Shift</option>
            <option value="day-off">Day Off</option>
          </select>
        </div>

        {/* Shift Type Selection */}
        <div className={styles.formGroup}>
          <label>Current Shift Type</label>
          <select
            name="shiftType"
            value={formData.shiftType}
            onChange={handleChange}
            className={styles.select}
          >
            {shiftTypes.map((shift) => (
              <option key={shift.value} value={shift.value}>
                {shift.label}
              </option>
            ))}
          </select>
        </div>

        {/* Mood Tags */}
        <div className={styles.formGroup}>
          <label>
            What factors are affecting your mood? (Select all that apply)
          </label>
          <div className={styles.tagsContainer}>
            {moodTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`${styles.tagButton} ${
                  formData.tags.includes(tag) ? styles.tagSelected : ""
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Additional Notes */}
        <div className={styles.formGroup}>
          <label>Notes (Optional)</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className={styles.textarea}
            placeholder="Any additional thoughts about how you're feeling..."
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
            {loading ? "Saving..." : "Save Mood Entry"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MoodEntryForm;
