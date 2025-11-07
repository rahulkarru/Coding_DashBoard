import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import CodeforcesCard from "./cards/CodeforcesCard";
import CodeChefCard from "./cards/CodeChefCard";
import LeetCodeCard from "./cards/LeetCodeCard";
import useThemedStyles from "../styles/useThemedStyles.js";

import { fetchCodeforcesData } from "../services/codeforces";
import { fetchLeetCode } from "../services/leetcode";
import { fetchCodeChef } from "../services/codechef";

const USER_HANDLE = "rahul_karru";
const CF_HANDLE = USER_HANDLE;
const LC_HANDLE = USER_HANDLE;
const CC_HANDLE = USER_HANDLE;

// Responsive chart height hook
const useChartHeight = () => {
  const compute = () => {
    const w = window.innerWidth || 1200;
    if (w >= 1600) return 480;
    if (w >= 1280) return 420;
    if (w >= 992) return 360;
    if (w >= 768) return 300;
    return 260;
  };
  const [height, setHeight] = useState(compute);
  useEffect(() => {
    const handleResize = () => setHeight(compute());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return height;
};

// Helper: Fill gaps in history for a platform
const fillGaps = (history, allDates) => {
  if (!history.length) return [];
  const sortedHistory = history.sort((a, b) => new Date(a.date) - new Date(b.date));
  const filled = [];
  let lastRating = null;

  for (const date of allDates) {
    const entry = sortedHistory.find((h) => h.date === date);
    if (entry) {
      lastRating = entry.rating;
      filled.push(entry);
    } else if (lastRating !== null) {
      filled.push({ date, rating: lastRating, platform: sortedHistory[0].platform });
    }
  }
  return filled;
};

const UnifiedDashboard = () => {
  const [theme, setTheme] = useState("light"); // Theme state
  const { baseStyles, cardBase } = useThemedStyles(theme); // Pass theme
  const chartHeight = useChartHeight();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        const [cfData, lcData, ccData] = await Promise.all([
          fetchCodeforcesData(CF_HANDLE),
          fetchLeetCode(LC_HANDLE),
          fetchCodeChef(CC_HANDLE),
        ]);

        const lcHistory = lcData.history || [];

        // Get all unique dates up to today (no future dates)
        const today = new Date().toISOString().split('T')[0];
        const allDates = [
          ...(cfData.history || []),
          ...(ccData.history || []),
          ...lcHistory,
        ]
          .map((d) => d.date)
          .filter((date) => date <= today) // Only past/current dates
          .filter((date, index, arr) => arr.indexOf(date) === index) // Unique
          .sort((a, b) => new Date(a) - new Date(b));

        // Fill gaps for each platform
        const cfFilled = fillGaps((cfData.history || []).map(h => ({ ...h, platform: "CF" })), allDates);
        const ccFilled = fillGaps((ccData.history || []).map(h => ({ ...h, platform: "CC" })), allDates);
        const lcFilled = fillGaps(lcHistory.map(h => ({ ...h, platform: "LC" })), allDates);

        // Combine filled histories
        const combinedHistory = [...cfFilled, ...ccFilled, ...lcFilled].sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );

        setData({
          cf: cfData,
          lc: lcData,
          cc: ccData,
          allHistory: combinedHistory,
        });
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  if (loading)
    return <div style={baseStyles.loading}>Loading Unified CP Data…</div>;
  if (!data)
    return <div style={baseStyles.error}>Error loading dashboard data.</div>;

  console.log("✅ Codeforces:", data.cf);
  console.log("✅ CodeChef:", data.cc);
  console.log("✅ LeetCode:", data.lc);

  return (
    <div style={baseStyles.page}>
      {/* Small Theme Toggle Button at Top Right Edge */}
      <button
        onClick={toggleTheme}
        style={{
          position: "fixed",
          top: "10px",
          right: "10px",
          padding: "6px 10px",
          backgroundColor: theme === "light" ? "#333" : "#fff",
          color: theme === "light" ? "#fff" : "#333",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "12px",
          zIndex: 1000, // Ensure it's on top
        }}
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>

      {/* Header */}
      <div style={baseStyles.headerCard}>
        <h1 style={baseStyles.title}>
          🚀 Unified Competitive Programming Profile: {USER_HANDLE}
        </h1>
      </div>

      <hr style={baseStyles.hr} />

      {/* Cards Section */}
      <div style={baseStyles.gridCards}>
        <CodeforcesCard
          summary={data.cf.summary}
          contestsAttended={data.cf.contestsAttended}
          link={`https://codeforces.com/profile/${CF_HANDLE}`}
        />
        <LeetCodeCard
          rating={data.lc.rating}
          contestsAttended={data.lc.contestsAttended}
          link={`https://leetcode.com/u/${LC_HANDLE}`}
        />
        <CodeChefCard
          currentRating={data.cc.currentRating}
          starRating={data.cc.starRating}
          peakRating={data.cc.peakRating}
          link={`https://www.codechef.com/users/${CC_HANDLE}`}
        />
      </div>

      <h2 style={baseStyles.sectionTitle}>📊 Rating Comparison Over Time</h2>

      {/* Graph */}
      <div
        style={{
          width: "100%",
          maxWidth: "1280px",
          margin: "0 auto",
        }}
      >
        <ResponsiveContainer width="100%" height={chartHeight}>
          <LineChart
            data={data.allHistory}
            margin={{ top: 5, right: 20, left: 12, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={cardBase.gridStroke} />
            <XAxis dataKey="date" tick={cardBase.axis} />
            <YAxis tick={cardBase.axis} />
            <Tooltip contentStyle={cardBase.tooltip} />
            <Legend />

            <Line
              type="monotone"
              dataKey="rating"
              name="Codeforces"
              data={data.allHistory.filter((d) => d.platform === "CF")}
              stroke="#179cde"
              strokeWidth={2.2}
              dot={false}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="rating"
              name="CodeChef"
              data={data.allHistory.filter((d) => d.platform === "CC")}
              stroke="#3d4451"
              strokeWidth={2.2}
              dot={false}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="rating"
              name="LeetCode"
              data={data.allHistory.filter((d) => d.platform === "LC")}
              stroke="#f89f1b"
              strokeWidth={2.2}
              dot={false}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <hr style={baseStyles.hr} />
    </div>
  );
};

export default UnifiedDashboard;
