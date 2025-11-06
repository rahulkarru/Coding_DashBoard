import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- CONFIGURATION: YOUR UNIFIED HANDLE ---
const USER_HANDLE = "rahul_karru";
const CF_HANDLE = USER_HANDLE;
const LC_HANDLE = USER_HANDLE;
const CC_HANDLE = USER_HANDLE;
// ------------------------------------------

// --- CRITICAL INTEGRATION POINT ---
// 🛑 ACTION REQUIRED: Replace this URL with the live endpoint of a community-built CP aggregator API
// (e.g., a service you found on GitHub that scrapes CodeChef/LeetCode).
const BASE_AGGREGATOR_URL = "https://your-live-cp-aggregator.com/api/v1"; 
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

// --- 2. AGGREGATOR FETCHER (Placeholder/Mock Data for CC/LC) ---
const fetchAggregatedData = async (handle, platform) => {
    // ⚠️ CRITICAL: The data you see here is the MOCK DATA.
    const url = `${BASE_AGGREGATOR_URL}/profile?platform=${platform}&handle=${handle}`;
    
    try {
        // 🚨 UNCOMMENT AND USE THIS LINE WITH A VALID URL:
        // const response = await axios.get(url); 
        // const data = response.data; 

        if (platform === 'LC') {
            // Mapping fields based on the response of your real API:
            return {
                totalSolved: 1200, // MOCK VALUE - Change to data.totalSolved
                easy: 400, 
                medium: 600, 
                hard: 200,
                peakRating: '2000+'
            };
        } else if (platform === 'CC') {
            // Mapping fields based on the response of your real API:
            return {
                currentRating: 1950, // MOCK VALUE - Change to data.currentRating
                starRating: '4-Star',
                peakRating: 2100,
                history: [ 
                    // MOCK HISTORY (Add real history array from data.history)
                    { date: '2024-01-01', rating: 1700, platform: 'CC' },
                    { date: '2024-06-01', rating: 1950, platform: 'CC' }
                ]
            };
        }
    } catch (error) {
        console.error(`Error fetching ${platform} data. Check BASE_AGGREGATOR_URL and URL structure:`, error.message);
        return platform === 'LC' 
            ? { totalSolved: 'API Fail', hard: 'N/A', easy: 'N/A', medium: 'N/A', peakRating: 'N/A' } 
            : { currentRating: 'API Fail', peakRating: 'N/A', starRating: 'N/A', history: [] };
    }
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