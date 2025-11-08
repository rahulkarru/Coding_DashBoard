// src/services/codechef.js
import axios from "axios";

const CODECHEF_API_BASE_URL = "https://codechef-api.vercel.app/handle";


const MANUAL_CODECHEF_DATA = {
  handle: "rahul_karru",
  division: "Div 3",
  contestsAttended: 31,
  currentRating: 1480,
  peakRating: 1516,
  starRating: "2★",
};

export const fetchCodeChef = async (handle) => {
  try {
    const { data } = await axios.get(`${CODECHEF_API_BASE_URL}/${handle}`);

    if (!data || !data.rating) throw new Error("Invalid API response");

    const currentRating = data.rating ?? "N/A";
    const peakRating = data.maxRating ?? "N/A";

    // Some APIs don’t return contest count, so use manual fallback if missing
    const contests =
      typeof data.contests === "number"
        ? data.contests
        : MANUAL_CODECHEF_DATA.contestsAttended;

    // Derive division based on rating
    let division = "N/A";
    if (currentRating >= 2000) division = "Div 1";
    else if (currentRating >= 1600) division = "Div 2";
    else division = "Div 3";

    // Derive star rating
    const starRating =
      typeof currentRating === "number"
        ? `${Math.floor(currentRating / 400)}★`
        : "N/A";

    // ✅ Always return a consistent object shape
    return {
      division,
      contestsAttended: 31,
      currentRating,
      peakRating,
      starRating,
      manual: false,
    };
  } catch (error) {
    console.error("❌ CodeChef API Fetch Error:", error.message);
    console.warn("⚠️ Using manual fallback CodeChef data.");

    // ✅ Return a consistent object even when API fails
    return {
      division: MANUAL_CODECHEF_DATA.division,
      contestsAttended: MANUAL_CODECHEF_DATA.contestsAttended,
      currentRating: MANUAL_CODECHEF_DATA.currentRating,
      peakRating: MANUAL_CODECHEF_DATA.peakRating,
      starRating: MANUAL_CODECHEF_DATA.starRating,
      manual: true, // 🔥 Flag to identify it's manual data
    };
  }
};
