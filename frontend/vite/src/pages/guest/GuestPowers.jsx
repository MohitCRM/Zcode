import { useState } from "react";
import axiosClient from "../../utils/axiosClient";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function GuestPowers() {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        elo: 100,
        acceptedSubmissionsCount: 0,
        wrongSubmissionsCount: 0
    });
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setStats({ ...stats, [e.target.name]: parseInt(e.target.value) || 0 });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);
        setLoading(true);

        try {
            const response = await axiosClient.put('/leaderboard/guest/manipulate-stats', stats);
            setMessage(response.data.message);
        } catch (err) {
            setError(err.response?.data?.error || err.message || "Failed to update stats");
        } finally {
            setLoading(false);
        }
    };

    if (user?.role !== 'guest') {
        return (
            <div className="min-h-screen bg-[#090D16] flex items-center justify-center text-rose-400">
                Access Denied: Only guest users can access this page.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#090D16] py-12 text-slate-300">
            <div className="mx-auto max-w-2xl px-6">
                <div className="mb-8 flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Guest Powers</h1>
                        <p className="text-sm text-slate-400">Manipulate your Elo and submission stats for testing.</p>
                    </div>
                    <button 
                        onClick={() => navigate(-1)} 
                        className="px-4 py-2 bg-[#121826]/80 border border-slate-700/50 rounded-lg text-sm text-slate-300 hover:bg-[#1a2333] hover:border-slate-600 transition-colors"
                    >
                        Go Back
                    </button>
                </div>

                <div className="bg-[#121826]/70 border border-slate-800/60 rounded-xl p-6 backdrop-blur-sm">
                    {message && (
                        <div className="mb-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4 text-emerald-400 text-sm">
                            {message}
                        </div>
                    )}
                    {error && (
                        <div className="mb-6 rounded-lg bg-rose-500/10 border border-rose-500/20 p-4 text-rose-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-sm font-medium text-slate-400">Elo Rating</label>
                                <span className="text-indigo-400 font-bold font-mono">{stats.elo}</span>
                            </div>
                            <input 
                                type="range" 
                                name="elo" 
                                min="0"
                                max="4000"
                                step="10"
                                value={stats.elo} 
                                onChange={handleChange}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Accepted Submissions</label>
                            <input 
                                type="number" 
                                name="acceptedSubmissionsCount" 
                                value={stats.acceptedSubmissionsCount} 
                                onChange={handleChange}
                                className="w-full bg-[#0C1220] border border-slate-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1.5">Wrong Submissions</label>
                            <input 
                                type="number" 
                                name="wrongSubmissionsCount" 
                                value={stats.wrongSubmissionsCount} 
                                onChange={handleChange}
                                className="w-full bg-[#0C1220] border border-slate-700/50 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Updating..." : "Update Stats"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
