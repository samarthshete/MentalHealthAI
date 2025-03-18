import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Markdown from "react-markdown";
import { Line as ChartLine, Bar, Radar } from "react-chartjs-2";
import { CategoryScale } from "chart.js";
import Chart from "chart.js/auto";
import { Logo } from "../../svgs/logoSVG";
import LoginContext from "../../context/context";
import { useTherapeuticJourney } from "../../context/TherapeuticJourneyContext";
import {
  IoArrowBackSharp,
  IoChevronForward,
  IoInformationCircleOutline,
  IoMoon,
  IoSunny,
} from "react-icons/io5";
import { LuLogIn, LuLogOut } from "react-icons/lu";
import styles from "./analysis.module.css";

Chart.register(CategoryScale);

// Convert a timestamp into a formatted date string
function timestampToDate(timestamp) {
  const date = new Date(timestamp);
  const day = ("0" + date.getDate()).slice(-2);
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const year = date.getFullYear();
  const hours = ("0" + date.getHours()).slice(-2);
  const minutes = ("0" + date.getMinutes()).slice(-2);
  const seconds = ("0" + date.getSeconds()).slice(-2);
  const ampm = date.getHours() >= 12 ? "PM" : "AM";
  const formattedHours = date.getHours() % 12 || 12;
  return `${day}-${month}-${year} ${formattedHours}:${minutes}:${seconds} ${ampm}`;
}

// Scoring scales and visual mappings
const scoreMapArr = [
  "Excellent",
  "Very Good",
  "Good",
  "Above Average",
  "Average",
  "Below Average",
  "Fair",
  "Poor",
  "Very Poor",
  "Urgent Attention Needed",
];

const scoreMapBgcolArr = [
  "#4CAF50",
  "#8BC34A",
  "#FFC107",
  "#FF9800",
  "#FF5722",
  "#F44336",
  "#E91E63",
  "#9C27B0",
  "#673AB7",
  "#3F51B5",
];

const scoreMapTxtcolArr = [
  "#fff",
  "#000",
  "#000",
  "#000",
  "#fff",
  "#fff",
  "#fff",
  "#fff",
  "#fff",
  "#fff",
];

// Therapeutic journey stages visualization component
const TherapyJourneyProgress = ({ currentStage }) => {
  const stages = [
    { id: "INITIAL_ENGAGEMENT", label: "Initial Engagement" },
    { id: "ASSESSMENT", label: "Self-Assessment" },
    { id: "ANALYSIS", label: "Analysis & Insights" },
    { id: "INTERVENTIONS", label: "Interventions" },
    { id: "PROFESSIONAL_HELP", label: "Professional Support" },
  ];

  // Find the index for the current stage; default to 0 if not found
  const currentIndex =
    stages.findIndex((stage) => stage.id === currentStage) >= 0
      ? stages.findIndex((stage) => stage.id === currentStage)
      : 0;

  return (
    <div className={styles.journeyProgress}>
      <h3>Your Therapeutic Journey</h3>
      <div className={styles.progressSteps}>
        {stages.map((stage, index) => (
          <div
            key={stage.id}
            className={`${styles.journeyStep} ${
              index <= currentIndex ? styles.completedStep : ""
            }`}
          >
            <div className={styles.stepIcon}>{index + 1}</div>
            <div className={styles.stepLabel}>{stage.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Wellness score chart component
function ScoreChart({ dataset }) {
  // Compute sampleData from dataset (reverse to show oldest first)
  const sampleData = dataset
    .map((rep) => ({
      score: 11 - parseInt(rep.score, 10),
      timestamp: rep.timestamp,
    }))
    .reverse();

  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Wellness",
        data: [],
        fill: false,
        borderColor: "purple",
        pointBackgroundColor: "black",
        pointBorderColor: "black",
        pointBorderWidth: 2,
        pointHoverBorderWidth: 0,
        borderWidth: 2,
        tension: 0.2,
      },
    ],
  });

  useEffect(() => {
    const timestamps = sampleData.map((data) =>
      new Date(data.timestamp).toLocaleDateString()
    );
    const scores = sampleData.map((data) => data.score);

    setChartData((prevData) => ({
      ...prevData,
      labels: timestamps,
      datasets: [
        {
          ...prevData.datasets[0],
          data: scores,
        },
      ],
    }));
  }, [dataset, sampleData]);

  const lineOptions = {
    scales: {
      x: {
        display: false,
        title: { display: false, text: "Timestamp" },
        ticks: { display: false },
        grid: { display: false },
      },
      y: {
        type: "linear",
        display: true,
        title: { display: false, text: "Mental Health" },
        max: 10,
        min: 1,
        ticks: { stepSize: 1, display: true },
        grid: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    maintainAspectRatio: false,
    responsive: true,
  };

  return (
    <div style={{ height: "200px", width: "100%" }}>
      <ChartLine data={chartData} options={lineOptions} />
    </div>
  );
}

// Burnout dimensions radar chart for healthcare professionals
function BurnoutRadarChart({ report }) {
  const burnoutData = {
    labels: [
      "Emotional Exhaustion",
      "Depersonalization",
      "Reduced Accomplishment",
      "Compassion Fatigue",
      "Work-Life Balance",
    ],
    datasets: [
      {
        label: "Your Burnout Profile",
        data: [
          report?.emotionalExhaustion || 2,
          report?.depersonalization || 2,
          report?.reducedAccomplishment || 2,
          report?.compassionFatigue || 2,
          report?.workLifeImbalance || 2,
        ],
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        borderColor: "rgb(255, 99, 132)",
        pointBackgroundColor: "rgb(255, 99, 132)",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "rgb(255, 99, 132)",
      },
    ],
  };

  const radarOptions = {
    scales: {
      r: {
        min: 0,
        max: 5,
        ticks: { stepSize: 1, display: false },
      },
    },
    elements: { line: { borderWidth: 3 } },
  };

  return (
    <div style={{ height: "220px", width: "100%" }}>
      <Radar data={burnoutData} options={radarOptions} />
    </div>
  );
}

// Loading animation component
function LoaderRipple() {
  return (
    <div className={styles["lds-ripple"]}>
      <div></div>
      <div></div>
    </div>
  );
}

// Main Analysis component
function Analysis() {
  const navigate = useNavigate();
  const [curState, setCurState] = useState("loading");
  const [curRep, setCurRep] = useState(null);
  const [analysisHist, setAnalysisHist] = useState([]);
  const [fetchNew, setFetchNew] = useState(false);
  const { logout, loggedIn } = useContext(LoginContext);
  const { therapyStage, setTherapyStage } = useTherapeuticJourney();
  const [moodData, setMoodData] = useState([]);
  const [sleepData, setSleepData] = useState([]);
  const [activeTab, setActiveTab] = useState("mental");
  const [shiftImpactData, setShiftImpactData] = useState({});

  // Function to fetch mood and sleep data
  const fetchMoodAndSleepData = async () => {
    try {
      const moodResponse = await axios.get(
        `${process.env.REACT_APP_API_LINK}/mood/data`,
        { withCredentials: true }
      );
      setMoodData(moodResponse.data);

      const sleepResponse = await axios.get(
        `${process.env.REACT_APP_API_LINK}/sleep/data`,
        { withCredentials: true }
      );
      if (sleepResponse.data.entries) {
        setSleepData(sleepResponse.data.entries);
      }

      const moodStats = await axios.get(
        `${process.env.REACT_APP_API_LINK}/mood/stats`,
        { withCredentials: true }
      );
      if (moodStats.data.shiftTypeImpact) {
        setShiftImpactData(moodStats.data.shiftTypeImpact);
      }
    } catch (error) {
      console.error("Error fetching mood and sleep data:", error);
    }
  };

  // Fetch analysis history and related data on component mount
  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_LINK}/fetchanalysis`,
          { withCredentials: true }
        );
        setAnalysisHist(data.data);
        setCurState("list");

        if (
          data.data &&
          data.data.length > 0 &&
          data.data[0].conversationStage
        ) {
          setTherapyStage(data.data[0].conversationStage);
        }

        fetchMoodAndSleepData();
      } catch (error) {
        console.error("Error fetching analysis history:", error);
        setCurState("error");
      }
    }
    fetchData();
  }, [setTherapyStage]);

  // Function to fetch a new analysis report
  async function fetchNewAnalysis() {
    setFetchNew(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_LINK}/analysis`,
        { withCredentials: true }
      );

      if (data.msg === "nochatdata") {
        setCurState("nochatdata");
      } else if (data?.data) {
        setAnalysisHist((prev) => {
          return [{ ...data.data, new: true }, ...prev];
        });

        if (data.data.conversationStage) {
          setTherapyStage(data.data.conversationStage);
        }

        fetchMoodAndSleepData();
      }
    } catch (error) {
      console.error("Error fetching analysis:", error);
    }
    setFetchNew(false);
  }

  // Logout user function
  const logoutUser = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_LINK}/logout`,
        { withCredentials: true }
      );
      if (data?.msg === "loggedout") {
        logout();
      }
    } catch (error) {
      console.error("Error in logout:", error);
    }
  };

  return (
    <div className={styles.analysisContainer}>
      <header>
        <div
          className={styles.logoContainer}
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          <Logo />
          <div className={styles.headerText}>
            <h4>MindMate</h4>
            <h6>Healthcare Professional Wellbeing</h6>
          </div>
        </div>
        <div className="flex flex-row gap-4">
          {loggedIn && (
            <button onClick={() => navigate("/message")}>Chat</button>
          )}
          <button
            onClick={() => {
              !loggedIn ? navigate("/login") : logoutUser();
            }}
          >
            {!loggedIn ? <LuLogIn /> : <LuLogOut />}
          </button>
        </div>
      </header>

      <main style={{ minHeight: "100vh" }}>
        {/* Therapeutic Journey Progress Indicator */}
        <TherapyJourneyProgress currentStage={therapyStage} />

        {/* Tabs Navigation */}
        <div className={styles.tabsContainer}>
          <button
            className={`${styles.tabButton} ${
              activeTab === "mental" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("mental")}
          >
            Mental Health
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "mood" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("mood")}
          >
            Mood Tracking
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "sleep" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("sleep")}
          >
            Sleep Patterns
          </button>
          <button
            className={`${styles.tabButton} ${
              activeTab === "work" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("work")}
          >
            Work Impact
          </button>
        </div>

        {/* Mental Health Tab */}
        {activeTab === "mental" && (
          <>
            <section className={styles.chartCont}>
              <ScoreChart dataset={analysisHist} />
              <h2>Your Mental Wellness</h2>
            </section>

            <section className={styles.butCont}>
              <button
                onClick={fetchNewAnalysis}
                disabled={fetchNew}
                className={styles.fetchNewBut}
              >
                New Analysis
              </button>
              {curState === "details" && (
                <button
                  onClick={() => {
                    setCurState("list");
                    setCurRep(null);
                  }}
                  className={styles.backBut}
                >
                  <IoArrowBackSharp />
                </button>
              )}
            </section>

            <section>
              {curState === "loading" && (
                <div style={{ textAlign: "center" }}>
                  <LoaderRipple />
                </div>
              )}

              {curState === "nochatdata" && (
                <div style={{ textAlign: "center" }}>
                  No Chat History Data!
                  <br />
                  Chat with us before analyzing.
                </div>
              )}

              {curState === "list" && analysisHist.length === 0 && (
                <div style={{ textAlign: "center" }}>
                  No Previous Report!
                  <br />
                  Click "New Analysis" to generate one.
                </div>
              )}

              {curState === "list" && analysisHist.length > 0 && (
                <div className={styles.analList}>
                  {analysisHist.map((rep, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setCurRep(rep);
                        setCurState("details");
                      }}
                      className={`${styles.analItem} ${
                        rep?.new ? styles.newAnalItem : ""
                      }`}
                    >
                      <span>
                        {rep.conversationStage && (
                          <span className={styles.stageIndicator}>
                            {rep.conversationStage.replace(/_/g, " ")}
                          </span>
                        )}
                      </span>
                      <span>{timestampToDate(rep.timestamp)}</span>
                      <span>
                        <IoChevronForward />
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {curState === "details" && curRep && (
                <div className={styles.analDetails} key={curRep.timestamp}>
                  <div className={styles.analDetailsTop}>
                    <div
                      className={styles.analDetailsScore}
                      style={{
                        backgroundColor: scoreMapBgcolArr[curRep.score - 1],
                        color: scoreMapTxtcolArr[curRep.score - 1],
                      }}
                    >
                      {curRep.score} :{" "}
                      {curRep.score && scoreMapArr[curRep.score - 1]}
                    </div>
                    <div className={styles.analDetailsTimestamp}>
                      {timestampToDate(curRep.timestamp)}
                    </div>
                  </div>

                  {curRep.conversationStage === "ANALYSIS" && (
                    <div className={styles.burnoutRadar}>
                      <h3>Burnout Dimensions</h3>
                      <BurnoutRadarChart report={curRep} />
                    </div>
                  )}

                  <div className={styles.analDetailsReport}>
                    <h3>Analysis</h3>
                    <Markdown>{curRep.analysis}</Markdown>
                  </div>

                  {curRep.sleepAnalysis && (
                    <div className={styles.analDetailsSleep}>
                      <h3>Sleep Analysis</h3>
                      <Markdown>{curRep.sleepAnalysis}</Markdown>
                    </div>
                  )}

                  {curRep.interventions && (
                    <div className={styles.analDetailsInterventions}>
                      <h3>Recommended Interventions</h3>
                      <Markdown>{curRep.interventions}</Markdown>
                    </div>
                  )}

                  {curRep.professionalHelp && (
                    <div className={styles.analDetailsProfessionalHelp}>
                      <h3>Professional Support Options</h3>
                      <Markdown>{curRep.professionalHelp}</Markdown>
                    </div>
                  )}

                  <div className={styles.analDetailsKeywords}>
                    {curRep.keywords?.map((kw) => (
                      <span key={kw}>{kw}</span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        {/* Mood Tracking Tab */}
        {activeTab === "mood" && (
          <>
            <section className={styles.chartCont}>
              <h2>Mood & Energy Tracking</h2>
              {moodData.length > 0 ? (
                <div style={{ height: "300px", width: "100%" }}>
                  <ChartLine
                    data={{
                      labels: moodData.map((entry) =>
                        new Date(entry.timestamp).toLocaleDateString()
                      ),
                      datasets: [
                        {
                          label: "Mood",
                          data: moodData.map((entry) => entry.moodScore),
                          borderColor: "rgb(75, 192, 192)",
                          tension: 0.1,
                        },
                        {
                          label: "Energy",
                          data: moodData.map((entry) => entry.energyLevel),
                          borderColor: "rgb(255, 205, 86)",
                          tension: 0.1,
                        },
                        {
                          label: "Stress",
                          data: moodData.map((entry) => entry.stressLevel),
                          borderColor: "rgb(255, 99, 132)",
                          tension: 0.1,
                        },
                      ],
                    }}
                    options={{
                      scales: {
                        y: {
                          min: 1,
                          max: 5,
                          ticks: { stepSize: 1 },
                        },
                      },
                      maintainAspectRatio: false,
                      responsive: true,
                    }}
                  />
                </div>
              ) : (
                <div className={styles.noDataMessage}>
                  No mood data available. Start tracking your mood to see
                  visualizations.
                </div>
              )}
            </section>

            <button
              onClick={() => navigate("/mood-entry")}
              className={styles.actionButton}
            >
              Log New Mood Entry
            </button>
          </>
        )}

        {/* Sleep Patterns Tab */}
        {activeTab === "sleep" && (
          <>
            <section className={styles.chartCont}>
              <h2>Sleep Patterns</h2>
              {sleepData.length > 0 ? (
                <div style={{ height: "300px", width: "100%" }}>
                  <Bar
                    data={{
                      labels: sleepData.map((entry) =>
                        new Date(entry.createdAt).toLocaleDateString()
                      ),
                      datasets: [
                        {
                          label: "Sleep Hours",
                          data: sleepData.map((entry) => entry.sleepHours),
                          backgroundColor: "rgba(53, 162, 235, 0.5)",
                          borderColor: "rgb(53, 162, 235)",
                          borderWidth: 1,
                        },
                        {
                          label: "Sleep Quality (x2)",
                          data: sleepData.map(
                            (entry) => entry.sleepQuality * 2
                          ),
                          backgroundColor: "rgba(255, 159, 64, 0.5)",
                          borderColor: "rgb(255, 159, 64)",
                          borderWidth: 1,
                        },
                      ],
                    }}
                    options={{
                      scales: {
                        y: {
                          title: {
                            display: true,
                            text: "Hours / Quality (x2)",
                          },
                          min: 0,
                          max: 12,
                        },
                      },
                      maintainAspectRatio: false,
                      responsive: true,
                    }}
                  />
                </div>
              ) : (
                <div className={styles.noDataMessage}>
                  No sleep data available. Start tracking your sleep to see
                  visualizations.
                </div>
              )}
            </section>

            <button
              onClick={() => navigate("/sleep-assessment")}
              className={styles.actionButton}
            >
              Log Sleep Data
            </button>
          </>
        )}

        {/* Work Impact Tab */}
        {activeTab === "work" && (
          <>
            <section className={styles.chartCont}>
              <h2>Healthcare Work Impact</h2>
              {Object.keys(shiftImpactData).length > 0 ? (
                <div className={styles.workImpactContainer}>
                  <h3>Shift Type Impact on Wellbeing</h3>
                  <div className={styles.shiftTable}>
                    <table>
                      <thead>
                        <tr>
                          <th>Shift Type</th>
                          <th>Avg. Mood</th>
                          <th>Avg. Stress</th>
                          <th>Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(shiftImpactData).map(
                          ([shift, data]) => (
                            <tr key={shift}>
                              <td>
                                {shift === "day"
                                  ? "Day Shift"
                                  : shift === "night"
                                  ? "Night Shift"
                                  : shift === "on-call"
                                  ? "On-Call"
                                  : "Off Duty"}
                              </td>
                              <td>{data.avgMood.toFixed(1)}</td>
                              <td>{data.avgStress.toFixed(1)}</td>
                              <td>{data.count}</td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className={styles.workRecommendations}>
                    <h3>Shift Recovery Recommendations</h3>
                    <ul>
                      <li>
                        <strong>After Night Shifts:</strong> Allow 48 hours for
                        circadian rhythm adjustment. Use blackout curtains when
                        sleeping during daylight.
                      </li>
                      <li>
                        <strong>Between Shifts:</strong> Implement a 10-minute
                        "transition ritual" to mentally separate work from home.
                      </li>
                      <li>
                        <strong>During Long Shifts:</strong> Take 5-minute
                        mindfulness breaks every 3 hours to reset attention and
                        reduce stress accumulation.
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className={styles.noDataMessage}>
                  No work impact data available. Log mood entries with shift
                  information to see patterns.
                </div>
              )}
            </section>

            <div className={styles.nextStepsContainer}>
              <h3>Next Steps in Your Journey</h3>
              <div className={styles.journeyActions}>
                {therapyStage === "INITIAL_ENGAGEMENT" && (
                  <button
                    onClick={() => navigate("/self-assessment")}
                    className={styles.journeyButton}
                  >
                    Begin Self-Assessment
                  </button>
                )}
                {therapyStage === "ASSESSMENT" && (
                  <button
                    onClick={() => navigate("/analysis")}
                    className={styles.journeyButton}
                  >
                    Complete Your Assessment
                  </button>
                )}
                {therapyStage === "ANALYSIS" && (
                  <button
                    onClick={fetchNewAnalysis}
                    className={styles.journeyButton}
                  >
                    Generate Personalized Interventions
                  </button>
                )}
                {therapyStage === "INTERVENTIONS" && (
                  <button
                    onClick={() => navigate("/mood-entry")}
                    className={styles.journeyButton}
                  >
                    Track Intervention Effectiveness
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default Analysis;
