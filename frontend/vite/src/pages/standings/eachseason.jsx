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
        return <div className="min-h-screen bg-[#090D16] flex items-center justify-center text-slate-500">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-[#090D16] py-12 text-[#E2E8F0]">
            <div className="max-w-5xl mx-auto px-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Season {data.season ? data.season.seasonId : "..."} Leaderboard
                    </h1>
                </div>

                {data.standings && data.standings.length > 0 ? (
                    <div className="flex flex-col gap-y-2 w-full">
                        {/* Header Row */}
                        <div className="px-6 py-4 grid grid-cols-[80px_1fr_120px_120px_100px] gap-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            <div>Rank</div>
                            <div>User</div>
                            <div className="text-right">Elo</div>
                            <div className="text-right">Accuracy</div>
                            <div className="text-right">Solved</div>
                        </div>

                        {/* Leaderboard Rows */}
                        {data.standings.map((user) => (
                            <div 
                                key={user.userId}
                                className="bg-[#121826] border border-slate-800/40 px-6 py-4 grid grid-cols-[80px_1fr_120px_120px_100px] gap-4 items-center hover:bg-[#1a2233] transition-colors"
                            >
                                {/* Rank */}
                                <div className={`font-bold ${user.rank <= 3 ? "text-[#FFD700]" : "text-white"}`}>
                                    #{user.rank}
                                </div>
                                
                                {/* User & Badge */}
                                <div className="flex items-center gap-3">
                                    <span className="font-medium text-white">{user.name}</span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 border border-slate-700">
                                        {user.rankTier?.name || "NEWBIE"}
                                    </span>
                                </div>
                                
                                {/* ELO */}
                                <div className="text-right font-mono font-bold text-[#38BDF8]">
                                    {user.elo}
                                </div>

                                {/* Accuracy */}
                                <div className="text-right font-mono text-slate-400">
                                    {user.accuracy}%
                                </div>

                                {/* Solved */}
                                <div className="text-right font-mono text-slate-400">
                                    {user.solved}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 border border-slate-800/40 rounded-xl bg-[#121826]/20 text-center">
                        <h3 className="text-lg font-medium text-slate-400">No participants yet</h3>
                    </div>
                )}

                {/* Pagination Controls */}
                {data.standings && data.standings.length > 0 && (
                    <div className="flex justify-between items-center mt-8">
                        <button 
                            disabled={!data.pagination.hasPrevPage}
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 py-2 bg-[#121826] border border-slate-800 text-slate-300 rounded-lg hover:border-slate-600 disabled:opacity-30 transition-all"
                        >Previous</button>
                        
                        <span className="text-slate-500 text-sm">
                            Page {data.pagination.currentPage} of {data.pagination.totalpages}
                        </span>
                        
                        <button 
                            disabled={!data.pagination.hasNextPage}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-2 bg-[#121826] border border-slate-800 text-slate-300 rounded-lg hover:border-slate-600 disabled:opacity-30 transition-all"
                        >Next</button>
                    </div>
                )}
            </div>
        </div>
    );
}