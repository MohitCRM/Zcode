import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import axiosClient from '../../utils/axiosClient';

export default function ThisSeason() {
    const { sid } = useParams();
    const [data, setData] = useState({ season: null, standings: [], pagination: {} });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                const response = await axiosClient.get(`/leaderboard/${sid}?page=${page}&limit=20`);
                setData(response.data);
            } catch (err) {
                console.error("Failed to fetch leaderboard:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, [sid, page]);

    if (loading) {
        return <div className="min-h-screen bg-[#090D16] flex items-center justify-center text-white">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-[#090D16] p-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-6">
                    Season {data.season ? data.season.seasonId : "..."} Leaderboard
                </h1>

                {data.standings && data.standings.length > 0 ? (
                    <div className="bg-[#121826]/40 border border-slate-800 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-sm text-slate-300">
                            <thead className="bg-[#121826]/80 text-slate-500 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">Rank</th>
                                    <th className="px-6 py-4">Player</th>
                                    <th className="px-6 py-4">Tier</th>
                                    <th className="px-6 py-4 text-right">ELO</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {data.standings.map((user) => (
                                    <tr key={user.userId} className="hover:bg-[#161F30] transition-colors">
                                        <td className="px-6 py-4 font-semibold">{user.rank}</td>
                                        <td className="px-6 py-4 font-medium text-white">{user.name}</td>
                                        <td className="px-6 py-4 flex items-center gap-2">
                                            <img src={user.rankTier.badge} alt={user.rankTier.name} className="w-6 h-6" />
                                            <span style={{ color: user.rankTier.color }}>{user.rankTier.name}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-indigo-400">{user.elo}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 border border-slate-800 rounded-xl bg-[#121826]/20 text-center">
                        <h3 className="text-lg font-medium text-slate-400">No participants yet</h3>
                        <p className="text-slate-600 text-sm">Be the first to climb the leaderboard!</p>
                    </div>
                )}

                {/* Pagination Controls */}
                {data.standings && data.standings.length > 0 && (
                    <div className="flex justify-between items-center mt-6">
                        <button 
                            disabled={!data.pagination.hasPrevPage}
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 transition-opacity hover:bg-slate-700"
                        >Previous</button>
                        
                        <span className="text-slate-400">
                            Page {data.pagination.currentPage} of {data.pagination.totalpages}
                        </span>
                        
                        <button 
                            disabled={!data.pagination.hasNextPage}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-2 bg-slate-800 text-white rounded-lg disabled:opacity-50 transition-opacity hover:bg-slate-700"
                        >Next</button>
                    </div>
                )}
            </div>
        </div>
    );
}