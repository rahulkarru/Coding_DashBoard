import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- CONFIGURATION: YOUR UNIFIED HANDLE ---
const USER_HANDLE = "rahul_karru";
const CF_HANDLE = USER_HANDLE;
const LC_HANDLE = USER_HANDLE;
const CC_HANDLE = USER_HANDLE;
// ------------------------------------------

const CODECHEF_API_BASE_URL = "https://codechef-api.vercel.app/handle"; // Verified from search
const LEETCODE_API_BASE_URL = "https://alfa-leetcode-api.onrender.com"; // Verified from search
// ----------------------------------
// --- 1. CODEFORCES FETCHER (Reliable Official API) ---
const fetchCodeforcesData = async () => {
  const infoUrl = `https://codeforces.com/api/user.info?handles=${CF_HANDLE}`;
  const ratingUrl = `https://codeforces.com/api/user.rating?handle=${CF_HANDLE}`;

  try {
    const [infoRes, ratingRes] = await Promise.all([
      axios.get(infoUrl),
      axios.get(ratingUrl)
    ]);

    if (infoRes.data.status !== 'OK' || ratingRes.data.status !== 'OK') {
        throw new Error("Codeforces API failed to return OK status.");
    }
    
    // Process rating history for the chart
    const history = ratingRes.data.result.map(entry => ({
      date: new Date(entry.ratingUpdateTimeSeconds * 1000).toLocaleDateString(),
      rating: entry.newRating,
      platform: 'CF',
      contest: entry.contestName
    }));

    return { 
      summary: infoRes.data.result[0], // Contains current and max rating/rank
      history: history 
    };
  } catch (error) {
    console.error("Codeforces Fetch Error:", error.message);
    return { summary: { handle: CF_HANDLE, rating: 'N/A (Error)', maxRating: 'N/A', rank: 'N/A' }, history: [] };
  }
};


const fetchAggregatedData = async (handle, platform) => {
    
    try {
        if (platform === 'LC') {
            // LeetCode: Fetches the total solved count and difficulty breakdown
            const solvedUrl = `${LEETCODE_API_BASE_URL}/${handle}/solved`;
            const response = await axios.get(solvedUrl);
            const data = response.data;
        
            return {
                // Mapped to the specific fields from the 'alfa-leetcode-api'
                totalSolved: data.solvedAll || 'N/A', 
                easy: data.easySolved || 'N/A',
                medium: data.mediumSolved || 'N/A',
                hard: data.hardSolved || 'N/A',
                peakRating: 'N/A' // Contest rating is often a separate API call on this service
            };
        }
        
        else if (platform === 'CC') {
            // CodeChef: Fetches main profile stats
            const ccUrl = `${CODECHEF_API_BASE_URL}/${handle}`;
            const response = await axios.get(ccUrl);
            const data = response.data; 
            
            // This mapping assumes the API response contains data.rating, data.maxRating, and data.stars.
            // You may need to inspect the network response and slightly adjust 'data.rating' if the key is different.
            return {
                currentRating: data.rating || 'N/A', 
                starRating: data.stars || 'N/A',
                peakRating: data.maxRating || 'N/A',
                // This specific API might not return a clean history array; if it fails, try the competeapi service.
                history: data.rating_changes || data.history || [] 
            };
        }
    } catch (error) {
        console.error(`Error fetching ${platform} data. Check the specific API URL:`, error.message);
        return platform === 'LC' 
            ? { totalSolved: 'API Error', hard: 'N/A', easy: 'N/A', medium: 'N/A', peakRating: 'N/A' } 
            : { currentRating: 'API Error', peakRating: 'N/A', starRating: 'N/A', history: [] };
    }
    // Return empty fallback if platform is unrecognized
    return {};
};

const UnifiedDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAllData = async () => {
            setLoading(true);
            try {
                // Fetch all data concurrently
                const [cfData, lcData, ccData] = await Promise.all([
                    fetchCodeforcesData(),
                    fetchAggregatedData(LC_HANDLE, 'LC'),
                    fetchAggregatedData(CC_HANDLE, 'CC')
                ]);

                // Combine histories and sort by date for the chart
                const combinedHistory = [
                    ...cfData.history, 
                    ...(ccData.history || [])
                ].sort((a, b) => new Date(a.date) - new Date(b.date));

                setData({ cf: cfData, lc: lcData, cc: ccData, allHistory: combinedHistory });
            } catch (err) {
                console.error("Failed to load dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };

        loadAllData();
        // Set up daily refresh (24 hours)
        const intervalId = setInterval(loadAllData, 24 * 60 * 60 * 1000); 

        return () => clearInterval(intervalId);
    }, []);

    if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading Unified CP Data...</div>;
    if (!data) return <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>Error loading dashboard data.</div>;

    // --- RENDERING LOGIC ---
    return (
        <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Arial' }}>
            <h1>🚀 Unified Competitive Programming Profile: {USER_HANDLE}</h1>
            <p>Data last updated: {new Date().toLocaleString()}</p>
            <hr />

            {/* --- Key Metrics Grid --- */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
                <PlatformCard 
                    name="Codeforces" 
                    rating={data.cf.summary.rating} 
                    peak={data.cf.summary.maxRating} 
                    rank={data.cf.summary.rank} 
                    link={`https://codeforces.com/profile/${CF_HANDLE}`}
                />
                <PlatformCard 
                    name="CodeChef" 
                    rating={data.cc.currentRating} 
                    peak={data.cc.peakRating} 
                    rank={data.cc.starRating} 
                    link={`https://www.codechef.com/users/${CC_HANDLE}`}
                />
                <LeetCodeCard 
                    name="LeetCode" 
                    totalSolved={data.lc.totalSolved} 
                    hard={data.lc.hard} 
                    peakRating={data.lc.peakRating} 
                    link={`https://leetcode.com/u/${LC_HANDLE}`}
                />
            </div>
            
            <hr />
            
            {/* --- Rating Trend Chart (Combined) --- */}
            <h2>📊 Consolidated Rating Trend (Codeforces & CodeChef)</h2>
            <ResponsiveContainer width="100%" height={350}>
                <LineChart data={data.allHistory} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}/>
                    
                    {/* CF Line */}
                    <Line 
                        type="monotone" 
                        dataKey="rating" 
                        stroke="#179cde" 
                        strokeWidth={2} 
                        name="Codeforces Rating" 
                        dot={false} 
                        data={data.allHistory.filter(d => d.platform === 'CF')}
                    />
                    
                    {/* CC Line */}
                    <Line 
                        type="monotone" 
                        dataKey="rating" 
                        stroke="#3d4451" 
                        strokeWidth={2} 
                        name="CodeChef Rating" 
                        dot={false} 
                        data={data.allHistory.filter(d => d.platform === 'CC')}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

// Reusable Card Component for CF/CC
const PlatformCard = ({ name, rating, peak, rank, link }) => (
    <a href={link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ 
            border: `2px solid ${name === 'Codeforces' ? '#179cde' : '#3d4451'}`, 
            padding: '20px', 
            borderRadius: '12px', 
            textAlign: 'center',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            transition: '0.3s'
        }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#555' }}>{name}</h3>
            <p style={{ fontSize: '2.5em', margin: '0', color: '#000', fontWeight: 'bold' }}>{rating}</p>
            <p style={{ margin: '5px 0', color: 'green', fontWeight: 'bold' }}>{rank}</p>
            <p style={{ fontSize: '0.9em', color: '#888' }}>Peak: {peak}</p>
        </div>
    </a>
);

// Specific Card for LeetCode
const LeetCodeCard = ({ name, totalSolved, hard, peakRating, link }) => (
    <a href={link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ 
            border: `2px solid #f89f1b`, 
            padding: '20px', 
            borderRadius: '12px', 
            textAlign: 'center',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            transition: '0.3s'
        }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#555' }}>{name}</h3>
            <p style={{ fontSize: '2.5em', margin: '0', color: '#000', fontWeight: 'bold' }}>{totalSolved}</p>
            <p style={{ margin: '5px 0', color: 'green', fontWeight: 'bold' }}>Total Solved</p>
            <p style={{ fontSize: '0.9em', color: '#888' }}>Hard: {hard} | Contest Rating: {peakRating}</p>
        </div>
    </a>
);

export default UnifiedDashboard;