import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { useSelector } from 'react-redux';
import axiosClient from '../../utils/axiosClient';

export default function ThisSeason() {
    const { sid } = useParams();
    const { user } = useSelector(state => state.auth);
    const [data, setData] = useState({ season: null, standings: [], pagination: {} });
    const [myStats, setMyStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                const response = await axiosClient.get(`/leaderboard/${sid}?page=${page}&limit=20`);
                console.log(response.data);
                setData(response.data);
            } catch (err) {
                console.error("Failed to fetch leaderboard:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboard();
    }, [sid, page]);

    useEffect(() => {
        if (data.season && user) {
            axiosClient.get(`/leaderboard/mystats/${data.season.seasonId}`)
                .then(res => {
                    if (res.data.mystats) {
                        setMyStats(res.data.mystats);
                    }
                })
                .catch(err => console.error("Failed to fetch my stats:", err));
        }
    }, [data.season, user]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#070C15] flex flex-col items-center justify-center text-slate-500 font-mono text-xs gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></span>
                Initializing Pipeline Records...
            </div>
        );
    }

    // Helper functions to accurately match the tier and rank color mechanics of image_09a4fa.png
    const getRankColor = (rank) => {
        if (rank === 1) return 'text-[#FFD700] drop-shadow-[0_0_8px_rgba(255,215,0,0.2)]';
        if (rank === 2) return 'text-[#E2E8F0]';
        if (rank === 3) return 'text-[#CD7F32]';
        return 'text-slate-400';
    };

    const getBadgeStyles = (tierName) => {
    const normalized = (tierName || 'NEWBIE').toUpperCase();
    switch (normalized) {
        case 'GOD':
            return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
        case 'MONARCH':
            return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        case 'HONOURED ONE':
            return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
        case 'EXPERT':
            return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        case 'ADEPT':
            return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        default:
            return 'bg-slate-800/60 text-slate-400 border-slate-700/30';
    }
};

    return (
        <div className="min-h-screen bg-[#070C15] py-12 text-[#E2E8F0]">
            <div className="max-w-5xl mx-auto px-6 space-y-6">
                
                {/* Header Profile Title - Designed matching image_09a4fa.png */}
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-7 h-7">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.504-1.125-1.125-1.125h-6.75a1.125 1.125 0 0 0-1.125 1.125v3.375m9 0M9 15V4.125c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V15M9.75 3V1.5c0-.414.336-.75.75-.75h3c.414 0 .75.336.75.75V3M3 10.5h18" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-black uppercase tracking-wider font-sans text-white">
                            Global Leaderboard
                        </h1>
                    </div>
                    <p className="text-sm font-semibold font-mono text-slate-500">
                        Season {data.season ? data.season.seasonId : "1"}
                    </p>
                </div>

                {data.standings && data.standings.length > 0 ? (
                    /* Unified Main Grid Board Container Frame */
                    <div className="bg-[#0B111E]/80 backdrop-blur-md border border-slate-800/80 rounded-xl overflow-hidden shadow-2xl">
                        
                        {/* Table Structured Header Grid Column Element Row */}
                        <div className="px-6 py-4 grid grid-cols-[80px_1fr_120px_140px_100px] gap-4 text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-800/60 bg-[#121826]/30 font-mono">
                            <div>Rank</div>
                            <div>User</div>
                            <div className="text-right">Elo</div>
                            <div className="text-right">Accuracy</div>
                            <div className="text-right">Solved</div>
                        </div>

                        {/* Leaderboard Stack Content Entries Matrix */}
                        <div className="divide-y divide-slate-800/40 relative">
                            {data.standings.map((u) => {
                                const isCurrentUser = user && u.userId === user._id;
                                return (
                                    <div 
                                        key={u.userId}
                                        className={`px-6 py-3.5 grid grid-cols-[80px_1fr_120px_140px_100px] gap-4 items-center transition-all duration-150 ease-out ${isCurrentUser ? 'bg-indigo-500/10 border-l-2 border-indigo-500' : 'bg-transparent hover:bg-[#121826]/40'}`}
                                    >
                                        {/* Rank Marker Layout */}
                                        <div className={`font-mono font-bold text-sm ${getRankColor(u.rank)}`}>
                                            #{u.rank}
                                        </div>
                                        
                                        {/* User Block Matrix Badge Combination */}
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className={`font-mono text-sm truncate font-semibold ${isCurrentUser ? 'text-indigo-300' : 'text-slate-200'}`}>
                                                {u.name}
                                                {isCurrentUser && <span className="ml-2 text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded uppercase tracking-widest">You</span>}
                                            </span>
                                            <span className={`text-[9px] font-black tracking-wider px-2 py-0.5 rounded border uppercase shrink-0 font-mono ${getBadgeStyles(u.rankTier?.currentRank.name)}`}>
                                                {u.rankTier?.currentRank.name || "NEWBIE"}
                                            </span>
                                        </div>
                                        
                                        {/* ELO Custom Render Metric */}
                                        <div className="text-right font-mono font-black text-sm text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.15)]">
                                            {u.elo}
                                        </div>

                                        {/* System Accuracy Parameter */}
                                        <div className="text-right font-mono text-xs text-slate-400 font-medium">
                                            {u.accuracy}%
                                        </div>

                                        {/* Solved Module Counter Value */}
                                        <div className="text-right font-mono text-xs text-slate-400 font-medium">
                                            {u.solved}
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {user && myStats && !data.standings.some(u => u.userId === user._id) && (
                                <div className="px-6 py-3.5 grid grid-cols-[80px_1fr_120px_140px_100px] gap-4 items-center bg-[#121826] border-t-2 border-indigo-500/50 mt-2 relative shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
                                    <div className="font-mono font-bold text-sm text-slate-500">
                                        --
                                    </div>
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className="font-mono text-sm text-indigo-300 truncate font-semibold">
                                            {user.firstName || 'You'}
                                            <span className="ml-2 text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded uppercase tracking-widest">You</span>
                                        </span>
                                        <span className={`text-[9px] font-black tracking-wider px-2 py-0.5 rounded border uppercase shrink-0 font-mono ${getBadgeStyles(myStats.rank)}`}>
                                            {myStats.rank || "NEWBIE"}
                                        </span>
                                    </div>
                                    <div className="text-right font-mono font-black text-sm text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.15)]">
                                        {myStats.elo}
                                    </div>
                                    <div className="text-right font-mono text-xs text-slate-400 font-medium">
                                        {myStats.accuracy}%
                                    </div>
                                    <div className="text-right font-mono text-xs text-slate-400 font-medium">
                                        {myStats.problemsSolved}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Fallback Empty Table Frame Design */
                    <div className="flex flex-col items-center justify-center py-20 border border-dashed border-slate-800 rounded-xl bg-[#121826]/10 text-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/50 text-slate-500 border border-slate-800/60 mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z" />
                            </svg>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-400">No Active Target Records</h3>
                        <p className="text-xs text-slate-500 mt-1 italic max-w-xs">Data streams are empty. No alternate execution cycles processed for this sequence yet.</p>
                    </div>
                )}

                {/* Pagination Controls Matching Zcode Theme Structure */}
                {data.standings && data.standings.length > 0 && (
                    <div className="flex justify-between items-center pt-4 border-t border-slate-800/40">
                        <button 
                            disabled={!data.pagination.hasPrevPage}
                            onClick={() => setPage(p => p - 1)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-[#121826]/70 border border-slate-800/80 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 rounded-xl hover:border-indigo-500/40 hover:bg-[#161F30] hover:text-white disabled:opacity-20 disabled:hover:bg-[#121826]/70 disabled:hover:border-slate-800/80 disabled:hover:text-slate-400 transition-all duration-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                            </svg>
                            Prev Page
                        </button>
                        
                        <span className="text-slate-500 font-mono text-xs font-semibold">
                            Sector {data.pagination.currentPage} // {data.pagination.totalpages || 1}
                        </span>
                        
                        <button 
                            disabled={!data.pagination.hasNextPage}
                            onClick={() => setPage(p => p + 1)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-[#121826]/70 border border-slate-800/80 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 rounded-xl hover:border-indigo-500/40 hover:bg-[#161F30] hover:text-white disabled:opacity-20 disabled:hover:bg-[#121826]/70 disabled:hover:border-slate-800/80 disabled:hover:text-slate-400 transition-all duration-200"
                        >
                            Next Page
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}