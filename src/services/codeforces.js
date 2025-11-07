import axios from "axios";

export const fetchCodeforcesData = async (handle) => {
  const infoUrl = `https://codeforces.com/api/user.info?handles=${handle}`;
  const ratingUrl = `https://codeforces.com/api/user.rating?handle=${handle}`;

  try {
    const [infoRes, ratingRes] = await Promise.all([axios.get(infoUrl), axios.get(ratingUrl)]);
    if (infoRes.data.status !== "OK" || ratingRes.data.status !== "OK") {
      throw new Error("Codeforces API failed to return OK status.");
    }

    const history = ratingRes.data.result.map((entry) => ({
      date: new Date(entry.ratingUpdateTimeSeconds * 1000).toLocaleDateString(),
      rating: entry.newRating,
      platform: "CF",
      contest: entry.contestName,
    }));

    return { 
      summary: infoRes.data.result[0], 
      history,
      contestsAttended: history.length  // New field: number of contests attended
    };
  } catch (error) {
    console.error("Codeforces Fetch Error:", error.message);
    return {
      summary: { handle, rating: "N/A (Error)", maxRating: "N/A", rank: "N/A" },
      history: [],
      contestsAttended: 0  // Default to 0 on error
    };
  }
};
