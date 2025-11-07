// src/services/codechef.js
import axios from "axios";

const CODECHEF_API_BASE_URL = "https://codechef-api.vercel.app/handle";

export const fetchCodeChef = async (handle) => {
  try {
    const { data } = await axios.get(`${CODECHEF_API_BASE_URL}/${handle}`);

    const currentRating = data.rating ?? "N/A";
    const peakRating = data.maxRating ?? "N/A";
    const contests = data.contests ?? data.rating_changes?.length ?? "N/A";

    // Derive division
    let division = "N/A";
    if (currentRating >= 2000) division = "Div 1";
    else if (currentRating >= 1600) division = "Div 2";
    else division = "Div 3";

    return {
      division,
      contestsAttended: contests,
      currentRating,
      peakRating,
    };
  } catch (error) {
    console.error("❌ CodeChef Fetch Error:", error.message);
    return {
      division: "API Fail",
      contestsAttended: "N/A",
      currentRating: "N/A",
      peakRating: "N/A",
    };
  }
};
