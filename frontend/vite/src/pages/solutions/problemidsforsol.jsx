import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../utils/axiosClient';

export default function Problemidsforsol() {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activePhase, setActivePhase] = useState("");
    const navigate = useNavigate();

    // Helper for difficulty styling
    const getDifficultyStyle = (difficulty) => {
        const diff = difficulty?.toLowerCase();
        if (diff === 'easy') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        if (diff === 'medium') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        if (diff === 'hard') return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    };

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const res = await axiosClient.get("/solution/all");
                setProblems(res.data.problems);
                setActivePhase(res.data.activePhase);
            } catch (err) {
                console.error("Failed to fetch problems:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProblems();
    }, []);

    if (loading) return <div className="min-h-screen bg-[#090D16] flex items-center justify-center text-slate-500">Loading...</div>;

    return (
        <div className="min-h-screen bg-[#090D16] text-slate-200 py-12 px-6">
            {/* Background Pattern */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#161F30_1px,transparent_1px),linear-gradient(to_bottom,#161F30_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none z-0"></div>

            <main className="mx-auto max-w-7xl relative z-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                        Solutions Hub
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-widest">
                            {activePhase}
                        </span>
                    </h1>
                    <p className="mt-2 text-sm text-slate-400">Review community submissions and official reference solutions.</p>
                </div>

                <div role="table" className="flex flex-col gap-y-2.5 w-full">
                    {/* Header Row */}
                    <div className="bg-[#121826]/40 border border-slate-800/40 rounded-xl px-6 py-3.5 grid grid-cols-[1fr_200px_220px] gap-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <div>Title</div>
                        <div>Difficulty & Stakes</div>
                        <div>Tags</div>
                    </div>

                    {/* Problem Rows */}
                    <div className="flex flex-col gap-y-2">
                        {problems.map((prob, index) => (
                            <div 
                                key={prob._id}
                                onClick={() => navigate(`/solutions/${prob._id}`)}
                                role="row" 
                                className="group bg-[#121826]/70 backdrop-blur-sm rounded-xl border border-slate-800/60 p-5 grid grid-cols-[1fr_200px_220px] gap-4 items-center shadow-lg hover:border-indigo-500/40 hover:bg-[#161F30] hover:shadow-[0_0_30px_-5px_rgba(79,70,229,0.15)] transition-all cursor-pointer"
                            >
                                <div className="font-medium text-slate-300 group-hover:text-white truncate">
                                    <span className="text-slate-600 font-normal mr-1.5">{index + 1}.</span> {prob.title}
                                </div>
                                
                                <div className="flex flex-col gap-1">
                                    <div>
                                        <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-semibold border ${getDifficultyStyle(prob.difficulty)}`}>
                                            {prob.difficulty.charAt(0).toUpperCase() + prob.difficulty.slice(1)}
                                        </span>
                                    </div>
                                    <div className="text-[11px] font-medium flex items-center gap-1.5">
                                        <span className="text-emerald-400">+{prob.baseEloReward}</span>
                                        <span className="text-slate-600">/</span>
                                        <span className="text-rose-400">-{prob.penaltyWrongAnswer} Elo</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                    {prob.tags.map(tag => (
                                        <span key={tag} className="rounded-md bg-slate-800/80 px-2 py-0.5 text-xs font-medium text-slate-400 border border-slate-700/30">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}