import React, { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

import CodeforcesCard from "./cards/CodeforcesCard";
import CodeChefCard from "./cards/CodeChefCard";
import LeetCodeCard from "./cards/LeetCodeCard";

import useThemedStyles from "../styles/useThemedStyles.js";
import { fetchCodeforcesData } from "../services/codeforces";
import { fetchLeetCode } from "../services/leetcode";
import { fetchCodeChef } from "../services/codechef";

// One user handle for all (customize per-platform if needed)
const USER_HANDLE = "rahul_karru";
const CF_HANDLE = USER_HANDLE;
const LC_HANDLE = USER_HANDLE;
const CC_HANDLE = USER_HANDLE;

// inside UnifiedDashboard.jsx
const useChartHeight = () => {
    const compute = () => {
      const w = window.innerWidth || 1200;
      if (w >= 1600) return 480;  // large screens
      if (w >= 1280) return 420;  // desktop
      if (w >= 992)  return 360;  // laptop
      if (w >= 768)  return 300;  // tablet
      return 260;                 // mobile
    };
    const [height, setHeight] = useState(compute);
  
    useEffect(() => {
      const handleResize = () => {
        requestAnimationFrame(() => setHeight(compute()));
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);
  
    return height;
  };
  // forces a chart redraw on resize and mount
const useForceUpdateOnResize = () => {
    const [, setTick] = useState(0);
    useEffect(() => {
      const handle = () => setTick((t) => t + 1);
      window.addEventListener("resize", handle);
      // also trigger once after load to fix first render
      setTimeout(handle, 300);
      return () => window.removeEventListener("resize", handle);
    }, []);
  };
  
  
const UnifiedDashboard = () => {
  const { baseStyles, cardBase } = useThemedStyles();
  const chartHeight = useChartHeight();
  useForceUpdateOnResize();   
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

        const combinedHistory = [...(cfData.history || []), ...(ccData.history || [])]
          .filter((d) => d.date && d.rating)
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setData({ cf: cfData, lc: lcData, cc: ccData, allHistory: combinedHistory });
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
    const id = setInterval(loadAllData, 24 * 60 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const xTickFormatter = (v) => v; // dates already formatted
  const yTickFormatter = (v) => (typeof v === "number" ? v : "");

  if (loading) return <div style={baseStyles.loading}>Loading Unified CP Data…</div>;
  if (!data) return <div style={baseStyles.error}>Error loading dashboard data.</div>;

  return (
    <div style={baseStyles.page}>
      {/* Header */}
      <div style={baseStyles.headerCard}>
        <h1 style={baseStyles.title}>🚀 Unified Competitive Programming Profile: {USER_HANDLE}</h1>
        
      </div>

      <hr style={baseStyles.hr} />

      {/* Cards */}
      <div style={baseStyles.gridCards}>
        <CodeforcesCard summary={data.cf.summary} link={`https://codeforces.com/profile/${CF_HANDLE}`} />
        <CodeChefCard
          currentRating={data.cc.currentRating}
          starRating={data.cc.starRating}
          peakRating={data.cc.peakRating}
          link={`https://www.codechef.com/users/${CC_HANDLE}`}
        />
        <LeetCodeCard
          totalSolved={data.lc.totalSolved}
          easy={data.lc.easy}
          medium={data.lc.medium}
          hard={data.lc.hard}
          peakRating={data.lc.peakRating}
          link={`https://leetcode.com/u/${LC_HANDLE}`}
        />
      </div>

      <h2 style={baseStyles.sectionTitle}>📊 Consolidated Rating Trend </h2>
      <div
  style={{
    width: "100%",
    maxWidth: "1280px",
    margin: "0 auto",
    display: "block",
  }}
>
  <ResponsiveContainer width="100%" height={chartHeight}>

          <LineChart data={data.allHistory} margin={{ top: 5, right: 20, left: 12, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={cardBase.gridStroke} />
            <XAxis dataKey="date" tick={cardBase.axis} tickFormatter={xTickFormatter} />
            <YAxis tick={cardBase.axis} tickFormatter={yTickFormatter} />
            <Tooltip contentStyle={cardBase.tooltip} labelStyle={{ opacity: 0.8 }} />

            <Line
              type="monotone"
              dataKey="rating"
              name="Codeforces Rating"
              dot={false}
              stroke="#179cde"
              strokeWidth={2}
              data={data.allHistory.filter((d) => d.platform === "CF")}
              isAnimationActive={true}
            />
            <Line
              type="monotone"
              dataKey="rating"
              name="CodeChef Rating"
              dot={false}
              stroke="#3d4451"
              strokeWidth={2}
              data={data.allHistory.filter((d) => d.platform === "CC")}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <hr style={baseStyles.hr} />
    </div>
  );
};

export default UnifiedDashboard;
