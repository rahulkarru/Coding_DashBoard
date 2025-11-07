// src/services/leetcode.js
import axios from "axios";

const LEETCODE_API = "https://leetcode-api-0dvi.onrender.com";


export const fetchLeetCode = async (handle) => {
  try {
    // Fetch both stats & history in parallel
    const [statsRes, historyRes] = await Promise.all([
      axios.get(`${LEETCODE_API}/stats/${handle}`),
      axios.get(`${LEETCODE_API}/history/${handle}`),
    ]);

    const stats = statsRes.data || {};
    const history = (historyRes.data?.history || []).map((h) => ({
      date: new Date(h.contest.startTime * 1000).toISOString().split("T")[0],
      rating: Math.round(h.rating),
      platform: "LC",
    }));

    return {
      rating: stats.rating ? Math.round(stats.rating) : "N/A",
      contestsAttended: stats.attendedContestsCount ?? "N/A",
      history,
    };
  } catch (error) {
    console.error("❌ LeetCode Fetch Error:", error.message);
    return { rating: "N/A", contestsAttended: "N/A", history: [] };
  }
};
