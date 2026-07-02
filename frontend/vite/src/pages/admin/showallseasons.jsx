import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from "../../utils/axiosClient";

export default function ShowAllSeasons() {
    const [seasons, setSeasons] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSeasons = async () => {
            try {
                const response = await axiosClient.get('seasons/admin/getallseasons');
                setSeasons(response.data.seasons);
            } catch (err) {
                console.error("Failed to fetch seasons:", err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSeasons();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? Deleting a season is permanent.")) return;
        try {
            await axiosClient.delete(`/seasons/delete/${id}`);
            setSeasons(seasons.filter(s => s._id !== id));
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    if (loading) return <div className="text-slate-400 p-6">Loading seasons...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-white">Season Management</h1>
                <button 
                    onClick={() => navigate('/dashboard/admin/create-season')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-all"
                >
                    + Create Season
                </button>
            </div>

            {seasons.length === 0 ? (
                <div className="text-slate-500 text-center py-20 border border-dashed border-slate-800 rounded-xl">
                    No seasons found. Create your first season to get started.
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {seasons.map((season) => (
                        <div key={season._id} className="bg-[#121826] border border-slate-800 p-5 rounded-xl flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-white font-bold text-lg">Season {season.seasonId}</h3>
                                    <div className="mt-1">
                                        {season.isGuestSeason ? (
                                            <span className="inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                                Guest
                                            </span>
                                        ) : season.isActive ? (
                                            <span className="inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                                Active
                                            </span>
                                        ) : season.isCompleted ? (
                                            <span className="inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                Completed
                                            </span>
                                        ) : (
                                            <span className="inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-400">
                                                Upcoming
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => navigate(`/dashboard/admin/update-season/${season._id}`)} 
                                        className="px-3 py-1 text-xs text-slate-400 hover:text-white bg-slate-800 rounded hover:bg-slate-700 transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(season._id)} 
                                        className="px-3 py-1 text-xs text-rose-500 hover:text-rose-400 bg-rose-500/10 rounded hover:bg-rose-500/20 transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                            <div className="text-[11px] text-slate-400 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-slate-800 pt-4">
                                <div><span className="text-slate-600">Launch:</span> {new Date(season.launchDate).toLocaleDateString()}</div>
                                <div><span className="text-slate-600">Round 1:</span> {new Date(season.round1Start).toLocaleDateString()}</div>
                                <div><span className="text-slate-600">R1 Sol:</span> {new Date(season.r1SolutionStart).toLocaleDateString()}</div>
                                <div><span className="text-slate-600">Round 2:</span> {new Date(season.round2Start).toLocaleDateString()}</div>
                                <div><span className="text-slate-600">R2 Sol:</span> {new Date(season.r2SolutionStart).toLocaleDateString()}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}