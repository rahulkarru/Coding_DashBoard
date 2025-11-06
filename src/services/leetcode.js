import axios from "axios";

const LEETCODE_API_BASE_URL = "https://alfa-leetcode-api.onrender.com";

export const fetchLeetCode = async (handle) => {
  try {
    const solvedUrl = `${LEETCODE_API_BASE_URL}/Solved/${handle}/solved`;
    const contestUrl = `${LEETCODE_API_BASE_URL}/Contest/${handle}/contest`;

    const [solvedResponse, contestResponse] = await Promise.all([
      axios.get(solvedUrl),
      axios.get(contestUrl),
    ]);

    const solvedData = solvedResponse?.data || {};
    const contestData = contestResponse?.data || {};

    return {
      totalSolved: solvedData.solvedAll ?? "N/A",
      easy: solvedData.easySolved ?? "N/A",
      medium: solvedData.mediumSolved ?? "N/A",
      hard: solvedData.hardSolved ?? "N/A",
      peakRating: contestData?.contestRanking ? Math.round(contestData.contestRanking.rating) : "N/A",
    };
  } catch (err) {
    console.error(`LeetCode API error for ${handle}:`, err.message);
    return { totalSolved: "API Fail", hard: "N/A", easy: "N/A", medium: "N/A", peakRating: "API Fail" };
  }
};
