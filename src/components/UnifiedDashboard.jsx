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

// ✅ Normalize date helper (ensures consistent YYYY-MM-DD format)
const normalizeDate = (dateString) => {
  if (!dateString) return null;
  const d = new Date(dateString);
  if (isNaN(d)) return null;
  return d.toISOString().split("T")[0];
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
  const [theme, setTheme] = useState("light");
  const { baseStyles, cardBase } = useThemedStyles(theme);
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

        // Normalize all history dates
        const cfHistory = (cfData.history || []).map((h) => ({
          ...h,
          date: normalizeDate(h.date),
        }));
        const lcHistory = (lcData.history || []).map((h) => ({
          ...h,
          date: normalizeDate(h.date),
        }));
        const ccHistory = (ccData.history || []).map((h) => ({
          ...h,
          date: normalizeDate(h.date),
        }));

       
const now = new Date();
const oneYearAgo = new Date();
oneYearAgo.setFullYear(now.getFullYear() - 1);

const allDates = [
  ...cfHistory.map((d) => d.date),
  ...lcHistory.map((d) => d.date),
  ...ccHistory.map((d) => d.date),
]
  .filter(Boolean)
  .map((date) => normalizeDate(date))
  .filter((date) => {
    const d = new Date(date);
    return d >= oneYearAgo && d <= now;
  })
  .filter((date, idx, arr) => arr.indexOf(date) === idx)
  .sort((a, b) => new Date(a) - new Date(b));


        // Fill missing points
        const cfFilled = fillGaps(
          cfHistory.map((h) => ({ ...h, platform: "CF" })),
          allDates
        );
        const lcFilled = fillGaps(
          lcHistory.map((h) => ({ ...h, platform: "LC" })),
          allDates
        );
        const ccFilled = fillGaps(
          ccHistory.map((h) => ({ ...h, platform: "CC" })),
          allDates
        );

        // ✅ Unified structure for Recharts
        const unifiedHistory = allDates.map((date) => {
          const cf = cfFilled.find((h) => h.date === date);
          const lc = lcFilled.find((h) => h.date === date);
          const cc = ccFilled.find((h) => h.date === date);
          return {
            date,
            CF: cf ? cf.rating : null,
            LC: lc ? lc.rating : null,
            CC: cc ? cc.rating : null,
          };
        });

        console.log("✅ Unified sample:", unifiedHistory.slice(0, 5));

        setData({
          cf: cfData,
          lc: lcData,
          cc: ccData,
          unifiedHistory,
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
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };
  
  if (loading) return <div style={baseStyles.loading}>Loading Unified CP Data…</div>;
  if (!data) return <div style={baseStyles.error}>Error loading dashboard data.</div>;

  return (
    <div style={baseStyles.page}>
      {/* Theme Toggle */}
      {/* 
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
          zIndex: 1000,
        }}
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>
*/}
      {/* Header */}
      <div style={baseStyles.headerCard}>
        <h1 style={baseStyles.title}>
          🚀 Unified Competitive Programming Profile: {USER_HANDLE}
        </h1>
      </div>

      <hr style={baseStyles.hr} />

      {/* Cards */}
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
          contestsAttended={data.cc.contestsAttended} 
          link={`https://www.codechef.com/users/${CC_HANDLE}`}
        />
      </div>

      <h2 style={baseStyles.sectionTitle}>📊 Rating Comparison Over Time</h2>

      {/* Unified Chart */}
      <div style={{ width: "100%", maxWidth: "1280px", margin: "0 auto" }}>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <LineChart
            data={data.unifiedHistory}
            margin={{ top: 5, right: 20, left: 12, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={cardBase.gridStroke} />
            <XAxis dataKey="date" tick={cardBase.axis} />
            <YAxis tick={cardBase.axis} />
            <Tooltip contentStyle={cardBase.tooltip} />
            <Legend />

            <Line
              type="monotone"
              dataKey="CF"
              name="Codeforces"
              stroke="#179cde"
              strokeWidth={2.2}
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="CC"
              name="CodeChef"
              stroke="#3d4451"
              strokeWidth={2.2}
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="LC"
              name="LeetCode"
              stroke="#f89f1b"
              strokeWidth={2.2}
              dot={false}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <hr style={baseStyles.hr} />
    </div>
  );
};

export default UnifiedDashboard;
