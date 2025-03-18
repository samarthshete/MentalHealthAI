import React from "react";
import styles from "./StepProgressBar.module.css";

const StepProgressBar = ({ currentStep, totalSteps }) => {
  const progressPercentage =
    totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <div className={styles.stepIndicator}>
        Step {currentStep} of {totalSteps}
      </div>
    </div>
  );
};

export default StepProgressBar;
