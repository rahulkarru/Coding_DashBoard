import axios from "axios";

const CODECHEF_API_BASE_URL = "https://codechef-api.vercel.app/handle";

export const fetchCodeChef = async (handle) => {
  try {
    const ccUrl = `${CODECHEF_API_BASE_URL}/${handle}`;
    const response = await axios.get(ccUrl);
    const data = response.data || {};

    const history = (data.rating_changes || data.history || []).map((e) => ({
      date: e.date || e.contest?.end_date || "",
      rating: e.rating || e.newRating || e.new_rating || 0,
      platform: "CC",
      contest: e.name || e.contest?.name || "Contest",
    }));

    return {
      currentRating: data.rating ?? "N/A",
      starRating: data.stars ?? "N/A",
      peakRating: data.maxRating ?? data.rating ?? "N/A",
      history,
    };
  } catch (err) {
    console.error(`CodeChef API error for ${handle}:`, err.message);
    return { currentRating: "API Fail", peakRating: "API Fail", starRating: "N/A", history: [] };
  }
};
