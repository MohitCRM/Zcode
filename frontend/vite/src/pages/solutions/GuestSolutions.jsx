import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../utils/axiosClient';

export default function GuestSolutions() {
    const [data, setData] = useState({
        problems: [],
        problemsSolved: [],
        pagination: {
            currentPage: 1,
            totalpages: 1,
            hasNextPage: false,
            hasPrevPage: false
        }
    });
    const [loading, setLoading] = useState(true);
    const [errorState, setErrorState] = useState(null);
    const navigate = useNavigate();

    // Helper for difficulty styling
    const getDifficultyStyle = (difficulty) => {
        const diff = difficulty?.toLowerCase();
        if (diff === 'easy') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        if (diff === 'medium') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        if (diff === 'hard') return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    };

    const fetchProblems = async (page = 1) => {
        setLoading(true);
        try {
            const response = await axiosClient.get(`/problem/guestfetchallproblems?page=${page}&limit=10`);
            setData(response.data);
            setErrorState(null);
        } catch (err) {
            const msg = err.response?.data?.message || err.message || "Failed to load solutions.";
            setErrorState(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProblems(1);
    }, []);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= data.pagination.totalpages) {
            fetchProblems(newPage);
        }
    };

    if (loading) return <div className="min-h-screen bg-[#090D16] flex items-center justify-center text-slate-500">Loading sandbox solutions...</div>;

    return (
        <div className="min-h-screen bg-[#090D16] text-slate-200 py-12 px-6">
            {/* Background Pattern */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#161F30_1px,transparent_1px),linear-gradient(to_bottom,#161F30_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none z-0"></div>

            <main className="mx-auto max-w-7xl relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                            Sandbox Solutions Hub
                        </h1>
                        <p className="mt-2 text-sm text-slate-400">Review all community submissions and reference solutions in Guest Mode.</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
                            Guest Sandbox
                        </span>
                    </div>
                </div>
                
                {errorState ? (
                    <div className="bg-[#121826] border border-rose-500/20 p-8 rounded-xl text-center text-rose-400 shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-2">Error</h2>
                        <p>{errorState}</p>
                    </div>
                ) : (
                <div role="table" className="flex flex-col gap-y-2.5 w-full">
                    {/* Header Row */}
                    <div className="bg-[#121826]/40 border border-slate-800/40 rounded-xl px-6 py-3.5 grid grid-cols-[80px_1fr_200px_220px] gap-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <div className="text-center">Season</div>
                        <div>Title</div>
                        <div>Difficulty & Stakes</div>
                        <div>Tags</div>
                    </div>

                    {/* Problem Rows */}
                    <div className="flex flex-col gap-y-2">
                        {data.problems?.map((prob, index) => {
                            const isSolved = data.problemsSolved.some(s => s._id === prob._id);
                            return (
                            <div 
                                key={prob._id}
                                onClick={() => navigate(`/dashboard/solutions/${prob._id}`)}
                                role="row" 
                                className="group bg-[#121826]/70 backdrop-blur-sm rounded-xl border border-slate-800/60 p-5 grid grid-cols-[80px_1fr_200px_220px] gap-4 items-center shadow-lg hover:border-indigo-500/40 hover:bg-[#161F30] hover:shadow-[0_0_30px_-5px_rgba(79,70,229,0.15)] transition-all cursor-pointer"
                            >
                                <div className="flex justify-center">
                                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-800 text-slate-400">
                                        S{prob.seasonId || '?'}
                                    </span>
                                </div>

                                <div className="font-medium text-slate-300 group-hover:text-white truncate flex items-center">
                                    <span className="text-slate-600 font-normal mr-1.5">{(data.pagination.currentPage - 1) * 10 + index + 1}.</span> {prob.title}
                                    {isSolved && (
                                        <span className="ml-2 text-emerald-500">✓</span>
                                    )}
                                </div>
                                
                                <div className="flex flex-col gap-1">
                                    <div>
                                        <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-semibold border ${getDifficultyStyle(prob.difficulty)}`}>
                                            {prob.difficulty?.charAt(0).toUpperCase() + prob.difficulty?.slice(1)}
                                        </span>
                                    </div>
                                    <div className="text-[11px] font-medium flex items-center gap-1.5">
                                        <span className="text-emerald-400">+{prob.baseEloReward}</span>
                                        <span className="text-slate-600">/</span>
                                        <span className="text-rose-400">-{prob.penaltyWrongAnswer} Elo</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                    {prob.tags?.map(tag => (
                                        <span key={tag} className="rounded-md bg-slate-800/80 px-2 py-0.5 text-xs font-medium text-slate-400 border border-slate-700/30">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            );
                        })}

                        {data.problems?.length === 0 && (
                            <div className="text-center py-10 text-slate-500">
                                No solutions found.
                            </div>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {data.pagination?.totalpages > 1 && (
                        <div className="mt-8 flex justify-center items-center gap-4">
                            <button 
                                onClick={() => handlePageChange(data.pagination.currentPage - 1)}
                                disabled={!data.pagination.hasPrevPage}
                                className="px-4 py-2 rounded-lg bg-[#121826] border border-slate-700 text-slate-300 hover:bg-[#161F30] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                            >
                                Previous
                            </button>
                            <span className="text-sm font-medium text-slate-400">
                                Page <span className="text-white">{data.pagination.currentPage}</span> of {data.pagination.totalpages}
                            </span>
                            <button 
                                onClick={() => handlePageChange(data.pagination.currentPage + 1)}
                                disabled={!data.pagination.hasNextPage}
                                className="px-4 py-2 rounded-lg bg-[#121826] border border-slate-700 text-slate-300 hover:bg-[#161F30] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
                )}
            </main>
        </div>
    );
}
