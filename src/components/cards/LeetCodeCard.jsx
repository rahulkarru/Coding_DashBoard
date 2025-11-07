import React, { useState } from "react";
import axios from "axios";
import BasePlatformCard from "./BasePlatformCard";
import { RotateCw } from "lucide-react"; // optional: or use 🔄 emoji

const API_BASE = "https://leetcode-api-0dvi.onrender.com"; // replace with your Render URL
const USER_HANDLE = "rahul_karru";

const LeetCodeCard = ({ rating, contestsAttended, link }) => {
  const [syncing, setSyncing] = useState(false);
  const [hover, setHover] = useState(false);

  const handleSync = async (e) => {
    e.preventDefault();
    if (syncing) return;
    try {
      setSyncing(true);
      await axios.get(`${API_BASE}/update/${USER_HANDLE}`);
      alert("✅ LeetCode data refreshed!");
      window.location.reload();
    } catch (err) {
      console.error("❌ Sync failed:", err);
      alert("❌ Failed to refresh LeetCode data.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ position: "relative" }}
    >
      <BasePlatformCard
        platformName="LeetCode"
        title="LeetCode"
        big={rating || "N/A"}
        mid={`Contests: ${contestsAttended || "N/A"}`}
       
        link={link}
      />
      {hover && (
        <button
          onClick={handleSync}
          disabled={syncing}
          title="Refresh LeetCode Data"
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: syncing ? "#ccc" : "#f89f1b",
            border: "none",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            cursor: syncing ? "not-allowed" : "pointer",
            color: "white",
            fontSize: "18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 8px rgba(0,0,0,0.15)",
            transition: "transform 0.2s ease",
          }}
        >
          {syncing ? "⏳" : <RotateCw size={18} />}
        </button>
      )}
    </div>
  );
};

export default LeetCodeCard;
