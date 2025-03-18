import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import axios from "axios";

const SleepTracker = ({ userId }) => {
  const [sleepData, setSleepData] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return; // Do nothing if no userId is provided

    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_LINK || ""}/api/sleep/trends/${userId}`,
          { withCredentials: true }
        );
        setSleepData(response.data.trends);
        setAiAnalysis(response.data.aiAnalysis);
      } catch (err) {
        console.error("Error fetching sleep trends:", err);
        setError("Failed to load sleep trends");
      }
    };

    fetchData();
  }, [userId]);

  const chartData = {
    labels: sleepData.map((data, index) => `Day ${index + 1}`),
    datasets: [
      {
        label: "Sleep Hours",
        data: sleepData.map((data) => data.sleepHours),
        fill: false,
        borderColor: "blue",
        tension: 0.1,
      },
      {
        label: "Sleep Quality",
        data: sleepData.map((data) => data.sleepQuality),
        fill: false,
        borderColor: "green",
        tension: 0.1,
      },
    ],
  };

  return (
    <div>
      <h2>Sleep Tracker</h2>
      {error ? (
        <p>{error}</p>
      ) : (
        <>
          <Line data={chartData} />
          <h3>AI-Generated Insights</h3>
          <p>{aiAnalysis}</p>
        </>
      )}
    </div>
  );
};

export default SleepTracker;
